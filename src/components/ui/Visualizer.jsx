import { useEffect, useRef } from 'react';

export default function Visualizer({ getUserVolume, getAgentVolume, status }) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const bars = 32;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const userVol = getUserVolume() || 0;
      const agentVol = getAgentVolume() || 0;
      const barW = W / bars - 2;

      for (let i = 0; i < bars; i++) {
        const t = i / bars;
        // Alternate between user and agent
        const vol = i % 2 === 0 ? userVol : agentVol;
        const noise = (Math.random() * 0.3 + 0.7);
        const baseH = status === 'connected' ? (vol * 60 * noise + 4) : 4;
        const barH = Math.min(baseH, H * 0.85);

        // Gradient color based on volume
        const r = Math.round(204 + t * 20);
        const g = Math.round(0 + agentVol * 80);
        const b = Math.round(0 + userVol * 100);

        ctx.fillStyle = status === 'connected'
          ? `rgba(${r},${g},${b},${0.6 + vol * 0.4})`
          : 'rgba(180,180,180,0.3)';

        const x = i * (barW + 2);
        const y = (H - barH) / 2;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, barH, 3);
        ctx.fill();
      }
      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [status, getUserVolume, getAgentVolume]);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={48}
      style={{ width: '100%', height: '48px', display: 'block' }}
    />
  );
}
