export async function downloadAssessmentPdf(params: {
  title: string;
  category?: string;
  score?: number;
  maxScore?: number;
  classification?: string;
  headline?: string;
  narrative?: string;
  tip?: string;
}): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Header Banner
  doc.setFillColor(77, 41, 91); // Plum
  doc.rect(0, 0, 210, 42, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(18);
  doc.text("WellMindly Clinical Assessment Report", 15, 16);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(230, 230, 230);
  doc.text("Student Wellness Dossier & Personalized Clinical Summary", 15, 24);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`, 15, 31);

  // Metadata Card
  doc.setFillColor(248, 250, 252);
  doc.rect(15, 50, 180, 28, "F");
  doc.setDrawColor(226, 232, 240);
  doc.rect(15, 50, 180, 28, "S");

  doc.setTextColor(71, 85, 105);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.text("ASSESSMENT DETAILS", 20, 56);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Instrument: ${params.title}`, 20, 63);
  doc.text(`Category: ${params.category || "General Wellbeing"}`, 20, 70);

  if (params.score !== undefined) {
    doc.text(`Clinical Score: ${params.score} / ${params.maxScore || 100}`, 110, 63);
    doc.text(`Severity Tier: ${params.classification || "Optimal"}`, 110, 70);
  }

  // Section: Clinical Insights
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(77, 41, 91);
  doc.text("1. Clinical Summary & Narrative", 15, 90);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  const narrative = params.narrative || "Student completed the emotional wellness check-in, assessing affective state, sleep continuity, and academic pressure. Scores indicate positive coping with mild situational stress.";
  const narrativeLines = doc.splitTextToSize(narrative, 180);
  doc.text(narrativeLines, 15, 98);

  let currentY = 98 + narrativeLines.length * 6 + 10;

  // Section: Recommendations
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(77, 41, 91);
  doc.text("2. Tailored Recommendations & Next Steps", 15, currentY);
  currentY += 8;

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  const tip = params.tip || "Maintain consistent circadian routines. Explore guided journaling in WriteMindly or schedule a brief check-in with your university wellness coach.";
  const tipLines = doc.splitTextToSize(tip, 180);
  doc.text(tipLines, 15, currentY);

  // Footer Disclaimer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "Confidential Document. Intended for student personal records and licensed university counseling review under HIPAA guidelines.",
    15,
    280
  );

  doc.save("WellMindly_Assessment_Report.pdf");
}
