import React from 'react';
import { Check } from 'lucide-react';

interface TagSelectorProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  label?: string;
  maxSelection?: number;
}

export const TagSelector: React.FC<TagSelectorProps> = ({
  options,
  selected,
  onChange,
  label,
  maxSelection = 5
}) => {
  const toggleTag = (tag: string) => {
    if (selected.includes(tag)) {
      onChange(selected.filter(t => t !== tag));
    } else {
      if (selected.length < maxSelection) {
        onChange([...selected, tag]);
      }
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <div className="flex justify-between items-center">
          <span className="font-mono text-[10px] sm:text-xs text-white/50 uppercase tracking-wider">
            {label}
          </span>
          <span className="font-mono text-[9px] text-white/30">
            {selected.length}/{maxSelection} selected
          </span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {options.map((tag) => {
          const isSelected = selected.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1.5 rounded-lg font-sans text-xs transition-all duration-200 flex items-center gap-1.5 cursor-pointer select-none border ${
                isSelected
                  ? 'bg-aws-orange/15 border-aws-orange/60 text-aws-orange font-semibold shadow-[0_0_12px_rgba(255,153,0,0.15)] scale-[1.02]'
                  : 'bg-[#121212] border-white/10 text-white/70 hover:text-white hover:border-white/25 hover:bg-white/[0.04]'
              }`}
            >
              {isSelected && <Check size={12} className="text-aws-orange stroke-[3]" />}
              <span>{tag}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
