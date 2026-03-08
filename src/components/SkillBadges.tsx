import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface SkillBadgesProps {
  title: string;
  skills: string[];
  variant: "matched" | "missing";
}

const SkillBadges = React.forwardRef<HTMLDivElement, SkillBadgesProps>(
  ({ title, skills, variant }, ref) => {
    return (
      <div ref={ref} className="space-y-3">
        <h3 className="font-display font-semibold text-foreground">{title}</h3>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, i) => (
            <motion.div
              key={skill}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.01 }}
            >
              <Badge
                className={
                  variant === "matched"
                    ? "bg-accent text-accent-foreground border-primary/20"
                    : "bg-destructive/10 text-destructive border-destructive/20"
                }
              >
                {skill}
              </Badge>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }
);

SkillBadges.displayName = "SkillBadges";

export default SkillBadges;
