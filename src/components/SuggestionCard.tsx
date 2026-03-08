import { motion } from "framer-motion";
import { Check, Zap, TrendingUp, Lightbulb } from "lucide-react";
import type { Suggestion } from "@/lib/api";

interface SuggestionCardProps {
  suggestion: Suggestion;
  selected: boolean;
  onToggle: () => void;
  index: number;
}

const impactColors = {
  high: "border-primary bg-primary/5",
  medium: "border-warning/50 bg-warning/5",
  low: "border-muted-foreground/30 bg-muted/30",
};

const impactLabels = {
  high: { icon: Zap, text: "High Impact", class: "text-primary" },
  medium: { icon: TrendingUp, text: "Medium", class: "text-warning" },
  low: { icon: Lightbulb, text: "Low", class: "text-muted-foreground" },
};

const SuggestionCard = ({ suggestion, selected, onToggle, index }: SuggestionCardProps) => {
  const impact = impactLabels[suggestion.impact];
  const ImpactIcon = impact.icon;

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onToggle}
      className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
        selected
          ? "border-primary bg-accent shadow-md"
          : `${impactColors[suggestion.impact]} hover:shadow-sm`
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
            selected
              ? "border-primary bg-primary"
              : "border-muted-foreground/40"
          }`}
        >
          {selected && <Check className="h-3 w-3 text-primary-foreground" />}
        </div>
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {suggestion.category}
            </span>
            <span className={`flex items-center gap-1 text-xs font-medium ${impact.class}`}>
              <ImpactIcon className="h-3 w-3" />
              {impact.text}
            </span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{suggestion.text}</p>
        </div>
      </div>
    </motion.button>
  );
};

export default SuggestionCard;
