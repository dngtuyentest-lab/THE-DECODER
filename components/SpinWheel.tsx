
import React, { useRef, useEffect, useState } from 'react';

interface SpinWheelProps {
  items: string[];
  onFinish: (item: string) => void;
}

const SpinWheel: React.FC<SpinWheelProps> = ({ items, onFinish }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const spinAngle = useRef(0);
  const startAngle = useRef(0);
  const spinTime = useRef(0);
  const spinTimeTotal = useRef(0);

  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
    '#9966FF', '#FF9F40', '#C9CBCF', '#E7E9ED'
  ];

  const drawRouletteWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const outsideRadius = 180;
    const textRadius = 130;
    const insideRadius = 40;

    ctx.clearRect(0, 0, 500, 500);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 4;

    const arc = Math.PI / (items.length / 2);

    for (let i = 0; i < items.length; i++) {
      const angle = startAngle.current + i * arc;
      ctx.fillStyle = colors[i % colors.length];

      ctx.beginPath();
      ctx.arc(250, 250, outsideRadius, angle, angle + arc, false);
      ctx.arc(250, 250, insideRadius, angle + arc, angle, true);
      ctx.stroke();
      ctx.fill();

      ctx.save();
      ctx.fillStyle = "white";
      ctx.font = 'bold 16px sans-serif';
      ctx.translate(
        250 + Math.cos(angle + arc / 2) * textRadius,
        250 + Math.sin(angle + arc / 2) * textRadius
      );
      ctx.rotate(angle + arc / 2 + Math.PI / 2);
      const text = items[i];
      ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
      ctx.restore();
    }

    // Arrow
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.moveTo(250 - 4, 250 - (outsideRadius + 15));
    ctx.lineTo(250 + 4, 250 - (outsideRadius + 15));
    ctx.lineTo(250 + 4, 250 - (outsideRadius - 15));
    ctx.lineTo(250 + 9, 250 - (outsideRadius - 15));
    ctx.lineTo(250 + 0, 250 - (outsideRadius - 35));
    ctx.lineTo(250 - 9, 250 - (outsideRadius - 15));
    ctx.lineTo(250 - 4, 250 - (outsideRadius - 15));
    ctx.lineTo(250 - 4, 250 - (outsideRadius + 15));
    ctx.fill();
  };

  const rotateWheel = () => {
    spinTime.current += 30;
    if (spinTime.current >= spinTimeTotal.current) {
      stopRotateWheel();
      return;
    }
    const spinAngleProgress = spinAngle.current * easeOut(spinTime.current, 0, 1, spinTimeTotal.current);
    startAngle.current += (spinAngleProgress * Math.PI) / 180;
    drawRouletteWheel();
    requestAnimationFrame(rotateWheel);
  };

  const stopRotateWheel = () => {
    setIsSpinning(false);
    const degrees = (startAngle.current * 180) / Math.PI + 90;
    const arcd = (360 / items.length);
    const index = Math.floor((360 - (degrees % 360)) / arcd);
    onFinish(items[index]);
  };

  const easeOut = (t: number, b: number, c: number, d: number) => {
    const ts = (t /= d) * t;
    const tc = ts * t;
    return b + c * (tc + -3 * ts + 3 * t);
  };

  const spin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    spinAngle.current = Math.random() * 10 + 10;
    spinTime.current = 0;
    spinTimeTotal.current = Math.random() * 3000 + 4000;
    rotateWheel();
  };

  useEffect(() => {
    drawRouletteWheel();
  }, [items]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <canvas ref={canvasRef} width="500" height="500" />
      </div>
      <button
        onClick={spin}
        disabled={isSpinning}
        className={`px-10 py-4 rounded-full font-black text-xl transition-all shadow-xl uppercase tracking-widest ${
          isSpinning ? 'bg-slate-300 text-slate-500' : 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
        }`}
      >
        {isSpinning ? 'Đang quay...' : 'QUAY NGAY 🎡'}
      </button>
    </div>
  );
};

export default SpinWheel;
