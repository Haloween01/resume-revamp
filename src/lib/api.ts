export interface Suggestion {
  id: string;
  category: string;
  text: string;
  impact: "high" | "medium" | "low";
}

export interface AnalyzeResult {
  ats_score: number;
  matched_skills: string[];
  missing_skills: string[];
  suggestions: Suggestion[];
}

export interface ApplyResult {
  ats_after: number;
  download_url: string;
}

let API_BASE = localStorage.getItem("api_base") || "http://127.0.0.1:8000";

export function getApiBase() {
  return API_BASE;
}

export function setApiBase(url: string) {
  API_BASE = url;
  localStorage.setItem("api_base", url);
}

export async function analyzeResume(
  resumeFile: File,
  jobDescription: string
): Promise<AnalyzeResult> {
  const formData = new FormData();
  formData.append("resume", resumeFile, resumeFile.name);
  formData.append("jd", jobDescription);

  const response = await fetch(`${API_BASE}/analyze-resume`, {
    method: "POST",
    headers: { accept: "application/json" },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

export async function applyChanges(
  resumeFile: File,
  jobDescription: string,
  selectedSuggestionIds: string[]
): Promise<Blob> {
  const formData = new FormData();
  formData.append("resume", resumeFile, resumeFile.name);
  formData.append("jd", jobDescription);
  formData.append("suggestions", JSON.stringify(selectedSuggestionIds));

  const response = await fetch(`${API_BASE}/apply-changes`, {
    method: "POST",
    headers: { accept: "application/pdf" },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.blob();
}
