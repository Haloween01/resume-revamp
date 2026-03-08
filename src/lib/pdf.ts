import jsPDF from "jspdf";
import type { Suggestion } from "./api";

export function applyAndDownloadPdf(
  resumeText: string,
  suggestions: Pick<Suggestion, "current" | "suggested">[],
  fileName: string
) {
  // Apply text replacements
  let updated = resumeText;
  for (const { current, suggested } of suggestions) {
    if (current && suggested) {
      updated = updated.replace(current, suggested);
    }
  }

  // Generate PDF
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  const maxWidth = pageWidth - margin * 2;
  const lineHeight = 14;
  let y = margin;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  const lines = doc.splitTextToSize(updated, maxWidth) as string[];

  for (const line of lines) {
    if (y + lineHeight > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += lineHeight;
  }

  doc.save(fileName);
}
