import { Point } from '@troublepainter/core';

let canvas: OffscreenCanvas | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let points: Point[] = [];
let lineWidth = 0;
let lineLength = 0;
let deleteInterval = 0;

let drawTime = performance.now();
let deleteTime = performance.now();
let rAFID: number | null = null;

self.onmessage = (evt) => {
  if (evt.data.type == 'canvas') {
    canvas = evt.data.value.canvas;
    ctx = evt.data.value.canvas.getContext('2d');
    lineWidth = evt.data.value.width;
    lineLength = evt.data.value.length;
    deleteInterval = evt.data.value.interval;
    rAFID = requestAnimationFrame(drawAni);
  } else if (evt.data.type == 'stop' && rAFID) cancelAnimationFrame(rAFID);
  else if (evt.data.type == 'clear' && ctx && canvas) {
    points.length = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  } else if (evt.data.type == 'resize' && canvas) {
    const { width, height } = evt.data.value;
    canvas.width = width;
    canvas.height = height;
  } else points.push(evt.data.value.point);
};

const drawAni = () => {
  if (!ctx || !canvas) return;

  const now = performance.now();

  if (now - drawTime > 16 && points.length > 1) {
    if (points.length > lineLength) points = points.slice(-lineLength);
    drawTime = now;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.globalAlpha = 0.3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = 'white';

    points.forEach((point, idx) => {
      if (ctx) {
        if (idx === 0) ctx.moveTo(point.x, point.y);
        else if (idx < points.length - 1) {
          const midX = (points[idx + 1].x + point.x) / 2;
          const midY = (points[idx + 1].y + point.y) / 2;
          ctx.quadraticCurveTo(point.x, point.y, midX, midY);
        } else {
          ctx.lineTo(point.x, point.y);
          ctx.stroke();
        }
      }
    });
  }

  if (now - deleteTime > deleteInterval && points.length > 1) {
    points.shift();
    deleteTime = now;
  }

  requestAnimationFrame(drawAni);
};
