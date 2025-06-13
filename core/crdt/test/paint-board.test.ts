import { test as base, expect, Page, Browser, BrowserContext, Locator } from '@playwright/test';

interface DrawingClient {
  context: BrowserContext;
  page: Page;
}

const test = base.extend({});
let browser: Browser;

// 테스트 설정
export const TEST_CONFIG = {
  url: 'http://localhost:5173/',
  syncWaitTime: 1000,
  clientCounts: [5],
  viewport: { width: 1280, height: 720 },
} as const;

export const ACCEPTANCE_CRITERIA = {
  'random-drawing': { minMatch: 0.95 },
} as const;

test.describe('Random Drawing Test', () => {
  let clients: DrawingClient[] = [];

  test.beforeAll(async ({ playwright }) => {
    browser = await playwright.chromium.launch();
  });

  test.afterAll(async () => {
    await browser.close();
  });

  test.afterEach(async () => {
    await cleanupClients(clients);
    clients = [];
  });

  for (const [index, clientCount] of TEST_CONFIG.clientCounts.entries()) {
    test(`Random drawing test with ${index} clients`, async ({}, testInfo) => {
      testInfo.setTimeout(120_000);

      // 동일한 URL로 클라이언트 페이지 설정
      clients = await setupSameURL(clientCount, browser);

      // 모든 클라이언트가 동시에 랜덤 드로잉 수행
      await Promise.all(
        clients.map(async (client, index) => {
          try {
            return await randomByMouse(client.page);
          } catch (error) {
            console.error(`Random drawing failed for client ${index}:`, error);
            throw error;
          }
        }),
      );

      // 동기화 시간 대기
      await new Promise((resolve) => setTimeout(resolve, 10000));

      // 결과 비교
      for (let i = 1; i < clients.length; i++) {
        if (clients[0].page.isClosed() || clients[i].page.isClosed()) {
          throw new Error(`Page ${i} is closed before comparison`);
        }

        const sameRatio = await compareCanvasPixels(clients[0].page, clients[i].page);

        console.log(`Random Drawing - Client ${i} same ratio: ${sameRatio}`);

        expect(sameRatio).toBeGreaterThanOrEqual(ACCEPTANCE_CRITERIA['random-drawing'].minMatch);
      }
    });
  }
});

// 리소스 정리 함수
export async function cleanupClients(clients: DrawingClient[]) {
  for (const client of clients) {
    try {
      if (client.page && !client.page.isClosed()) {
        await client.page.close().catch(() => {});
      }
      if (client.context) {
        await client.context.close().catch(() => {});
      }
    } catch (error) {
      console.error('Error closing client:', error);
    }
  }
}

//  네트워크 설정 함수
async function applyRandomNetwork(page: Page, context: BrowserContext): Promise<void> {
  const client = await context.newCDPSession(page);
  await client.send('Network.enable');

  // 랜덤 범위 설정
  const latency = 10 + Math.floor(Math.random() * 10); // 10–19ms
  const downloadMbps = 20 + Math.random() * 10; // 20–30 Mbps
  const uploadMbps = 10 + Math.random() * 10; // 10–20 Mbps

  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    latency,
    downloadThroughput: (downloadMbps * 1024 * 1024) / 8, // Mbps -> Bytes per second
    uploadThroughput: (uploadMbps * 1024 * 1024) / 8,
    connectionType: 'cellular4g',
  });
}

// 테스트 설정 초기화 함수
export async function setupSameURL(clientCount: number, browser: Browser): Promise<DrawingClient[]> {
  const clients: DrawingClient[] = [];
  let sharedUrl = '';

  for (let i = 0; i < clientCount; i++) {
    const context = await browser.newContext({
      viewport: TEST_CONFIG.viewport,
    });
    const page = await context.newPage();

    //await applyRandomNetwork(page, context);

    if (i === 0) {
      await page.goto(TEST_CONFIG.url);

      await Promise.all([page.getByRole('button', { name: '체험하기' }).click()]);

      await Promise.all([
        page.getByRole('img', { name: '그림판', exact: true }).waitFor({ state: 'visible' }),
        page.getByRole('img', { name: '그림판 마우스', exact: true }).waitFor({ state: 'visible' }),
      ]);

      sharedUrl = page.url();
    } else {
      await page.goto(sharedUrl);

      await Promise.all([
        page.getByRole('img', { name: '그림판', exact: true }).waitFor({ state: 'visible' }),
        page.getByRole('img', { name: '그림판 마우스', exact: true }).waitFor({ state: 'visible' }),
      ]);
    }

    clients.push({ context, page });
  }

  return clients;
}

