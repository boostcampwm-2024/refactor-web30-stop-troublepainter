import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { OpenAIService } from './openai.service';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../../../../.env') });

describe('OpenAIService Test', () => {
  let service: OpenAIService;
  let testImageBuffer: Buffer;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenAIService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              switch (key) {
                case 'OPENAI_API_KEY':
                  return process.env.OPENAI_API_KEY;
                case 'NCP_STORAGE_ENDPOINT':
                  return process.env.NCP_STORAGE_ENDPOINT;
                case 'NCP_ACCESS_KEY':
                  return process.env.NCP_ACCESS_KEY;
                case 'NCP_SECRET_KEY':
                  return process.env.NCP_SECRET_KEY;
                case 'NCP_BUCKET_NAME':
                  return process.env.NCP_BUCKET_NAME;
                default:
                  return undefined;
              }
            },
          },
        },
      ],
    }).compile();

    service = module.get<OpenAIService>(OpenAIService);

    testImageBuffer = await fs.readFile(path.join(__dirname, './test-images/test.png'));
  });

  const runTest = async () => {
    try {
      const response = await service.checkDrawing(testImageBuffer);

      return {
        result: response.result,
        metrics: response.metrics,
      };
    } catch (error) {
      console.error('테스트 중 오류 발생', error);
    }
  };

  it('should process the image and output the analysis result', async () => {
    console.log('\n=== 테스트 시작 ===');
    const result = await runTest();

    if (!result) return;
    console.log('응답 결과: ', result.result);

    const { metrics } = result;

    console.log('=== 최종 결과 ===');
    console.log(`
      - 소요시간: ${metrics.duration.toFixed(2)}ms
      - 프롬프트 토큰: ${metrics.promptTokens.toFixed(2)}
      - 완성 토큰: ${metrics.completionTokens.toFixed(2)}
      - 총 토큰: ${metrics.totalTokens.toFixed(2)}
      - 이미지 토큰: ${metrics.imageTokens.toFixed(2)}
    `);

    // 비용 계산 (GPT-4o 기준)
    const calculateCost = (promptTokens: number, completionTokens: number, imageTokens: number) => {
      const promptCost = (promptTokens / 1000000) * 2.5;
      const completionCost = (completionTokens / 1000000) * 10.0;
      const imageCost = (imageTokens / 1000000) * 2.5;
      return promptCost + completionCost + imageCost;
    };

    const cost = calculateCost(
      result.metrics.promptTokens,
      result.metrics.completionTokens,
      result.metrics.imageTokens,
    );

    console.log(`
      요청 비용: $${cost.toFixed(4)}$
    `);
  }, 120000);
});
