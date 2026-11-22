export async function downloadAssessmentPdf(params: {
  title: string;
  category?: string;
  score?: number;
  maxScore?: number;
  /** Wellbeing check-in: a higher total means more hard days. */
  lowerIsBetter?: boolean;
  classification?: string;
  headline?: string;
  narrative?: string;
  tip?: string;
  insights?: string[];
  /** [name, 0-100] pairs, already ranked. */
  dimensions?: [string, number][];
  dimensionWord?: (v: number) => string;
}): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const { isNativeApp } = await import("../../lib/native");
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // One calm, honest report: what the student took, where it sits, what it
  // suggests, one thing to try. No clinical framing, no invented text when the
  // summary is missing, and no score for quizzes that aren't scored.
  const { hasRealScore } = await import("../../lib/wellbeing");
  const PLUM: [number, number, number] = [91, 58, 110];
  const INK: [number, number, number] = [31, 41, 55];
  const BODY: [number, number, number] = [55, 65, 81];
  const MUTED: [number, number, number] = [107, 114, 128];
  const W = 210, M = 20, CW = W - M * 2, BOTTOM = 262;
  const dateStr = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const header = () => {
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
  };
  const footer = () => {
    doc.setDrawColor(229, 231, 235);
    doc.line(M, 270, W - M, 270);
    doc.setFont("Helvetica", "normal");
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
  };
  let y = 0;
  const ensure = (h: number) => {
    if (y + h > BOTTOM) {
      footer();
      doc.addPage();
      header();
      y = 40;
    }
  };

  header();

  // Title
  y = 44;
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

  // Highlight card: band label, headline, then the score if real.
  const showScore =
    params.score !== undefined && hasRealScore(params.title, params.score, params.maxScore);
  const headline = params.headline || params.classification;
  if (headline || showScore) {
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(15);
    const hl = headline ? doc.splitTextToSize(headline, CW - 16) : [];
    const hasLabel = !!params.classification && params.classification !== headline;
    const cardH = 12 + (hasLabel ? 7 : 0) + hl.length * 7 + (showScore ? 16 : 0);
    doc.setFillColor(246, 241, 248);
    doc.roundedRect(M, y, CW, cardH, 4, 4, "F");
    let cy = y + 11;
    if (hasLabel) {
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...MUTED);
      doc.text(params.classification!.toUpperCase(), M + 8, cy);
      cy += 7;
    }
    if (hl.length) {
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(15);
      doc.setTextColor(...PLUM);
      doc.text(hl, M + 8, cy);
      cy += hl.length * 7 + 2;
    }
    if (showScore && params.maxScore) {
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...MUTED);
      doc.text(
        `Score ${params.score} of ${params.maxScore}${params.lowerIsBetter ? " (lower is lighter)" : ""}`,
        M + 8,
        cy + 2,
      );
      const barX = M + 70, barW = CW - 78, pct = Math.max(0, Math.min(1, (params.score ?? 0) / params.maxScore));
      doc.setFillColor(226, 214, 233);
      doc.roundedRect(barX, cy - 1, barW, 3.5, 1.75, 1.75, "F");
      doc.setFillColor(...PLUM);
      if (pct > 0) doc.roundedRect(barX, cy - 1, Math.max(3.5, barW * pct), 3.5, 1.75, 1.75, "F");
    }
    y += cardH + 9;
  }

  // Reserve room for the heading plus a couple of lines, so a heading is
  // never left alone at the bottom of a page.
  const heading = (text: string) => {
    ensure(22);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...INK);
    doc.text(text, M, y);
    y += 6.5;
  };
  const para = (text: string) => {
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(...BODY);
    const lines = doc.splitTextToSize(text, CW);
    ensure(lines.length * 5.6);
    doc.text(lines, M, y, { lineHeightFactor: 1.45 });
    y += lines.length * 5.4 + 5;
  };

  if (params.narrative) {
    heading("What this means");
    para(params.narrative);
  }

  if (params.dimensions?.length) {
    heading("Your dimensions");
    for (const [name, value] of params.dimensions) {
      ensure(10);
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...BODY);
      doc.text(name, M, y);
      const word = params.dimensionWord ? params.dimensionWord(value) : "";
      doc.setTextColor(...MUTED);
      doc.text(word, W - M, y, { align: "right" });
      const bx = M + 45, bw = CW - 45 - 38, pct = Math.max(0, Math.min(1, value / 100));
      doc.setFillColor(237, 233, 240);
      doc.roundedRect(bx, y - 2.6, bw, 3, 1.5, 1.5, "F");
      doc.setFillColor(...PLUM);
      if (pct > 0) doc.roundedRect(bx, y - 2.6, Math.max(3, bw * pct), 3, 1.5, 1.5, "F");
      y += 7;
    }
    y += 2;
  }

  if (params.insights?.length) {
    heading("What stood out");
    for (const ins of params.insights) {
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(...BODY);
      const lines = doc.splitTextToSize(ins, CW - 6);
      ensure(lines.length * 5.6 + 2);
      doc.setFillColor(...PLUM);
      doc.circle(M + 1.2, y - 1.3, 0.9, "F");
      doc.text(lines, M + 6, y, { lineHeightFactor: 1.5 });
      y += lines.length * 5.4 + 1.5;
    }
    y += 4;
  }

  if (params.tip) {
    heading("Something to try");
    para(params.tip);
  }
  if (!params.narrative && !params.tip) {
    heading("Your result");
    para("Open WellMindly to see your full result and explore what it means for you.");
  }

  heading("If you want to talk it through");
  para(
    "In the WellMindly app you can write it out with WriteMindly, share anonymously with other students on TalkMindly, or book a 1-on-1 session with a counselor.",
  );

  footer();

  const fileName = `WellMindly_${params.title.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "")}_${new Date().toLocaleDateString("en-CA")}.pdf`;

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
