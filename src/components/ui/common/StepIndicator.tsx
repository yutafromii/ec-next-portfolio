"use client";

type StepIndicatorProps = {
  steps: string[];
  current: number; // 0-based index
};

export default function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <div className="flex justify-center items-center gap-4 tracking-widest mb-12 text-sm md:text-base">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center gap-4">
          <div
            className={`px-4 py-2 border ${
              i === current ? "border-pink-400 text-pink-500 font-semibold" : "border-[#ccc] text-[#444]"
            }`}
          >
            {label}
          </div>
          {i < steps.length - 1 && <span className="text-[#999] text-xl">{">"}</span>}
        </div>
      ))}
    </div>
  );
}
