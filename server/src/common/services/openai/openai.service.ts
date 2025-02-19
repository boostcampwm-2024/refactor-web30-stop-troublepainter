import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
// TODO: 이미지 토큰 계산이 필요할 경우 활성화
// import * as sharp from 'sharp';

@Injectable()
export class OpenAIService {
  private readonly openai: OpenAI;
  private readonly objectStorage: S3Client;
  private readonly LOW_DETAIL_IMAGE_TOKENS = 85;

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

  // TODO: 이미지 토큰 계산이 필요할 경우 활성화
  private async calculateImageTokens(width: number, height: number): Promise<number> {
    const tilesX = Math.ceil(width / 512);
    const tilesY = Math.ceil(height / 512);
    const totalTiles = tilesX * tilesY;

    const baseTokens = 85;
    const tokenPerTile = 170;

    return baseTokens + tokenPerTile * totalTiles;
  }

  async checkDrawing(image: Buffer) {
    let imageKey: string | null = null;

    try {
      // TODO: 이미지 토큰 계산이 필요할 경우 활성화
      // const metadata = await sharp(image).metadata();
      // const imageTokens = await this.calculateImageTokens(metadata.width || 0, metadata.height || 0);

      const startTime = performance.now();

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
                text: `
                너는 그림 주제 맞히기 게임의 부정행위 방지 챗봇이야.

                <Input>
                - 이미지

                <Output>
                - "OK": 한글, 영어, 초성, 문자가 없음.
                - "WARN": 한글, 영어, 초성, 문자가 있음.

                주의사항
                - 글자인지 기하학적인 도형인지 구분되지 않는다면 "OK". 그러나 단어의 초성을 나타내는 것 같다면 "WARN"
                - 이모티콘/숫자/특수문자는 "OK".
                - 아무것도 그려지지 않았거나 애매한 경우 "OK"
                `,
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
                  detail: 'low',
                },
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
                  enum: ['OK', 'WARN'],
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
      const endTime = performance.now();
      const result = JSON.parse(response.choices[0].message.content);

      const metrics = {
        duration: endTime - startTime,
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
        imageTokens: this.LOW_DETAIL_IMAGE_TOKENS,
      };

      await this.deleteImageFromStorage(key);

      return { result, metrics };
    } catch (error) {
      if (imageKey) {
        await this.deleteImageFromStorage(imageKey).catch((error) => console.error('Failed to delete image: ', error));
      }
      console.error('OpenAI API Error:', error);
    }
  }
}
