import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OptimizedResumeProps {
  content: string;
}

const OptimizedResume = ({ content }: OptimizedResumeProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-foreground text-lg">Optimized Resume</h3>
        <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>
      <div className="rounded-lg border bg-card p-6 max-h-[600px] overflow-y-auto">
        <pre className="whitespace-pre-wrap text-sm text-card-foreground font-body leading-relaxed">
          {content}
        </pre>
      </div>
    </motion.div>
  );
};

export default OptimizedResume;
