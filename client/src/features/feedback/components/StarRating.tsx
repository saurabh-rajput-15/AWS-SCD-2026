import React, { useState, useRef, useCallback } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  showLabels?: boolean;
  required?: boolean;
  className?: string;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Needs Improvement',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Outstanding'
};

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  max = 5,
  size = 'md',
  label,
  showLabels = true,
  required = false,
  className = ''
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const starSizes = {
    sm: 'w-4 h-4 sm:w-5 sm:h-5',
    md: 'w-6 h-6 sm:w-7 sm:h-7',
    lg: 'w-7 h-7 sm:w-8 sm:h-8'
  };

  const displayRating = hoverValue !== null ? hoverValue : value;

  const computeStarIndex = useCallback((clientX: number): number => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width === 0) return 0;
    const relativeX = clientX - rect.left;
    const clampedX = Math.max(0, Math.min(relativeX, rect.width));
    const star = Math.min(max, Math.max(1, Math.ceil((clampedX / rect.width) * max)));
    return star;
  }, [max]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // fallback
    }
    isDraggingRef.current = true;
    const star = computeStarIndex(e.clientX);
    if (star > 0) {
      setHoverValue(star);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const star = computeStarIndex(e.clientX);
    if (star > 0 && star !== hoverValue) {
      setHoverValue(star);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) {
      const star = computeStarIndex(e.clientX);
      if (star > 0) {
        onChange(star === value ? 0 : star);
      }
      isDraggingRef.current = false;
      setHoverValue(null);
    }
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // fallback
    }
  };

  const handlePointerCancel = () => {
    isDraggingRef.current = false;
    setHoverValue(null);
  };

  const handlePointerLeave = () => {
    if (!isDraggingRef.current) {
      setHoverValue(null);
    }
  };

  return (
    <div className={`flex flex-col gap-1.5 select-none ${className}`}>
      {/* Label and/or Status Header */}
      {showLabels && (
        <div className="flex items-center justify-between min-h-[1.2rem] gap-2">
          {label ? (
            <span className="font-mono text-xs text-white/70 uppercase tracking-wider truncate">
              {label} {required && <span className="text-aws-orange">*</span>}
            </span>
          ) : (
            <span className="font-mono text-[10px] text-white/40 uppercase tracking-wider">
              {displayRating > 0 ? `${displayRating}/${max} Stars` : 'Rate: 1 to 5'}
            </span>
          )}

          <span className="font-mono text-[11px] text-aws-orange font-bold uppercase tracking-wider shrink-0 text-right truncate">
            {displayRating > 0 ? (RATING_LABELS[displayRating] || `${displayRating}/${max}`) : ''}
          </span>
        </div>
      )}

      {/* 5 Stars Interactive Row */}
      <div
        ref={containerRef}
        role="radiogroup"
        aria-label={label || 'Rating selection'}
        className="flex items-center gap-1 sm:gap-1.5 touch-none cursor-pointer py-0.5 w-fit"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerLeave={handlePointerLeave}
      >
        {Array.from({ length: max }, (_, index) => {
          const starNumber = index + 1;
          const isFilled = starNumber <= displayRating;

          return (
            <button
              key={starNumber}
              type="button"
              role="radio"
              aria-checked={value === starNumber}
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onChange(starNumber === value ? 0 : starNumber);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onChange(starNumber === value ? 0 : starNumber);
                }
              }}
              className={`p-1 rounded-md transition-transform duration-75 hover:scale-115 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-aws-orange/60 cursor-pointer ${
                isFilled
                  ? 'text-[#FF9900]'
                  : 'text-white/20 hover:text-white/40'
              }`}
              aria-label={`Rate ${starNumber} of ${max} stars`}
            >
              <Star
                className={`${starSizes[size]} pointer-events-none transition-colors duration-75 ${
                  isFilled
                    ? 'fill-[#FF9900] text-[#FF9900]'
                    : 'fill-transparent text-current'
                }`}
                style={isFilled ? { filter: 'drop-shadow(0 0 5px rgba(255, 153, 0, 0.45))' } : undefined}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

