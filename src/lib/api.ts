export interface Suggestion {
  id: string;
  section: string;
  current: string;
  suggested: string;
  reason: string;
}

export interface AnalyzeResult {
  resume_text: string;
  ats_before: number;
  matched_skills: string[];
  missing_skills: string[];
  suggestions: Suggestion[];
  predicted_ats_after_changes: number;
  learning_plan: string[];
  dsa_plan: string[];
  recommended_jobs: string[];
}

let API_BASE = localStorage.getItem("api_base") || "http://127.0.0.1:8000";

export function getApiBase() {
  return API_BASE;
}

export function setApiBase(url: string) {
  API_BASE = url;
  localStorage.setItem("api_base", url);
}

export async function optimizeResume(
  resumeFile: File,
  jobDescription: string
): Promise<AnalyzeResult> {
  const formData = new FormData();
  formData.append("resume", resumeFile, resumeFile.name);
  formData.append("jd", jobDescription);

  const response = await fetch(`${API_BASE}/optimize-resume`, {
    method: "POST",
    headers: { accept: "application/json" },
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.detail || `API error: ${response.status}`);
  }

  const data = await response.json();

  // Normalize suggestions: backend doesn't send id/impact, generate them
  data.suggestions = (data.suggestions || []).map((s: any, i: number) => ({
    id: s.id || `suggestion-${i}`,
    section: s.section || s.category || "General",
    current: s.current || "",
    suggested: s.suggested || "",
    reason: s.reason || s.text || "",
  }));

  return data;
}

export async function applyResumeChanges(
  resumeText: string,
  suggestions: Pick<Suggestion, "current" | "suggested">[]
): Promise<Blob> {
  const response = await fetch(`${API_BASE}/apply-resume-changes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/pdf",
    },
    body: JSON.stringify({
      resume_text: resumeText,
      suggestions,
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.blob();
}
