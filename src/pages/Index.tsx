import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Loader2, Settings, Moon, Sun, ArrowLeft, ArrowRight,
  CheckCheck, Download, BookOpen, Code2, Briefcase, Copy, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import FileUpload from "@/components/FileUpload";
import ScoreGauge from "@/components/ScoreGauge";
import SkillBadges from "@/components/SkillBadges";
import SuggestionCard from "@/components/SuggestionCard";
import StepIndicator from "@/components/StepIndicator";
import { optimizeResume, getApiBase, setApiBase, type AnalyzeResult } from "@/lib/api";
import { applyAndDownloadPdf } from "@/lib/pdf";
import { useToast } from "@/hooks/use-toast";

const pageTransition = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};

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
      const data = await optimizeResume(file, jd);
      setResult(data);
      const allIds = new Set<string>(data.suggestions.map(s => s.id));
      setSelectedSuggestions(allIds);
      setStep(1);
    } catch {
      toast({ title: "Error", description: "Failed to analyze resume. Make sure the API server is running.", variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApplyAndDownload = async () => {
    if (!result) return;
    setApplying(true);
    try {
      const selectedSugs = result.suggestions
        .filter(s => selectedSuggestions.has(s.id))
        .map(({ current, suggested }) => ({ current, suggested }));
      applyAndDownloadPdf(result.resume_text, selectedSugs, `optimized_${file?.name || "resume.pdf"}`);
      toast({ title: "Success!", description: "Your optimized resume has been downloaded." });
    } catch {
      toast({ title: "Error", description: "Failed to generate PDF. Please try again.", variant: "destructive" });
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

  const nextStep = () => setStep(s => Math.min(s + 1, 6));
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  const NavigationButtons = ({ showDownload = false }: { showDownload?: boolean }) => (
    <div className="flex gap-3 pt-4">
      <Button variant="outline" onClick={prevStep} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
      {showDownload ? (
        <Button
          onClick={handleApplyAndDownload}
          disabled={applying || selectedSuggestions.size === 0}
          className="flex-1 gap-2 h-12 text-base font-semibold"
        >
          {applying ? (
            <><Loader2 className="h-5 w-5 animate-spin" /> Applying...</>
          ) : (
            <><Download className="h-5 w-5" /> Apply & Download PDF</>
          )}
        </Button>
      ) : (
        <Button onClick={nextStep} className="flex-1 gap-2 h-12 text-base font-semibold">
          Next
          <ArrowRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );

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
              <Input value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} placeholder="API Base URL" className="text-sm bg-card" />
              <Button variant="outline" size="sm" onClick={() => { setApiBase(apiUrl); toast({ title: "Saved", description: `API URL set to ${apiUrl}` }); }}>
                Save
              </Button>
            </div>
          </div>
        )}
      </header>

      <main className="container mx-auto px-4 py-10 max-w-3xl space-y-8">
        <StepIndicator currentStep={step} />

        <AnimatePresence mode="wait">
          {/* Step 0: Upload */}
          {step === 0 && (
            <motion.div key="upload" {...pageTransition} className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">Upload Resume & Job Description</h2>
                <p className="text-muted-foreground max-w-xl mx-auto">Upload your resume and paste the job description to get AI-powered analysis.</p>
              </div>
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Resume (PDF / DOCX)</label>
                  <FileUpload file={file} onFileChange={setFile} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Job Description</label>
                  <Textarea placeholder="Paste the full job description here..." value={jd} onChange={(e) => setJd(e.target.value)} rows={8} className="resize-y bg-card" />
                </div>
                <Button onClick={handleAnalyze} disabled={analyzing || !file || !jd.trim()} className="w-full gap-2 h-12 text-base font-semibold">
                  {analyzing ? (<><Loader2 className="h-5 w-5 animate-spin" /> Analyzing...</>) : (<><Sparkles className="h-5 w-5" /> Analyze Resume</>)}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 1: ATS Score Analysis */}
          {step === 1 && result && (
            <motion.div key="ats" {...pageTransition} className="space-y-8">
              <div className="text-center space-y-2">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">ATS Score Analysis</h2>
                <p className="text-muted-foreground">See how well your resume matches the job description.</p>
              </div>
              <div className="flex justify-center gap-10 flex-wrap">
                <ScoreGauge label="Current Match" score={result.ats_before} color="before" />
                {result.predicted_ats_after_changes > 0 && (
                  <ScoreGauge label="Predicted After Improvements" score={result.predicted_ats_after_changes} color="after" />
                )}
              </div>
              <div className="rounded-xl border bg-card p-6 text-center space-y-2">
                <p className="text-sm text-muted-foreground">Potential Improvement</p>
                <p className="text-3xl font-display font-bold text-primary">
                  +{Math.max(0, (result.predicted_ats_after_changes || 0) - result.ats_before).toFixed(0)}%
                </p>
              </div>
              <NavigationButtons />
            </motion.div>
          )}

          {/* Step 2: Skill Gap */}
          {step === 2 && result && (
            <motion.div key="skills" {...pageTransition} className="space-y-8">
              <div className="text-center space-y-2">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Skill Gap Analysis</h2>
                <p className="text-muted-foreground">See which skills your resume covers and what's missing.</p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <SkillBadges title={`Matched Skills (${result.matched_skills.length})`} skills={result.matched_skills} variant="matched" />
                <SkillBadges title={`Missing Skills (${result.missing_skills.length})`} skills={result.missing_skills} variant="missing" />
              </div>
              <NavigationButtons />
            </motion.div>
          )}

          {/* Step 3: Resume Suggestions */}
          {step === 3 && result && (
            <motion.div key="suggestions" {...pageTransition} className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Resume Improvement Suggestions</h2>
                <p className="text-muted-foreground">Select the improvements you'd like to apply to your resume.</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-semibold text-foreground text-lg">
                    {selectedSuggestions.size}/{result.suggestions.length} selected
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
              <NavigationButtons showDownload />
            </motion.div>
          )}

          {/* Step 4: Learning Roadmap */}
          {step === 4 && result && (
            <motion.div key="learning" {...pageTransition} className="space-y-8">
              <div className="text-center space-y-2">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground flex items-center justify-center gap-2">
                  <BookOpen className="h-7 w-7 text-primary" />
                  Learning Roadmap
                </h2>
                <p className="text-muted-foreground">A personalized plan to fill your skill gaps.</p>
              </div>
              {result.learning_plan.length > 0 ? (
                <div className="relative space-y-0">
                  {/* Timeline line */}
                  <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />
                  {result.learning_plan.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="relative flex items-start gap-4 pb-6"
                    >
                      <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                        {i + 1}
                      </div>
                      <div className="flex-1 rounded-xl border bg-card p-4">
                        <p className="text-sm font-medium text-foreground">{item}</p>
                        <p className="text-xs text-muted-foreground mt-1">Week {(i * 2) + 1}–{(i * 2) + 2}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">No learning plan available.</div>
              )}
              <NavigationButtons />
            </motion.div>
          )}

          {/* Step 5: DSA Plan */}
          {step === 5 && result && (
            <motion.div key="dsa" {...pageTransition} className="space-y-8">
              <div className="text-center space-y-2">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground flex items-center justify-center gap-2">
                  <Code2 className="h-7 w-7 text-primary" />
                  DSA Preparation Plan
                </h2>
                <p className="text-muted-foreground">Topics to practice for technical interviews.</p>
              </div>
              {result.dsa_plan.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {result.dsa_plan.map((topic, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="flex items-center gap-3 rounded-xl border bg-card p-4"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">
                        {i + 1}
                      </div>
                      <p className="text-sm font-medium text-foreground">{topic}</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">No DSA plan available.</div>
              )}
              <div className="rounded-xl border bg-card p-5 space-y-3">
                <h4 className="font-display font-semibold text-foreground">Practice Tips</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" /> Solve 2 LeetCode problems daily</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" /> Mock interview every weekend</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" /> Focus on understanding patterns, not memorizing solutions</li>
                </ul>
              </div>
              <NavigationButtons />
            </motion.div>
          )}

          {/* Step 6: Recommended Jobs */}
          {step === 6 && result && (
            <motion.div key="jobs" {...pageTransition} className="space-y-8">
              <div className="text-center space-y-2">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground flex items-center justify-center gap-2">
                  <Briefcase className="h-7 w-7 text-primary" />
                  Recommended Job Roles
                </h2>
                <p className="text-muted-foreground">Roles that match your skills and experience.</p>
              </div>
              {result.recommended_jobs.length > 0 ? (
                <div className="grid gap-3">
                  {result.recommended_jobs.map((job, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-center gap-4 rounded-xl border bg-card p-5 hover:border-primary/40 transition-colors"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Briefcase className="h-5 w-5 text-primary" />
                      </div>
                      <p className="text-base font-medium text-foreground">{job}</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">No job recommendations available.</div>
              )}
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={prevStep} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button onClick={handleStartOver} className="flex-1 gap-2 h-12 text-base font-semibold">
                  <Sparkles className="h-5 w-5" />
                  Optimize Another Resume
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Index;
