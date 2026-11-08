const BARS = [14, 22, 17, 29, 36];
const LINE = "M2 44 C14 42 18 34 30 36 S48 22 60 26 S82 14 94 16 S110 8 118 6";

/** Graphique décoratif façon application de finance. Aucune donnée réelle : aucun montant n'est affiché. */
export function FinanceSpark() {
  return (
    <div aria-hidden className="glass-dark w-[44%] shrink-0 rounded-xl p-2.5">
      <svg viewBox="0 0 120 56" className="block h-auto w-full overflow-visible">
        <defs>
          <linearGradient id="fin-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8fabd8" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#8fabd8" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[14, 28, 42].map((y) => (
          <line key={y} x1="0" x2="120" y1={y} y2={y} stroke="white" strokeOpacity="0.1" strokeDasharray="2 3" />
        ))}

        {BARS.map((height, i) => (
          <rect
            key={i}
            className="fin-bar"
            style={{ animationDelay: `${i * 140}ms` }}
            x={6 + i * 23}
            y={56 - height}
            width="11"
            height={height}
            rx="2"
            fill="white"
            fillOpacity="0.14"
          />
        ))}

        <path className="fin-area" d={`${LINE} L118 56 L2 56 Z`} fill="url(#fin-grad)" />
        <path className="fin-line" pathLength={1} d={LINE} fill="none" stroke="#b9cce9" strokeWidth="2" strokeLinecap="round" />
        <circle className="fin-ring" cx="118" cy="6" r="3" fill="#b9cce9" />
        <circle className="fin-dot" cx="118" cy="6" r="3.2" fill="#ffffff" />
      </svg>

      <div className="mt-2 flex items-center justify-between gap-2 text-[10px] font-semibold">
        <span>Total livré</span>
        <span className="fin-total block h-2 w-10 rounded-full" />
      </div>
    </div>
  );
}