// 랜덤 드로잉
const randomByMouse = async (page: Page) => {
  const box = await page.getByRole('img', { name: '그림판', exact: true }).boundingBox();
  if (!box) throw new Error('Canvas not found');

  for (let i = 0; i < 5; i++) {
    const actionType = Math.random();

    if (actionType < 0.25) {
      // 25% 확률로 undo
      const undoButton = page.getByRole('button', { name: '되돌리기' });
      if (!(await undoButton.isDisabled())) {
        await undoButton.click();
      }
    } else if (actionType < 0.5) {
      // 25% 확률로 redo
      const redoButton = page.getByRole('button', { name: '다시실행' });
      if (!(await redoButton.isDisabled())) {
        await redoButton.click();
      }
    } else {
      // 50% 확률로 일반 그리기
      if (Math.random() > 0.5) await selectRandomColor(page);
      if (Math.random() > 0.5) await setRandomLineWidth(page);
      const isFillMode = Math.random() > 0.5;

      if (isFillMode) await setFillMode(page);
      else await setPenMode(page);

      const pointCount = isFillMode ? 1 : 10;
      const points = Array.from({ length: pointCount }, () => ({
        x: box.x + Math.random() * box.width,
        y: box.y + Math.random() * box.height,
      }));

      if (isFillMode) {
        await page.mouse.click(points[0].x, points[0].y);
      } else {
        await page.mouse.move(points[0].x, points[0].y);
        await page.mouse.down();

        for (let j = 1; j < points.length; j++) {
          await page.mouse.move(points[j].x, points[j].y, { steps: 5 });
        }

        await page.mouse.up();
      }
    }
  }
};

export const compareCanvasPixels = async (basePage: Page, targetPage: Page): Promise<number> => {
  const getPixelData = async (locator: Locator) => {
    return locator.evaluate((canvas: HTMLCanvasElement) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Cannot get 2d context');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      return Array.from(imageData.data);
    });
  };

  const baseCanvas = basePage.getByRole('img', { name: '그림판', exact: true });
  const targetCanvas = targetPage.getByRole('img', { name: '그림판', exact: true });

  const [basePixels, targetPixels] = await Promise.all([getPixelData(baseCanvas), getPixelData(targetCanvas)]);

  let samePixels = 0;

  for (let i = 0; i < basePixels.length; i += 4) {
    if (
      basePixels[i] === targetPixels[i] &&
      basePixels[i + 1] === targetPixels[i + 1] &&
      basePixels[i + 2] === targetPixels[i + 2] &&
      basePixels[i + 3] === targetPixels[i + 3]
    ) {
      samePixels++;
    }
  }

  return samePixels / (basePixels.length / 4);
};

async function selectRandomColor(page: Page): Promise<void> {
  const colors = ['검정', '분홍', '노랑', '하늘', '회색'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  await page.getByLabel(`${randomColor} 색상 선택`).click();
}

async function setRandomLineWidth(page: Page): Promise<void> {
  await page.getByLabel('펜 모드').click();
  const lineWidth = Math.floor(Math.random() * 9) * 2 + 4; // 4-20 사이의 짝수 값
  await page.getByLabel('선 굵기 조절').fill(lineWidth.toString());
}

async function setFillMode(page: Page): Promise<void> {
  await page.getByLabel('채우기 모드').click();
}

async function setPenMode(page: Page): Promise<void> {
  await page.getByLabel('펜 모드').click();
}
