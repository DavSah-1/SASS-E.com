import { Card, CardContent } from "@/components/ui/card";

interface BadgeProps {
  icon: string;
  name: string;
  description: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
  earnedAt?: Date;
  locked?: boolean;
}

const tierColors = {
  bronze: {
    bg: "from-orange-900/40 to-amber-900/40",
    border: "border-orange-500/30",
    text: "text-orange-200",
    icon: "text-orange-400",
  },
  silver: {
    bg: "from-slate-700/40 to-slate-800/40",
    border: "border-slate-400/30",
    text: "text-slate-200",
    icon: "text-slate-300",
  },
  gold: {
    bg: "from-yellow-900/40 to-amber-800/40",
    border: "border-yellow-500/30",
    text: "text-yellow-200",
    icon: "text-yellow-400",
  },
  platinum: {
    bg: "from-purple-900/40 to-indigo-900/40",
    border: "border-purple-500/30",
    text: "text-purple-200",
    icon: "text-purple-400",
  },
};

export function Badge({ icon, name, description, tier, earnedAt, locked = false }: BadgeProps) {
  const colors = tierColors[tier];

  return (
    <Card
      className={`bg-gradient-to-br ${colors.bg} border-2 ${colors.border} ${
        locked ? "opacity-40 grayscale" : "hover:scale-105"
      } transition-all`}
    >
      <CardContent className="p-4">
        <div className="flex flex-col items-center text-center gap-2">
          {/* Icon */}
          <div className={`text-4xl ${locked ? "opacity-50" : ""}`}>
            {locked ? "🔒" : icon}
          </div>

          {/* Name */}
          <div className={`text-sm font-bold ${colors.text}`}>{name}</div>

          {/* Description */}
          <div className="text-xs text-slate-400">{description}</div>

          {/* Earned Date */}
          {earnedAt && !locked && (
            <div className="text-xs text-slate-500 mt-1">
              Earned {new Date(earnedAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
