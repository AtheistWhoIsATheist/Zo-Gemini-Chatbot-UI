import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface ThetaMeterProps {
  theta: number; // 0–1 float
  size?: 'sm' | 'md' | 'lg'; // Default: 'md'
  animated?: boolean; // Default: true
  showTrend?: boolean; // Default: false
  thetaHistory?: number[];
}

export function ThetaMeter({ theta, size = 'md', animated = true, showTrend = false, thetaHistory = [] }: ThetaMeterProps) {
  // Color Mapping
  // theta < 0.5: Deep forest green smoke (rgba(74, 111, 74, 0.4))
  // 0.5 ≤ theta < 0.7: Tarnished gold smoke (rgba(120, 100, 40, 0.4))
  // 0.7 ≤ theta < 0.85: Burnt ember smoke (rgba(100, 50, 20, 0.4))
  // theta ≥ 0.85: Deep crimson void (rgba(80, 15, 15, 0.5))

  let color = 'rgba(74, 111, 74, 0.4)';
  let glowColor = 'rgba(74, 111, 74, 0.2)';
  let isCrisis = false;

  if (theta >= 0.85) {
    color = 'rgba(80, 15, 15, 0.5)';
    glowColor = 'rgba(150, 30, 30, 0.6)';
    isCrisis = true;
  } else if (theta >= 0.7) {
    color = 'rgba(100, 50, 20, 0.4)';
    glowColor = 'rgba(100, 50, 20, 0.2)';
  } else if (theta >= 0.5) {
    color = 'rgba(120, 100, 40, 0.4)';
    glowColor = 'rgba(120, 100, 40, 0.2)';
  }

  const heightClass = size === 'sm' ? 'h-1' : size === 'lg' ? 'h-3' : 'h-2';

  return (
    <div className="w-full flex flex-col gap-2">
      <div className={cn("w-full bg-[#111111] rounded-sm overflow-hidden relative shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]", heightClass)}>
        <motion.div
          className="h-full rounded-sm"
          initial={false}
          animate={{
            width: `${Math.min(100, Math.max(0, theta * 100))}%`,
            backgroundColor: color,
            boxShadow: isCrisis ? `0 0 16px ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.1)` : 'none',
            opacity: isCrisis && animated ? [1, 0.5, 1] : 1,
          }}
          transition={{
            width: { duration: 0.3, ease: 'easeOut' },
            backgroundColor: { duration: 0.3 },
            opacity: isCrisis && animated ? { duration: 1, repeat: Infinity, ease: 'easeInOut' } : { duration: 0 },
            boxShadow: isCrisis && animated ? { duration: 1, repeat: Infinity, ease: 'easeInOut' } : { duration: 0 }
          }}
        />
      </div>

      {showTrend && thetaHistory.length > 0 && (
        <div className="h-6 flex items-end gap-[2px] w-full">
          {thetaHistory.slice(-20).map((val, i) => {
            let barColor = 'rgba(74, 111, 74, 0.4)';
            if (val >= 0.85) barColor = 'rgba(80, 15, 15, 0.5)';
            else if (val >= 0.7) barColor = 'rgba(100, 50, 20, 0.4)';
            else if (val >= 0.5) barColor = 'rgba(120, 100, 40, 0.4)';

            return (
              <motion.div
                key={i}
                className="flex-1 rounded-[1px] min-h-[2px]"
                initial={false}
                animate={{
                  height: `${Math.max(10, val * 100)}%`,
                  backgroundColor: barColor,
                }}
                transition={{ duration: 0.2 }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
