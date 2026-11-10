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
  const { isNativeApp } = await import("../../lib/native");
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // One calm, honest page: what the student took, what it suggests, one thing
  // to try. No clinical framing ("severity tier", HIPAA), no invented text when
  // the AI summary is missing, and no score for quizzes that aren't scored.
  const { hasRealScore } = await import("../../lib/wellbeing");
  const PLUM: [number, number, number] = [91, 58, 110];
  const INK: [number, number, number] = [31, 41, 55];
  const MUTED: [number, number, number] = [107, 114, 128];
  const W = 210, M = 20, CW = W - M * 2;
  const dateStr = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  // Top line: wordmark + date
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...PLUM);
  doc.text("WellMindly", M, 22);
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(dateStr, W - M, 22, { align: "right" });
  doc.setDrawColor(229, 231, 235);
  doc.line(M, 27, W - M, 27);

  // Title
  let y = 44;
  if (params.category) {
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(params.category.toUpperCase(), M, y);
    y += 7;
  }
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...INK);
  const titleLines = doc.splitTextToSize(params.title, CW);
  doc.text(titleLines, M, y);
  y += titleLines.length * 9 + 4;

  // Highlight card: the headline / result in words, then the score if real.
  const headline = params.headline || params.classification;
  const showScore =
    params.score !== undefined && hasRealScore(params.title, params.score, params.maxScore);
  if (headline || showScore) {
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(15);
    const hl = headline ? doc.splitTextToSize(headline, CW - 16) : [];
    const cardH = 14 + hl.length * 7 + (showScore ? 16 : 0);
    doc.setFillColor(246, 241, 248);
    doc.roundedRect(M, y, CW, cardH, 4, 4, "F");
    let cy = y + 12;
    if (hl.length) {
      doc.setTextColor(...PLUM);
      doc.text(hl, M + 8, cy);
      cy += hl.length * 7 + 2;
    }
    if (showScore && params.maxScore) {
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...MUTED);
      doc.text(`Score ${params.score} of ${params.maxScore}`, M + 8, cy + 2);
      const barX = M + 50, barW = CW - 58, pct = Math.max(0, Math.min(1, (params.score ?? 0) / params.maxScore));
      doc.setFillColor(226, 214, 233);
      doc.roundedRect(barX, cy - 1, barW, 3.5, 1.75, 1.75, "F");
      doc.setFillColor(...PLUM);
      if (pct > 0) doc.roundedRect(barX, cy - 1, Math.max(3.5, barW * pct), 3.5, 1.75, 1.75, "F");
    }
    y += cardH + 12;
  }

  const section = (heading: string, text: string) => {
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...INK);
    doc.text(heading, M, y);
    y += 7;
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(55, 65, 81);
    const lines = doc.splitTextToSize(text, CW);
    doc.text(lines, M, y, { lineHeightFactor: 1.5 });
    y += lines.length * 5.6 + 10;
  };
  if (params.narrative) section("What this means", params.narrative);
  if (params.tip) section("Something to try", params.tip);
  if (!params.narrative && !params.tip) {
    section("Your result", "Open WellMindly to see your full result and explore what it means for you.");
  }

  // Footer
  doc.setDrawColor(229, 231, 235);
  doc.line(M, 270, W - M, 270);
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  doc.text(
    doc.splitTextToSize(
      "This is a reflection tool, not a diagnosis. If things feel heavy, you don't have to handle it alone: find free helplines at wellmindly.com/crisis.",
      CW,
    ),
    M,
    276,
  );

  const fileName = `WellMindly_${params.title.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "")}_${new Date().toISOString().slice(0, 10)}.pdf`;

  // Web: jsPDF's blob download works. Native (Capacitor Android/iOS): the WebView
  // has no download bridge, so doc.save() silently does nothing - the "Save PDF"
  // button appeared broken. Instead write the file into the app cache and hand it
  // to the OS share sheet, which lets the student save to Files/Drive or send it on.
  if (isNativeApp()) {
    try {
      const [{ Filesystem, Directory }, { Share }] = await Promise.all([
        import("@capacitor/filesystem"),
        import("@capacitor/share"),
      ]);
      const base64 = doc.output("datauristring").split(",")[1];
      const { uri } = await Filesystem.writeFile({
        path: fileName,
        data: base64,
        directory: Directory.Cache,
      });
      await Share.share({
        title: "WellMindly Assessment Report",
        text: "Your WellMindly result.",
        url: uri,
        dialogTitle: "Save or share your report",
      });
      return;
    } catch (err) {
      // Bridge/plugin unavailable - fall back to the browser save below rather
      // than leaving the student with nothing.
      console.error("Native PDF share failed; falling back to browser save:", err);
    }
  }

  doc.save(fileName);
}
