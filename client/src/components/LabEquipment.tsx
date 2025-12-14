import { useState } from "react";

interface TooltipProps {
  text: string;
  x: number;
  y: number;
  show: boolean;
}

function Tooltip({ text, x, y, show }: TooltipProps) {
  if (!show) return null;
  return (
    <g>
      <rect
        x={x - 60}
        y={y - 35}
        width={120}
        height={30}
        fill="rgba(0, 0, 0, 0.9)"
        rx={4}
      />
      <text
        x={x}
        y={y - 15}
        textAnchor="middle"
        fill="white"
        fontSize="12"
        fontWeight="500"
      >
        {text}
      </text>
    </g>
  );
}

export function Beaker() {
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  return (
    <svg viewBox="0 0 200 300" className="w-full h-full">
      <defs>
        <linearGradient id="liquidGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <animate attributeName="y1" values="0%;10%;0%" dur="3s" repeatCount="indefinite" />
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* Beaker body */}
      <path
        d="M 60 50 L 60 220 Q 60 260 100 260 Q 140 260 140 220 L 140 50 Z"
        fill="none"
        stroke="#94a3b8"
        strokeWidth="3"
        opacity="0.6"
        onMouseEnter={() => setTooltip({ text: "Glass beaker body", x: 100, y: 150 })}
        onMouseLeave={() => setTooltip(null)}
      />

      {/* Liquid */}
      <path
        d="M 63 180 L 63 220 Q 63 257 100 257 Q 137 257 137 220 L 137 180 Z"
        fill="url(#liquidGradient)"
        onMouseEnter={() => setTooltip({ text: "Liquid sample", x: 100, y: 220 })}
        onMouseLeave={() => setTooltip(null)}
      />

      {/* Measurement markings */}
      {[100, 150, 200, 250].map((ml, i) => {
        const y = 240 - i * 50;
        return (
          <g key={ml}>
            <line x1="55" y1={y} x2="65" y2={y} stroke="#64748b" strokeWidth="2" />
            <text x="45" y={y + 5} fill="#64748b" fontSize="12" textAnchor="end">
              {ml}mL
            </text>
          </g>
        );
      })}

      {/* Spout */}
      <path
        d="M 140 80 Q 150 80 155 85"
        fill="none"
        stroke="#94a3b8"
        strokeWidth="3"
        opacity="0.6"
        onMouseEnter={() => setTooltip({ text: "Pouring spout", x: 150, y: 80 })}
        onMouseLeave={() => setTooltip(null)}
      />

      <Tooltip text={tooltip?.text || ""} x={tooltip?.x || 0} y={tooltip?.y || 0} show={!!tooltip} />
    </svg>
  );
}

export function Microscope() {
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  return (
    <svg viewBox="0 0 300 400" className="w-full h-full">
      {/* Base */}
      <rect
        x="80"
        y="360"
        width="140"
        height="20"
        fill="#475569"
        rx="4"
        onMouseEnter={() => setTooltip({ text: "Heavy base for stability", x: 150, y: 370 })}
        onMouseLeave={() => setTooltip(null)}
      />

      {/* Arm */}
      <path
        d="M 150 360 L 150 200 Q 150 180 170 180 L 200 180"
        fill="none"
        stroke="#64748b"
        strokeWidth="8"
        onMouseEnter={() => setTooltip({ text: "Microscope arm", x: 160, y: 270 })}
        onMouseLeave={() => setTooltip(null)}
      />

      {/* Stage */}
      <rect
        x="100"
        y="240"
        width="100"
        height="8"
        fill="#475569"
        onMouseEnter={() => setTooltip({ text: "Stage - place slide here", x: 150, y: 244 })}
        onMouseLeave={() => setTooltip(null)}
      />
      <circle cx="150" cy="244" r="15" fill="none" stroke="#94a3b8" strokeWidth="2" />

      {/* Objective lenses */}
      <g
        onMouseEnter={() => setTooltip({ text: "Objective lenses (4x, 10x, 40x)", x: 150, y: 200 })}
        onMouseLeave={() => setTooltip(null)}
      >
        <circle cx="130" cy="220" r="12" fill="#334155" />
        <circle cx="150" cy="215" r="12" fill="#1e293b" />
        <circle cx="170" cy="220" r="12" fill="#334155" />
      </g>

      {/* Body tube */}
      <rect
        x="185"
        y="80"
        width="30"
        height="100"
        fill="#64748b"
        rx="4"
        onMouseEnter={() => setTooltip({ text: "Body tube", x: 200, y: 130 })}
        onMouseLeave={() => setTooltip(null)}
      />

      {/* Eyepiece */}
      <ellipse
        cx="200"
        cy="70"
        rx="20"
        ry="15"
        fill="#475569"
        onMouseEnter={() => setTooltip({ text: "Eyepiece (10x magnification)", x: 200, y: 50 })}
        onMouseLeave={() => setTooltip(null)}
      />
      <ellipse cx="200" cy="70" rx="12" ry="8" fill="#1e293b" />

      {/* Focus knobs */}
      <circle
        cx="230"
        cy="200"
        r="15"
        fill="#334155"
        stroke="#94a3b8"
        strokeWidth="2"
        onMouseEnter={() => setTooltip({ text: "Coarse focus knob", x: 250, y: 200 })}
        onMouseLeave={() => setTooltip(null)}
      />
      <circle
        cx="230"
        cy="230"
        r="12"
        fill="#334155"
        stroke="#94a3b8"
        strokeWidth="2"
        onMouseEnter={() => setTooltip({ text: "Fine focus knob", x: 250, y: 230 })}
        onMouseLeave={() => setTooltip(null)}
      />

      {/* Light source */}
      <circle
        cx="150"
        cy="280"
        r="20"
        fill="#fbbf24"
        opacity="0.7"
        onMouseEnter={() => setTooltip({ text: "Light source / mirror", x: 150, y: 310 })}
        onMouseLeave={() => setTooltip(null)}
      >
        <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2s" repeatCount="indefinite" />
      </circle>

      <Tooltip text={tooltip?.text || ""} x={tooltip?.x || 0} y={tooltip?.y || 0} show={!!tooltip} />
    </svg>
  );
}

