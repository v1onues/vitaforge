'use client';

import { useMemo } from 'react';
import { LifeArea } from '@/lib/db/schema';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';

interface WheelOfLifeProps {
  areas: LifeArea[];
  onScoreChange?: (areaId: string, field: 'currentScore' | 'targetScore', value: number) => void;
}

export function WheelOfLife({ areas, onScoreChange }: WheelOfLifeProps) {
  const center = 150;
  const radius = 120;
  const levels = 10;

  const angleStep = (2 * Math.PI) / areas.length;

  const polygonPoints = useMemo(() => {
    return areas.map((area, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const currentRadius = (area.currentScore / levels) * radius;
      const targetRadius = (area.targetScore / levels) * radius;

      return {
        current: {
          x: center + currentRadius * Math.cos(angle),
          y: center + currentRadius * Math.sin(angle),
        },
        target: {
          x: center + targetRadius * Math.cos(angle),
          y: center + targetRadius * Math.sin(angle),
        },
        label: {
          x: center + (radius + 30) * Math.cos(angle),
          y: center + (radius + 30) * Math.sin(angle),
        },
        area,
      };
    });
  }, [areas, angleStep]);

  return (
    <div className="flex flex-col items-center gap-6">
      <svg width="300" height="300" viewBox="0 0 300 300">
        {[...Array(levels)].map((_, i) => (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={((i + 1) / levels) * radius}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.1}
          />
        ))}

        {/* Hedef polygon */}
        <polygon
          points={polygonPoints.map((p) => `${p.target.x},${p.target.y}`).join(' ')}
          fill="currentColor"
          fillOpacity={0.05}
          stroke="currentColor"
          strokeOpacity={0.2}
          strokeDasharray="4 4"
        />

        {/* Mevcut polygon */}
        <polygon
          points={polygonPoints.map((p) => `${p.current.x},${p.current.y}`).join(' ')}
          fill="currentColor"
          fillOpacity={0.15}
          stroke="currentColor"
          strokeWidth={2}
          strokeOpacity={0.5}
        />

        {/* Noktalar */}
        {polygonPoints.map((point, index) => (
          <circle
            key={index}
            cx={point.current.x}
            cy={point.current.y}
            r={5}
            fill={point.area.color}
            stroke="currentColor"
            strokeWidth={2}
          />
        ))}

        {/* Etiketler */}
        {polygonPoints.map((point, index) => (
          <text
            key={index}
            x={point.label.x}
            y={point.label.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-xs fill-current font-medium"
          >
            {point.area.name}
          </text>
        ))}
      </svg>

      {/* Skorlayıcılar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-2xl">
        {areas.map((area) => (
          <div key={area.id} className="flex items-center gap-2 p-2 rounded-lg border">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: area.color }}
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium truncate">{area.name}</p>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() =>
                    onScoreChange?.(area.id, 'currentScore', Math.max(1, area.currentScore - 1))
                  }
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="text-xs font-bold w-4 text-center">{area.currentScore}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() =>
                    onScoreChange?.(area.id, 'currentScore', Math.min(10, area.currentScore + 1))
                  }
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
