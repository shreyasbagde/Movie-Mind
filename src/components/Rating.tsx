import React from 'react';
import { Star } from 'lucide-react';

interface RatingProps {
  value: number; // 0 - 10
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Rating: React.FC<RatingProps> = ({
  value,
  showText = true,
  size = 'md',
  className = '',
}) => {
  const iconSize = size === 'sm' ? 13 : size === 'lg' ? 18 : 15;
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base font-bold' : 'text-sm font-semibold';

  // Dynamic color coding based on score
  const getBadgeColor = (val: number) => {
    if (val >= 8.5) return 'text-amber-400 fill-amber-400';
    if (val >= 7.5) return 'text-amber-300 fill-amber-300';
    return 'text-zinc-400 fill-zinc-400';
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 ${className}`}>
      <Star className={`${iconSize} ${getBadgeColor(value)} transition-colors`} size={iconSize} />
      {showText && (
        <span className={`${textSize} text-white tabular-nums font-bold`}>
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
};