export function Spectrophotometer() {
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  return (
    <svg viewBox="0 0 400 300" className="w-full h-full">
      {/* Main body */}
      <rect
        x="50"
        y="100"
        width="300"
        height="150"
        fill="#334155"
        rx="8"
        onMouseEnter={() => setTooltip({ text: "Spectrophotometer body", x: 200, y: 175 })}
        onMouseLeave={() => setTooltip(null)}
      />

      {/* Light source */}
      <circle
        cx="90"
        cy="175"
        r="20"
        fill="#fbbf24"
        onMouseEnter={() => setTooltip({ text: "Light source (tungsten lamp)", x: 90, y: 140 })}
        onMouseLeave={() => setTooltip(null)}
      >
        <animate attributeName="opacity" values="0.8;1;0.8" dur="1.5s" repeatCount="indefinite" />
      </circle>

      {/* Light path */}
      <line
        x1="110"
        y1="175"
        x2="180"
        y2="175"
        stroke="#fbbf24"
        strokeWidth="4"
        opacity="0.6"
        onMouseEnter={() => setTooltip({ text: "Light path", x: 145, y: 160 })}
        onMouseLeave={() => setTooltip(null)}
      >
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
      </line>

      {/* Monochromator/Prism */}
      <polygon
        points="170,160 190,175 170,190"
        fill="#60a5fa"
        opacity="0.8"
        onMouseEnter={() => setTooltip({ text: "Monochromator (wavelength selector)", x: 180, y: 145 })}
        onMouseLeave={() => setTooltip(null)}
      />

      {/* Sample cuvette */}
      <rect
        x="210"
        y="160"
        width="30"
        height="30"
        fill="none"
        stroke="#94a3b8"
        strokeWidth="3"
        onMouseEnter={() => setTooltip({ text: "Sample cuvette", x: 225, y: 145 })}
        onMouseLeave={() => setTooltip(null)}
      />
      <rect x="213" y="170" width="24" height="15" fill="#3b82f6" opacity="0.6" />

      {/* Light path after sample */}
      <line
        x1="240"
        y1="175"
        x2="290"
        y2="175"
        stroke="#60a5fa"
        strokeWidth="4"
        opacity="0.4"
        onMouseEnter={() => setTooltip({ text: "Transmitted light", x: 265, y: 160 })}
        onMouseLeave={() => setTooltip(null)}
      >
        <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2s" repeatCount="indefinite" />
      </line>

      {/* Detector */}
      <rect
        x="290"
        y="160"
        width="40"
        height="30"
        fill="#475569"
        rx="4"
        onMouseEnter={() => setTooltip({ text: "Photodetector", x: 310, y: 145 })}
        onMouseLeave={() => setTooltip(null)}
      />

      {/* Display */}
      <rect x="120" y="120" width="160" height="60" fill="#1e293b" rx="4" />
      <text x="200" y="145" textAnchor="middle" fill="#10b981" fontSize="20" fontWeight="bold">
        A = 0.523
      </text>
      <text x="200" y="165" textAnchor="middle" fill="#64748b" fontSize="12">
        λ = 540 nm
      </text>

      {/* Control panel */}
      <circle cx="320" cy="220" r="8" fill="#ef4444" opacity="0.8" />
      <rect x="280" y="215" width="30" height="10" fill="#475569" rx="2" />

      <Tooltip text={tooltip?.text || ""} x={tooltip?.x || 0} y={tooltip?.y || 0} show={!!tooltip} />
    </svg>
  );
}

