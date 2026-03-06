export interface OptimizeResult {
  ats_before: number;
  ats_after: number;
  matched_skills: string[];
  missing_skills: string[];
  optimized_resume: string;
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
): Promise<OptimizeResult> {
  const formData = new FormData();
  formData.append("resume", resumeFile, resumeFile.name);
  formData.append("jd", jobDescription);

  const response = await fetch(`${API_BASE}/optimize-resume`, {
    method: "POST",
    headers: { accept: "application/json" },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}
