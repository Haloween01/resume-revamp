import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, Settings, Moon, Sun, Download, ArrowLeft, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import FileUpload from "@/components/FileUpload";
import ScoreGauge from "@/components/ScoreGauge";
import SkillBadges from "@/components/SkillBadges";
import SuggestionCard from "@/components/SuggestionCard";
import StepIndicator from "@/components/StepIndicator";
import { analyzeResume, applyChanges, getApiBase, setApiBase, type AnalyzeResult } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [step, setStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [jd, setJd] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [applying, setApplying] = useState(false);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());
  const [apiUrl, setApiUrl] = useState(getApiBase());
  const [showSettings, setShowSettings] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const handleAnalyze = async () => {
    if (!file || !jd.trim()) {
      toast({ title: "Missing input", description: "Please upload a resume and paste a job description.", variant: "destructive" });
      return;
    }
    setAnalyzing(true);
    try {
      const data = await analyzeResume(file, jd);
      setResult(data);
      // Auto-select high impact suggestions
      const highImpact = new Set(data.suggestions.filter(s => s.impact === "high").map(s => s.id));
      setSelectedSuggestions(highImpact);
      setStep(1);
    } catch {
      toast({ title: "Error", description: "Failed to analyze resume. Make sure the API server is running.", variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApplyAndDownload = async () => {
    if (!file || !result) return;
    setApplying(true);
    try {
      const blob = await applyChanges(file, jd, Array.from(selectedSuggestions));
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `optimized_${file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStep(2);
      toast({ title: "Success!", description: "Your optimized resume has been downloaded." });
    } catch {
      toast({ title: "Error", description: "Failed to apply changes. Please try again.", variant: "destructive" });
    } finally {
      setApplying(false);
    }
  };

  const toggleSuggestion = (id: string) => {
    setSelectedSuggestions(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleStartOver = () => {
    setStep(0);
    setFile(null);
    setJd("");
    setResult(null);
    setSelectedSuggestions(new Set());
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between py-4 px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="font-display text-xl font-bold text-foreground">ResumeAI</h1>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                const isDark = document.documentElement.classList.toggle("dark");
                localStorage.setItem("theme", isDark ? "dark" : "light");
              }}
              className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <Sun className="h-5 w-5 hidden dark:block" />
              <Moon className="h-5 w-5 block dark:hidden" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
        {showSettings && (
          <div className="container mx-auto px-4 pb-3">
            <div className="flex gap-2 items-center">
              <Input
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="API Base URL"
                className="text-sm bg-card"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setApiBase(apiUrl);
                  toast({ title: "Saved", description: `API URL set to ${apiUrl}` });
                }}
              >
                Save
              </Button>
            </div>
          </div>
        )}
      </header>

      <main className="container mx-auto px-4 py-10 max-w-3xl space-y-8">
        {/* Step Indicator */}
        <StepIndicator currentStep={step} />

        <AnimatePresence mode="wait">
          {/* Step 0: Upload */}
          {step === 0 && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
                  Upload Resume & Job Description
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  Upload your resume and paste the job description to get AI-powered analysis and suggestions.
                </p>
              </div>

              <div className="space-y-5">
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
                  onClick={handleAnalyze}
                  disabled={analyzing || !file || !jd.trim()}
                  className="w-full gap-2 h-12 text-base font-semibold"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Analyze Resume
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 1: Results & Suggestions */}
          {step === 1 && result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* ATS Score */}
              <div className="text-center space-y-2">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                  Analysis Results
                </h2>
                <p className="text-muted-foreground">
                  Review your ATS score, skill gaps, and select suggestions to apply.
                </p>
              </div>

              <div className="flex justify-center">
                <ScoreGauge label="ATS Score" score={result.ats_score} color="before" />
              </div>

              {/* Skills */}
              <div className="grid gap-6 sm:grid-cols-2">
                <SkillBadges title={`Matched Skills (${result.matched_skills.length})`} skills={result.matched_skills} variant="matched" />
                <SkillBadges title={`Missing Skills (${result.missing_skills.length})`} skills={result.missing_skills} variant="missing" />
              </div>

              {/* Suggestions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-semibold text-foreground text-lg">
                    Suggestions ({selectedSuggestions.size}/{result.suggestions.length} selected)
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (selectedSuggestions.size === result.suggestions.length) {
                        setSelectedSuggestions(new Set());
                      } else {
                        setSelectedSuggestions(new Set(result.suggestions.map(s => s.id)));
                      }
                    }}
                  >
                    <CheckCheck className="h-4 w-4 mr-1" />
                    {selectedSuggestions.size === result.suggestions.length ? "Deselect All" : "Select All"}
                  </Button>
                </div>
                <div className="space-y-3">
                  {result.suggestions.map((suggestion, i) => (
                    <SuggestionCard
                      key={suggestion.id}
                      suggestion={suggestion}
                      selected={selectedSuggestions.has(suggestion.id)}
                      onToggle={() => toggleSuggestion(suggestion.id)}
                      index={i}
                    />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(0)} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handleApplyAndDownload}
                  disabled={applying || selectedSuggestions.size === 0}
                  className="flex-1 gap-2 h-12 text-base font-semibold"
                >
                  {applying ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Applying Changes...
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5" />
                      Apply Changes & Download PDF
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Done */}
          {step === 2 && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6 py-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10"
              >
                <Download className="h-10 w-10 text-primary" />
              </motion.div>
              <div className="space-y-2">
                <h2 className="font-display text-3xl font-bold text-foreground">
                  Resume Downloaded!
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Your optimized resume has been downloaded. Good luck with your application!
                </p>
              </div>
              <Button onClick={handleStartOver} variant="outline" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Optimize Another Resume
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Index;
