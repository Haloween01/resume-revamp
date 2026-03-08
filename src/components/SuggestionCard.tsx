import React from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import type { Suggestion } from "@/lib/api";

interface SuggestionCardProps {
  suggestion: Suggestion;
  selected: boolean;
  onToggle: () => void;
  index: number;
}

const SuggestionCard = React.forwardRef<HTMLButtonElement, SuggestionCardProps>(({ suggestion, selected, onToggle, index }, ref) => {
  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onToggle}
      className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
        selected
          ? "border-primary bg-accent shadow-md"
          : "border-border hover:border-primary/30 hover:shadow-sm"
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
        <div className="flex-1 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {suggestion.section}
          </span>
          <p className="text-sm text-foreground leading-relaxed">{suggestion.reason}</p>
          {suggestion.keyword_added && (
            <div className="flex flex-wrap gap-1">
              {suggestion.keyword_added.split(",").map((kw, i) => (
                <span key={i} className="inline-flex items-center rounded-md bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                  + {kw.trim()}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-start gap-2 text-xs">
            <span className="rounded bg-destructive/10 text-destructive px-2 py-1 line-through flex-1">
              {suggestion.current}
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
            <span className="rounded bg-primary/10 text-primary px-2 py-1 flex-1">
              {suggestion.suggested}
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
});

SuggestionCard.displayName = "SuggestionCard";

export default SuggestionCard;
