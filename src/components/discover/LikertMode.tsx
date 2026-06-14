import React from "react";

const L5: [string, number][] = [
  ["Strongly agree", 5], 
  ["Agree", 4], 
  ["Neither", 3], 
  ["Disagree", 2], 
  ["Strongly disagree", 1]
];

interface LikertModeProps {
  intro: string;
  question: string;
  selected?: number;
  onPick: (v: number) => void;
  accent: string;
  scale?: [string, number][];
}

export function LikertMode({ intro, question, selected, onPick, accent, scale }: LikertModeProps) {
  const options = scale || L5;
  return (
    <div>
      <p className="text-ink-soft text-sm mb-4">{intro}</p>
      <h3 className="font-serif font-medium text-[clamp(20px,4.4vw,28px)] leading-snug mb-5 text-ink">{question}</h3>
      <div className="flex flex-col gap-2.5">
        {options.map(([label, val]) => (
          <button 
            key={val} 
            onClick={() => onPick(val)}
            className={`flex items-center gap-3.5 text-left border-[1.5px] rounded-[14px] px-5 py-4 transition-all text-[15px] font-semibold cursor-pointer
              ${selected === val 
                ? 'border-plum bg-plum/5 text-plum shadow-sm' 
                : 'border-line bg-white hover:border-plum/60 hover:translate-x-1'}`}
            style={{ '--accent': accent } as React.CSSProperties}
          >
            <span 
              className={`w-[22px] h-[22px] rounded-full border-[2.5px] flex-shrink-0 transition-all
                ${selected === val 
                  ? 'border-plum bg-plum shadow-[inset_0_0_0_3.5px_#fff]' 
                  : 'border-line'}`} 
            />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