export function DNAGelApparatus() {
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  return (
    <svg viewBox="0 0 400 300" className="w-full h-full">
      {/* Gel box */}
      <rect
        x="50"
        y="100"
        width="300"
        height="150"
        fill="#334155"
        rx="8"
        onMouseEnter={() => setTooltip({ text: "Gel electrophoresis chamber", x: 200, y: 175 })}
        onMouseLeave={() => setTooltip(null)}
      />

      {/* Buffer solution */}
      <rect x="60" y="120" width="280" height="110" fill="#3b82f6" opacity="0.3" rx="4" />

      {/* Gel */}
      <rect
        x="80"
        y="140"
        width="240"
        height="70"
        fill="#64748b"
        opacity="0.6"
        rx="2"
        onMouseEnter={() => setTooltip({ text: "Agarose gel", x: 200, y: 175 })}
        onMouseLeave={() => setTooltip(null)}
      />

      {/* Wells */}
      <g
        onMouseEnter={() => setTooltip({ text: "Sample wells", x: 120, y: 130 })}
        onMouseLeave={() => setTooltip(null)}
      >
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect
            key={i}
            x={90 + i * 35}
            y="145"
            width="20"
            height="8"
            fill="#1e293b"
            rx="2"
          />
        ))}
      </g>

      {/* DNA bands */}
      <g opacity="0.8">
        {/* Lane 1 - DNA ladder */}
        <rect x="92" y="165" width="16" height="2" fill="#a855f7" />
        <rect x="92" y="175" width="16" height="2" fill="#a855f7" />
        <rect x="92" y="185" width="16" height="2" fill="#a855f7" />
        <rect x="92" y="195" width="16" height="2" fill="#a855f7" />

        {/* Lane 2 - Sample 1 */}
        <rect x="127" y="180" width="16" height="3" fill="#10b981" />
        <rect x="127" y="190" width="16" height="2" fill="#10b981" />

        {/* Lane 3 - Sample 2 */}
        <rect x="162" y="175" width="16" height="4" fill="#10b981" />

        {/* Lane 4 - Sample 3 */}
        <rect x="197" y="185" width="16" height="3" fill="#10b981" />
        <rect x="197" y="195" width="16" height="2" fill="#10b981" />

        {/* Lane 5 - Control */}
        <rect x="232" y="180" width="16" height="3" fill="#f59e0b" />
      </g>

      {/* Electrodes */}
      <rect
        x="70"
        y="135"
        width="10"
        height="80"
        fill="#1e293b"
        onMouseEnter={() => setTooltip({ text: "Negative electrode (cathode)", x: 75, y: 120 })}
        onMouseLeave={() => setTooltip(null)}
      />
      <rect
        x="320"
        y="135"
        width="10"
        height="80"
        fill="#ef4444"
        onMouseEnter={() => setTooltip({ text: "Positive electrode (anode)", x: 325, y: 120 })}
        onMouseLeave={() => setTooltip(null)}
      />

      {/* Power supply */}
      <rect x="140" y="50" width="120" height="40" fill="#475569" rx="4" />
      <text x="200" y="70" textAnchor="middle" fill="#10b981" fontSize="16" fontWeight="bold">
        100V
      </text>
      <text x="200" y="85" textAnchor="middle" fill="#64748b" fontSize="10">
        45 min
      </text>

      {/* Wires */}
      <line x1="75" y1="120" x2="160" y2="90" stroke="#64748b" strokeWidth="2" />
      <line x1="325" y1="120" x2="240" y2="90" stroke="#ef4444" strokeWidth="2" />

      {/* Direction arrow */}
      <g opacity="0.6">
        <line x1="100" y1="260" x2="280" y2="260" stroke="#fbbf24" strokeWidth="3" markerEnd="url(#arrowhead)" />
        <text x="190" y="280" textAnchor="middle" fill="#fbbf24" fontSize="12">
          DNA migration →
        </text>
      </g>

      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill="#fbbf24" />
        </marker>
      </defs>

      <Tooltip text={tooltip?.text || ""} x={tooltip?.x || 0} y={tooltip?.y || 0} show={!!tooltip} />
    </svg>
  );
}

interface EquipmentGalleryProps {
  equipment: string[];
}

export function EquipmentGallery({ equipment }: EquipmentGalleryProps) {
  const equipmentComponents: Record<string, React.ReactElement> = {
    beaker: <Beaker />,
    microscope: <Microscope />,
    spectrophotometer: <Spectrophotometer />,
    "dna gel apparatus": <DNAGelApparatus />,
    "gel electrophoresis": <DNAGelApparatus />,
  };

  const matchedEquipment = equipment
    .map((item) => {
      const normalized = item.toLowerCase();
      const key = Object.keys(equipmentComponents).find((k) => normalized.includes(k));
      return key ? { name: item, component: equipmentComponents[key] } : null;
    })
    .filter((item): item is { name: string; component: React.ReactElement } => item !== null);

  if (matchedEquipment.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-green-300 mb-4">🔬 Equipment Visualizations</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matchedEquipment.map(({ name, component }) => (
          <div key={name} className="bg-slate-800/50 border border-green-500/20 rounded-lg p-4">
            <p className="text-sm text-slate-300 mb-2 text-center">{name}</p>
            <div className="h-64">{component}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
