import { launch } from 'puppeteer';
import {setTimeout} from "node:timers/promises";
import { coordinates} from './BackgroundCanvas.pointer.js'


function* getOnePoint() {
  for (const points of coordinates) {
    yield points;
  }
}

async function testPointerMove(url, i) {
  const browser = await launch({ 
    headless: false, // 브라우저 UI가 보이게 실행
    defaultViewport: null, // 기본 뷰포트 비활성화 (전체 창 크기 조정 가능)
    args: ['--start-maximized'], // 브라우저 창을 최대화
  });

  const page = await browser.newPage();

  // 페이지 로드
  await page.goto(url, { waitUntil: 'networkidle2' });


  await page.tracing.start({ path: `test_results/performanceTrace_pointermove${i}.json` });


  const generator = getOnePoint();
  for (let i = 0; i < 500; i++) {
    const points = generator.next().value;

    await page.mouse.move(points.x, points.y); // 마우스를 이동시킴
    await setTimeout(7); // 짧은 대기 시간
  }

  await page.tracing.stop();

  console.log('Move 테스트 완료');
  await browser.close();
}

// 테스트 실행
await testPointerMove('http://localhost:4173', 1).catch(console.error);
await testPointerMove('http://localhost:4173', 2).catch(console.error);
await testPointerMove('http://localhost:4173', 3).catch(console.error);
