import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
@Injectable()
export class OpenAIService {
  private readonly openai: OpenAI;
  private readonly objectStorage: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });

    this.objectStorage = new S3Client({
      endpoint: this.configService.get<string>('NCP_STORAGE_ENDPOINT'),
      region: 'kr-standard',
      credentials: {
        accessKeyId: this.configService.get<string>('NCP_ACCESS_KEY'),
        secretAccessKey: this.configService.get<string>('NCP_SECRET_KEY'),
      },
      forcePathStyle: true,
    });
  }

  private async uploadImageToStorage(image: Buffer): Promise<{ url: string; key: string }> {
    const key = `temp-drawing/${Date.now()}-${Math.random().toString(36).substring(7)}.png`;

    await this.objectStorage.send(
      new PutObjectCommand({
        Bucket: this.configService.get<string>('NCP_BUCKET_NAME'),
        Key: key,
        Body: image,
        ContentType: 'image/png',
        ACL: 'public-read',
      }),
    );

    const url = `${this.configService.get<string>('NCP_STORAGE_ENDPOINT')}/${this.configService.get<string>('NCP_BUCKET_NAME')}/${key}`;
    return { url, key };
  }

  private async deleteImageFromStorage(key: string): Promise<void> {
    await this.objectStorage.send(
      new DeleteObjectCommand({
        Bucket: this.configService.get<string>('NCP_BUCKET_NAME'),
        Key: key,
      }),
    );
  }

  async checkDrawing(image: Buffer, answer: string) {
    let imageKey: string | null = null;

    try {
      const { url, key } = await this.uploadImageToStorage(image);
      imageKey = key;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: [
              {
                type: 'text',
                text: '너는 게임 <방해꾼은 못말려>의 정답 노출 방지 챗봇이야.\n\n방해꾼은 못말려는 실시간 드로잉 퀴즈 게임이야. 한 사람이 특정 제시어에 맞춰서 그림을 그리고, 나머지 참여자들이 그림을 보고 제시어를 맞추려고 시도하는 형식의 게임이야.\n\n게임 특성 상, 그림을 그리는 사람이 캔버스에 제시어를 직접 적어버리거나, 제시어의 초성을 적거나, 글자 수 힌트를 적으면 게임이 쉬워져. 그래서 너는 이 세 가지 경우를 잡아서 알려주면 돼.\n\nInput과 Output은 다음과 같아.\n\n<Input>\n\n- JSON으로 제시어가 들어올거야. 예를 들어, `{"subject": "코끼리"}` 형태야. `"subject"` 키 안에 내용이 들어가.\n- 동시에, 이미지가 제공될거야. 이미지는 특정 시점에 그림 그리는 사람의 화면을 캡쳐한 거야.\n\n<Output>\n\n다음 `Enum` 값 중 하나의 값을 선택해서 JSON Key `"result"`로 보내줘.\n\n1. `"OK"` : 힌트를 주려는 시도가 없는 상태일 경우에 보내야 하는 메시지야.\n2. `"LENGTH"` : 글자 수를 알려주려는 시도가 있을 때 보내야 하는 메시지야.\n3. `"INITIAL"` : 초성을 알려주려고 시도했을 때 보내야 하는 메시지야.\n4. `"FULL_ANSWER"` : 정답을 그대로 알려주려고 시도했을 때 보내야 하는 메시지야.\n\n주의 사항은 다음과 같아.\n\n- 유저는 초성을 화면 구석 쪽에 작은 글씨로 적어둘 가능성이 높아. 그 부분을 주의깊게 봐야 해.\n- 유저가 글자 수 힌트를 줄 때 그냥 숫자로 적는 경우도 있지만, 작은 원을 여러 개 그려서 그 개수로 힌트를 주는 경우가 있어. 아마 화면 구석에 적을 것이기 때문에 주의 깊게 살펴봐야 해.',
              },
            ],
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: url,
                },
              },
              {
                type: 'text',
                text: `{ "subject" : "${answer}" }`,
              },
            ],
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'result_schema',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                result: {
                  type: 'string',
                  enum: ['OK', 'LENGTH', 'INITIAL', 'FULL_ANSWER'],
                  description: 'The value must be one of the specified statuses.',
                },
              },
              required: ['result'],
              additionalProperties: false,
            },
          },
        },
        temperature: 1,
        max_completion_tokens: 2048,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });
      const result = JSON.parse(response.choices[0].message.content);

      await this.deleteImageFromStorage(key);

      return result;
    } catch (error) {
      if (imageKey) {
        await this.deleteImageFromStorage(imageKey).catch((error) => console.error('Failed to delete image: ', error));
      }
      console.error('OpenAI API Error:', error);
    }
  }

  // 제시어 생성
  async getDrawingWords(difficulty: string, count: number, category?: string): Promise<string[]> {
    const categories = ['영화', '음식', '일상용품', '스포츠', '동물', '교통수단', '캐릭터', '악기', '직업', 'IT'];
    const basicCategories = categories.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 2) + 2);

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              '당신은 창의적인 드로잉 게임의 출제자, 재밌고 다양한 단어들을 아래처럼 생각해 출제.\n1. 추상적X, 30초 내 그리기 가능성 생각\n2. 방해 요소 존재 게임성 생각\n3. 초등학생 수준 난이도인지 생각\n4. 해당하는 단어 선택\n\n<Input>\n{난이도}, {개수}, {카테고리}\n<Output>\n부연설명없이 단어만, 단어(Meme)를 쉼표로 구분 및 나열\nex) `사과, 컵, 우산, 모자, 엄마`\n부적절한 단어일 경우 `부적절`로 반환',
          },
          {
            role: 'user',
            content: `난이도=${difficulty},개수=${count},카테고리=${category ?? basicCategories.join(',')}`,
          },
        ],
        response_format: { type: 'text' },
        temperature: 0,
        max_tokens: 128,
        top_p: 1,
        frequency_penalty: 2,
        presence_penalty: 2,
      });

      return response.choices[0].message.content.split(',').map((word) => word.trim());
    } catch (error) {
      console.error('OpenAI API Error:', error);
      return []; // 에러 시 빈 배열 반환
    }
  }
}
