"use client";

type StepIndicatorProps = {
  steps: string[];
  current: number; // 0-based index
};

export default function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <nav aria-label="進行状況" className="mb-12">
      {/* ---- Mobile: ドット＋バー ---- */}
      <ol className="md:hidden mx-4 flex items-center justify-between gap-2">
        {steps.map((label, i) => {
          const active = i <= current;
          return (
            <li key={label} className="relative flex-1 flex items-center">
              {/* 左バー（先頭以外） */}
              {i > 0 && (
                <span
                  aria-hidden
                  className={`absolute left-0 right-1/2 top-1/2 -z-10 h-[2px] -translate-y-1/2 ${
                    i - 1 < current ? "bg-black" : "bg-gray-300"
                  }`}
                />
              )}
              {/* 右バー（末尾以外） */}
              {i < steps.length - 1 && (
                <span
                  aria-hidden
                  className={`absolute left-1/2 right-0 top-1/2 -z-10 h-[2px] -translate-y-1/2 ${
                    i < current ? "bg-black" : "bg-gray-300"
                  }`}
                />
              )}

              <div
                className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full border text-xs ${
                  active
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-500 border-gray-300"
                }`}
                aria-current={i === current ? "step" : undefined}
                title={label}
              >
                {i + 1}
              </div>
            </li>
          );
        })}
      </ol>

      {/* ★ ラベル行：各ステップと同じ幅配分。現在ステップだけ表示、他は透明で幅だけ確保 */}
      <div className="md:hidden mx-4 mt-2 flex items-center justify-between gap-2">
        {steps.map((label, i) => (
          <div key={label} className="flex-1 text-center">
            <span
              className={`text-xs text-gray-700 transition-opacity duration-150 ${
                i === current ? "opacity-100" : "opacity-0"
              }`}
              aria-hidden={i !== current}
              title={label}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* ---- Desktop: 従来のチップ（必要ならtruncate/scroll） ---- */}
      <div className="hidden md:flex justify-center items-center gap-3 tracking-widest text-sm md:text-base overflow-x-auto whitespace-nowrap no-scrollbar px-4">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center gap-3">
            <div
              className={`px-4 py-2 rounded border max-w-[180px] truncate ${
                i === current
                  ? "border-pink-400 text-pink-500 font-semibold"
                  : "border-gray-300 text-[#444]"
              }`}
              title={label}
              aria-current={i === current ? "step" : undefined}
            >
              {label}
            </div>
            {i < steps.length - 1 && (
              <span className="text-gray-400 text-xl" aria-hidden>
                ›
              </span>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}
