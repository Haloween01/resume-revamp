import { motion } from "framer-motion";
import { Upload, BarChart3, Target, Lightbulb, BookOpen, Code2, Briefcase, Check } from "lucide-react";

const steps = [
  { icon: Upload, label: "Upload" },
  { icon: BarChart3, label: "ATS Score" },
  { icon: Target, label: "Skills" },
  { icon: Lightbulb, label: "Suggestions" },
  { icon: BookOpen, label: "Learning" },
  { icon: Code2, label: "DSA" },
  { icon: Briefcase, label: "Jobs" },
];

interface StepIndicatorProps {
  currentStep: number;
}

const StepIndicator = ({ currentStep }: StepIndicatorProps) => {
  return (
    <div className="flex items-center justify-center gap-1">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const isActive = i === currentStep;
        const isCompleted = i < currentStep;

        return (
          <div key={step.label} className="flex items-center gap-1">
            <div className="flex flex-col items-center gap-1">
              <motion.div
                animate={{ scale: isActive ? 1.1 : 1 }}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                  isCompleted
                    ? "bg-primary text-primary-foreground"
                    : isActive
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isCompleted ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Icon className="h-3.5 w-3.5" />
                )}
              </motion.div>
              <span
                className={`text-[10px] font-medium hidden md:block ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-px w-4 sm:w-6 mb-4 md:mb-0 ${
                  isCompleted ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;
