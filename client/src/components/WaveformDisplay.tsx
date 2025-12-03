/**
 * Waveform visualization component
 * Displays audio waveform as a bar chart
 */

import { useEffect, useRef } from 'react';

interface WaveformDisplayProps {
  waveform: number[];
  color?: string;
  height?: number;
  label?: string;
}

export function WaveformDisplay({ 
  waveform, 
  color = '#8b5cf6', 
  height = 80,
  label 
}: WaveformDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveform.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Draw waveform
    const barWidth = rect.width / waveform.length;
    const maxHeight = rect.height;

    waveform.forEach((value, index) => {
      const barHeight = value * maxHeight * 0.9; // 90% of max height
      const x = index * barWidth;
      const y = (maxHeight - barHeight) / 2;

      ctx.fillStyle = color;
      ctx.fillRect(x, y, barWidth * 0.8, barHeight);
    });
  }, [waveform, color]);

  return (
    <div className="space-y-2">
      {label && (
        <div className="text-sm font-medium text-muted-foreground">{label}</div>
      )}
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: `${height}px` }}
        className="rounded border border-border bg-background"
      />
    </div>
  );
}
