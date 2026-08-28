export async function downloadSampleReport(): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Colors

  // Draw Title Page / Header
  doc.setFillColor(77, 41, 91); // Plum
  doc.rect(0, 0, 210, 45, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(20);
  doc.text("WellMindly Campus Analytics", 15, 16);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(220, 220, 220);
  doc.text("Anonymized aggregate reports for campus administration", 15, 23);
  doc.text("Example University — Illustrative Cohort", 15, 29);

  doc.setFontSize(8.5);
  doc.setTextColor(200, 200, 200);
  doc.text(
    "Sample layout with placeholder figures. No real institution, cohort or student data appears in this document.",
    15,
    36,
  );

  // Report metadata box
  doc.setFillColor(248, 250, 252);
  doc.rect(15, 55, 180, 25, "F");
  doc.setDrawColor(226, 232, 240);
  doc.rect(15, 55, 180, 25, "S");

  doc.setTextColor(71, 85, 105);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.text("REPORT METADATA", 20, 61);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text("Generated: June 2026", 20, 67);
  doc.text("License Type: Campus-Wide Beta", 20, 72);
  doc.text("Total Registered Seats: 8,000", 110, 67);
  doc.text("Cohort Coverage / Active: 61% (4,880 active)", 110, 72);

  // Section 1: Executive Summary
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(77, 41, 91);
  doc.text("1. Executive Summary", 15, 95);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  const summaryText =
    "This is a specimen of the aggregate report format. Individual student names, email addresses, check-in entries and message contents do not appear in it. The data-handling terms for a live deployment — including the minimum cohort size below which no figure is reported — are agreed in writing with each institution before any report is issued.";
  const splitSummary = doc.splitTextToSize(summaryText, 180);
  doc.text(splitSummary, 15, 101);

  // Section 2: Key Metrics — Illustrative Placeholders
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(77, 41, 91);
  doc.text("KEY METRICS — ILLUSTRATIVE PLACEHOLDERS", 15, 125);

  // Draw score card
  doc.setFillColor(241, 245, 249);
  doc.rect(15, 131, 55, 30, "F");
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(18);
  doc.text("6.8 / 10", 25, 144);
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text("Campus Wellness Index", 21, 152);

  // Draw engagement card
  doc.setFillColor(241, 245, 249);
  doc.rect(77, 131, 55, 30, "F");
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(18);
  doc.text("61%", 94, 144);
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text("Student Cohort Coverage", 83, 152);

  // Draw referral card
  doc.setFillColor(241, 245, 249);
  doc.rect(140, 131, 55, 30, "F");
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(18);
  doc.text("4.2%", 157, 144);
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text("Support Opt-In Rate", 149, 152);

  // Section 3: Severity Segmentation
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(77, 41, 91);
  doc.text("3. Severity Segmentation (Risk Distribution)", 15, 175);

  // Draw progress indicators
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);

  // Mild Risk: 64%
  doc.text("Mild Tiers (Safe / Self-Discovery Enabled)", 15, 183);
  doc.setFillColor(224, 242, 254);
  doc.rect(15, 186, 180, 4, "F");
  doc.setFillColor(14, 165, 233);
  doc.rect(15, 186, 180 * 0.64, 4, "F");
  doc.text("64%", 185, 183);

  // Moderate Risk: 24%
  doc.text("Moderate Tiers (Surfacing Peer Coaching Sessions)", 15, 196);
  doc.setFillColor(254, 243, 199);
  doc.rect(15, 199, 180, 4, "F");
  doc.setFillColor(245, 158, 11);
  doc.rect(15, 199, 180 * 0.24, 4, "F");
  doc.text("24%", 185, 196);

  // Severe Risk: 12%
  doc.text("Severe Tiers (Helpline Directory Routing)", 15, 209);
  doc.setFillColor(254, 226, 226);
  doc.rect(15, 212, 180, 4, "F");
  doc.setFillColor(239, 68, 68);
  doc.rect(15, 212, 180 * 0.12, 4, "F");
  doc.text("12%", 185, 209);

  // Section 4: What a Live Report Contains
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(77, 41, 91);
  doc.text("WHAT A LIVE REPORT CONTAINS", 15, 230);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(
    "• Term-over-term movement in the cohort wellbeing index, with the reporting period stated on every figure.",
    15,
    237,
  );
  doc.text(
    "• Distribution across wellbeing bands, so support capacity can be planned against demand rather than guessed.",
    15,
    243,
  );
  doc.text(
    "• Uptake of each support pathway — self-guided tools, peer spaces and counsellor sessions — as a share of the cohort.",
    15,
    249,
  );

  // Footer
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "SPECIMEN DOCUMENT · ILLUSTRATIVE FIGURES · NOT A REAL COHORT · POWERED BY WELLMINDLY",
    15,
    280,
  );
  doc.text("Page 1 of 1", 185, 280);

  doc.save("WellMindly_Sample_Report_Specimen.pdf");
}
