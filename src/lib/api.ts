export interface Suggestion {
  id: string;
  section: string;
  current: string;
  suggested: string;
  reason: string;
  keyword_added?: string | null;
}

export interface LearningResource {
  skill: string;
  youtube: string;
  course: string;
  roadmap: string;
}

export interface RecommendedJob {
  role: string;
  linkedin: string;
}

export interface AnalyzeResult {
  resume_text: string;
  ats_before: number;
  matched_skills: string[];
  missing_skills: string[];
  suggestions: Suggestion[];
  predicted_ats_after: number;
  learning_resources: LearningResource[];
  dsa_plan: string[];
  recommended_jobs: RecommendedJob[];
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

  // Normalize suggestions
  data.suggestions = (data.suggestions || []).map((s: any, i: number) => ({
    id: s.id || `suggestion-${i}`,
    section: s.section || s.category || "General",
    current: s.current || "",
    suggested: s.suggested || "",
    reason: s.reason || s.text || "",
    keyword_added: s.keyword_added || null,
  }));

  // Normalize learning_resources
  data.learning_resources = data.learning_resources || data.learning_plan || [];

  // Normalize recommended_jobs
  if (data.recommended_jobs?.length && typeof data.recommended_jobs[0] === "string") {
    data.recommended_jobs = data.recommended_jobs.map((j: string) => ({ role: j, linkedin: "" }));
  }

  // Normalize predicted_ats_after
  data.predicted_ats_after = data.predicted_ats_after ?? data.predicted_ats_after_changes ?? 0;

  return data;
}
