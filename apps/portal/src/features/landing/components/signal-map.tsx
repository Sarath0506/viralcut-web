const nodes = [
  { label: "Punjabi", sub: "Punjab", angle: -100, r: 36 },
  { label: "Hindi", sub: "Delhi NCR", angle: -58, r: 29 },
  { label: "Bengali", sub: "West Bengal", angle: -14, r: 37 },
  { label: "Marathi", sub: "Maharashtra", angle: 30, r: 33 },
  { label: "Kannada", sub: "Karnataka", angle: 76, r: 36 },
  { label: "Tamil", sub: "Tamil Nadu", angle: 122, r: 34 },
  { label: "Telugu", sub: "Telangana", angle: 166, r: 37 },
  { label: "Malayalam", sub: "Kerala", angle: -146, r: 33 },
];

function point(angleDeg: number, r: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: 50 + r * Math.cos(rad), y: 50 + r * Math.sin(rad) };
}

export function SignalMap() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-lg overflow-hidden sm:overflow-visible">
      {/* connecting lines */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
        {nodes.map((n) => {
          const p = point(n.angle, n.r);
          return (
            <line
              key={n.label}
              x1={50}
              y1={50}
              x2={p.x}
              y2={p.y}
              stroke="white"
              strokeOpacity={0.08}
              strokeWidth={0.3}
            />
          );
        })}
      </svg>

      {/* center hub */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <span className="absolute inset-0 -m-3 animate-ping rounded-full bg-primary/30" />
        <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-black text-white shadow-[0_0_30px_rgba(99,14,212,0.6)]">
          H
        </span>
      </div>

      {/* region nodes */}
      {nodes.map((n, i) => {
        const p = point(n.angle, n.r);
        const alignEnd = n.angle > 90 || n.angle < -90;
        return (
          <div
            key={n.label}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          >
            <div className={`flex items-center gap-2 ${alignEnd ? "flex-row-reverse" : ""}`}>
              <span
                className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-primary"
                style={{ animationDelay: `${i * 0.18}s` }}
              />
              <span
                className={`whitespace-nowrap rounded-full border border-white/10 bg-[#07091A]/90 px-2 py-0.5 text-[9px] font-medium text-white/70 backdrop-blur-sm sm:px-2.5 sm:py-1 sm:text-xs ${
                  alignEnd ? "text-right" : ""
                }`}
              >
                {n.label} <span className="hidden text-white/30 sm:inline">· {n.sub}</span>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
