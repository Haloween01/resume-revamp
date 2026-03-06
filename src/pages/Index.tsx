import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import FileUpload from "@/components/FileUpload";
import ScoreGauge from "@/components/ScoreGauge";
import SkillBadges from "@/components/SkillBadges";
import OptimizedResume from "@/components/OptimizedResume";
import { optimizeResume, getApiBase, setApiBase, type OptimizeResult } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OptimizeResult | null>(null);
  const [apiUrl, setApiUrl] = useState(getApiBase());
  const [showSettings, setShowSettings] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!file || !jd.trim()) {
      toast({ title: "Missing input", description: "Please upload a resume and paste a job description.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const data = await optimizeResume(file, jd);
      setResult(data);
    } catch {
      toast({ title: "Error", description: "Failed to optimize resume. Make sure the API server is running.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto flex items-center gap-3 py-4 px-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="font-display text-xl font-bold text-foreground">ResumeAI</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-3xl space-y-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
            Optimize Your Resume for Any Job
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Upload your resume and paste the job description. Our AI will analyze keyword matches and generate an optimized version.
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-5"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Resume (PDF)</label>
            <FileUpload file={file} onFileChange={setFile} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Job Description</label>
            <Textarea
              placeholder="Paste the full job description here..."
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              rows={8}
              className="resize-y bg-card"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading || !file || !jd.trim()}
            className="w-full gap-2 h-12 text-base font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Optimize Resume
              </>
            )}
          </Button>
        </motion.div>

        {/* Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8 pt-4"
          >
            {/* Scores */}
            <div className="flex justify-center gap-12">
              <ScoreGauge label="Before" score={result.ats_before} color="before" />
              <ScoreGauge label="After" score={result.ats_after} color="after" />
            </div>

            {/* Skills */}
            <div className="grid gap-6 sm:grid-cols-2">
              <SkillBadges title={`Matched Skills (${result.matched_skills.length})`} skills={result.matched_skills} variant="matched" />
              <SkillBadges title={`Missing Skills (${result.missing_skills.length})`} skills={result.missing_skills} variant="missing" />
            </div>

            {/* Optimized Resume */}
            <OptimizedResume content={result.optimized_resume} />
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Index;
