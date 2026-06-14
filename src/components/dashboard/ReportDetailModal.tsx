import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ClipboardList, Clock, Info, Download, Sparkles, AlertCircle } from "lucide-react";
import html2canvas from "html2canvas-pro";

interface ReportDetailModalProps {
  report: any | null;
  onClose: () => void;
}

/* ── Dimension bar helper ───────────────────────────────── */
function DimensionBar({
  label,
  status,
  statusColor,
  barColor,
  width,
}: {
  label: string;
  status: string;
  statusColor: string;
  barColor: string;
  width: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-xs sm:text-sm font-bold mb-1.5">
        <span className="text-slate-700">{label}</span>
        <span className={statusColor}>{status}</span>
      </div>
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <div className={`h-full ${barColor}`} style={{ width }} />
      </div>
    </div>
  );
}

/* ── Breakdown configs per quiz type ────────────────────── */
function renderBreakdownForTitle(report: any) {
  const title = report?.quizTitle || "";
  const t = title.toLowerCase();
  const score = report?.score || 0;
  const scores = report?.answers?.scores || report?.scores;

  if (scores) {
    const isPhq9 = t.includes("phq") || t.includes("screening");
    const isCheckin = t.includes("check-in") || t.includes("checkin");
    
    return (
      <div className="space-y-4">
        {Object.entries(scores).map(([label, val]: [string, any]) => {
          const value = Number(val);
          const status = isPhq9
            ? (value >= 75 ? 'Nearly every day' : value >= 55 ? 'More than half the days' : value >= 35 ? 'Several days' : 'Not at all')
            : isCheckin
              ? (value >= 70 ? 'Stable' : value >= 45 ? 'Moderate' : 'Needs Focus')
              : (value >= 75 ? 'Dominant Strength' : value >= 55 ? 'Strong' : value >= 35 ? 'Developing' : 'Room to grow');
              
          const statusColor = isPhq9
            ? (value >= 75 ? 'text-rose-600' : value >= 55 ? 'text-orange-600' : value >= 35 ? 'text-amber-600' : 'text-emerald-600')
            : (value >= 70 ? 'text-emerald-600' : value >= 45 ? 'text-plum' : 'text-amber-600');
            
          const barColor = isPhq9
            ? (value >= 75 ? 'bg-rose-500' : value >= 55 ? 'bg-orange-500' : value >= 35 ? 'bg-amber-500' : 'bg-emerald-500')
            : (value >= 70 ? 'bg-emerald-500' : value >= 45 ? 'bg-plum' : 'bg-amber-500');

          return (
            <DimensionBar
              key={label}
              label={label}
              status={`${status} (${value}%)`}
              statusColor={statusColor}
              barColor={barColor}
              width={`${value}%`}
            />
          );
        })}
      </div>
    );
  }

  if (t.includes("strengths") && !t.includes("shadow")) {
    return (
      <div className="space-y-4">
        <DimensionBar label="Curiosity & Love of Learning" status="Dominant Strength" statusColor="text-emerald-600" barColor="bg-emerald-500" width="85%" />
        <DimensionBar label="Perseverance & Drive" status="Dominant Strength" statusColor="text-emerald-600" barColor="bg-emerald-500" width="90%" />
        <DimensionBar label="Kindness & Social Empathy" status="Strong" statusColor="text-plum" barColor="bg-plum" width="75%" />
        <DimensionBar label="Gratitude & Hope" status="Strong" statusColor="text-plum" barColor="bg-plum" width="85%" />
      </div>
    );
  }

  if (t.includes("personality") || t.includes("bigfive") || t.includes("big five")) {
    return (
      <div className="space-y-4">
        <DimensionBar label="Openness to Experience" status="High (78%)" statusColor="text-emerald-600" barColor="bg-emerald-500" width="78%" />
        <DimensionBar label="Conscientiousness" status="High (82%)" statusColor="text-emerald-600" barColor="bg-emerald-500" width="82%" />
        <DimensionBar label="Extraversion" status="Moderate (60%)" statusColor="text-plum" barColor="bg-plum" width="60%" />
        <DimensionBar label="Agreeableness" status="High (88%)" statusColor="text-emerald-600" barColor="bg-emerald-500" width="88%" />
      </div>
    );
  }

  if (t.includes("values")) {
    return (
      <div className="space-y-4">
        <DimensionBar label="Growth & Autonomy Focus" status="Primary Value (92%)" statusColor="text-emerald-600" barColor="bg-emerald-500" width="92%" />
        <DimensionBar label="Freedom & Flexibility" status="Primary Value (85%)" statusColor="text-emerald-600" barColor="bg-emerald-500" width="85%" />
        <DimensionBar label="Achievement & Purpose" status="Supporting Value (80%)" statusColor="text-plum" barColor="bg-plum" width="80%" />
      </div>
    );
  }

  if (t.includes("check-in") || t.includes("checkin")) {
    return (
      <div className="space-y-4">
        <DimensionBar label="Good Spirits & Cheerfulness" status="Stable (70%)" statusColor="text-plum" barColor="bg-plum" width="70%" />
        <DimensionBar label="Calmness & Peace" status="Moderate (65%)" statusColor="text-plum" barColor="bg-plum" width="65%" />
        <DimensionBar label="Rest & Sleep Freshness" status="Needs Focus (50%)" statusColor="text-amber-600" barColor="bg-amber-500" width="50%" />
        <DimensionBar label="Connectedness" status="High (85%)" statusColor="text-emerald-600" barColor="bg-emerald-500" width="85%" />
      </div>
    );
  }

  if (t.includes("mood") || t.includes("snapshot")) {
    return (
      <div className="space-y-4">
        <DimensionBar label="Emotional Brightness" status="High (75%)" statusColor="text-emerald-600" barColor="bg-emerald-500" width="75%" />
        <DimensionBar label="Inner Balance" status="Steady (80%)" statusColor="text-plum" barColor="bg-plum" width="80%" />
      </div>
    );
  }

  // Default (clinical / PHQ-9)
  return (
    <div className="space-y-4">
      <DimensionBar
        label="Sleep Quality & Sleep Latency"
        status={score > 9 ? "Needs Focus (Restless)" : "Healthy (Deep)"}
        statusColor={score > 9 ? "text-amber-600" : "text-emerald-600"}
        barColor={score > 9 ? "bg-amber-500" : "bg-emerald-500"}
        width={`${score > 9 ? 45 : 82}%`}
      />
      <DimensionBar
        label="Social Connectedness & Support"
        status="Stable"
        statusColor="text-emerald-600"
        barColor="bg-emerald-500"
        width="78%"
      />
      <DimensionBar
        label="Study Concentration & Cognitive Load"
        status={score > 12 ? "High Stress (Scattered)" : score > 5 ? "Moderate" : "Focused"}
        statusColor={score > 5 ? "text-blue-600" : "text-emerald-600"}
        barColor={`${score > 12 ? "bg-rose-500" : score > 5 ? "bg-blue-500" : "bg-emerald-500"}`}
        width={`${score > 12 ? 35 : score > 5 ? 60 : 88}%`}
      />
    </div>
  );
}

/* ── Narrative configs per quiz type ────────────────────── */
function renderNarrative(title: string, classification: string, score: number) {
  const t = title.toLowerCase();

  if (t.includes("strengths") && !t.includes("shadow")) {
    return (
      <p className="text-sm text-slate-600 leading-relaxed font-medium">
        Your signature strengths profile indicates a high degree of core drive and resilience, with key focus elements of <span className="font-semibold text-plum">{classification}</span>. Engaging these natural strengths in challenging project groups will help you maintain high confidence.
      </p>
    );
  }
  if (t.includes("personality") || t.includes("bigfive") || t.includes("big five")) {
    return (
      <p className="text-sm text-slate-600 leading-relaxed font-medium">
        You align with the archetype of <span className="font-semibold text-plum">{classification}</span>. Balancing high openness with active conscientiousness makes you excellent at self-directed work. We recommend establishing stable work routines to preserve your energy.
      </p>
    );
  }
  if (t.includes("values")) {
    return (
      <p className="text-sm text-slate-600 leading-relaxed font-medium">
        Living in alignment with your core values of <span className="font-semibold text-plum">{classification}</span> helps prevent cognitive burnout. If you find your current classes feeling stagnant, consider adding independent study options to boost engagement.
      </p>
    );
  }
  if (t.includes("check-in") || t.includes("checkin")) {
    return (
      <p className="text-sm text-slate-600 leading-relaxed font-medium">
        Your latest self-reflection check-in points to <span className="font-semibold text-plum">{classification}</span>. While you feel connected, sleep recovery is lower than optimal. Consider integrating relaxing breathing exercises for 10 minutes before bed.
      </p>
    );
  }
  if (t.includes("mood") || t.includes("snapshot")) {
    return (
      <p className="text-sm text-slate-600 leading-relaxed font-medium">
        You rated your immediate emotional tone as <span className="font-semibold text-plum">{classification}</span>. Snapshots are great for tracking high-frequency fluctuations. Check-in regularly to view your emotional patterns on your overview timeline!
      </p>
    );
  }
  
  // Default / PHQ-9 (clinical-grade)
  const isSevere = classification.toLowerCase().includes("severe") || score > 12;
  const isModerate = classification.toLowerCase().includes("moderate") || (score > 7 && score <= 12);
  const isMild = classification.toLowerCase().includes("mild") || (score > 4 && score <= 7);

  if (isSevere) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-600 leading-relaxed font-medium">
          Based on your score classification of <span className="font-semibold text-rose-600">{classification}</span>, you are carrying a heavy load right now. This index indicates significant well-being strain.
        </p>
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex gap-3 text-red-800">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-xs font-semibold leading-relaxed">
            <b>Action Advised</b>: We strongly encourage you to connect with a campus counselor or professional support services. Remember, reaching out is a strength, and you do not have to carry this alone. Refer to the crisis links banner in your dashboard if you need immediate hotlines.
          </p>
        </div>
      </div>
    );
  }

  if (isModerate) {
    return (
      <p className="text-sm text-slate-600 leading-relaxed font-medium">
        Based on your score classification of <span className="font-semibold text-amber-600">{classification}</span>, we recommend booking a free session with one of our wellbeing coaches. A coach can help you talk through what's heavy and map out small, practical steps for balance.
      </p>
    );
  }

  if (isMild) {
    return (
      <p className="text-sm text-slate-600 leading-relaxed font-medium">
        Based on your score classification of <span className="font-semibold text-blue-600">{classification}</span>, we suggest prioritizing self-care, scheduling structured breaks, and tracking your check-ins daily. Exploring the signature strengths or core values tests in the Discover tab will help bring focus.
      </p>
    );
  }

  return (
    <p className="text-sm text-slate-600 leading-relaxed font-medium">
      Based on your score classification of <span className="font-semibold text-emerald-600">{classification}</span>, your well-being indices look steady and balanced. Keep checking in regularly to continue building your private mosaic moodboard pattern!
    </p>
  );
}

/* ── Main component ─────────────────────────────────────── */
export function ReportDetailModal({ report, onClose }: ReportDetailModalProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!reportRef.current) return;
    try {
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        logging: false
      });
      const a = document.createElement("a");
      const filename = report ? report.quizTitle.toLowerCase().replace(/\s+/g, "-") : "report";
      a.download = `wellmindly-${filename}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    } catch (err) {
      console.error("Failed to download report image:", err);
    }
  };

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    try {
      const { jsPDF } = await import("jspdf");
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      const filename = report ? report.quizTitle.toLowerCase().replace(/\s+/g, "-") : "report";
      pdf.save(`wellmindly-${filename}.pdf`);
    } catch (err) {
      console.error("Failed to download report PDF:", err);
    }
  };

  return (
    <AnimatePresence>
      {report && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="w-full max-w-2xl bg-white rounded-[2rem] p-8 md:p-10 shadow-2xl relative border border-slate-100 max-h-[90vh] overflow-y-auto"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors border-none cursor-pointer outline-none z-10"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Printable Area Wrapper */}
            <div ref={reportRef} className="bg-white p-2">
              <div className="flex items-center gap-3.5 mb-6 pb-6 border-b border-slate-100">
                <div className="h-12 w-12 bg-plum/10 text-plum rounded-2xl flex items-center justify-center shrink-0">
                  <ClipboardList className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 leading-tight">
                    {report.quizTitle || "Well-being Assessment"}
                  </h3>
                  <p className="text-slate-500 font-medium text-xs mt-1.5 flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" /> Completed on{" "}
                    {new Date(report.date).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Score Section */}
                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex flex-col justify-center text-center sm:text-left">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                    Overall Score
                  </h4>
                  <div className="flex items-baseline gap-2 justify-center sm:justify-start">
                    <span className="text-6xl font-black text-slate-900 tracking-tighter">
                      {report.score}
                    </span>
                    <span className="text-xl font-bold text-slate-400">/ {report.maxScore}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-4 leading-relaxed">
                    This score measures cumulative wellness indices across sleep quality, focus
                    dynamics, and stress triggers.
                  </p>
                </div>

                {/* Classification Section */}
                <div className="bg-plum/5 rounded-3xl p-6 border border-plum/10 flex flex-col justify-center">
                  <h4 className="text-[10px] font-black text-plum/70 uppercase tracking-widest mb-2.5">
                    Severity Evaluation
                  </h4>
                  <span className="text-2xl font-black text-plum leading-tight mb-4">
                    {report.classification}
                  </span>
                  <div className="w-full bg-plum/10 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-plum h-full rounded-full transition-all duration-1000"
                      style={{ width: `${report.percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Detailed Insights & Breakdown Section */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-plum" /> Detailed Dimension Analysis
                  </h4>
                  {report.aiFeedback?.insights && report.aiFeedback.insights.length > 0 ? (
                    <ul className="space-y-2.5">
                      {report.aiFeedback.insights.map((insight: string, idx: number) => (
                        <li key={idx} className="flex gap-2.5 items-start text-xs sm:text-sm font-medium text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                          <span className="h-5 w-5 rounded-full bg-plum/10 text-plum flex items-center justify-center text-[10px] shrink-0 font-bold mt-0.5">{idx + 1}</span>
                          <span className="leading-relaxed">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    renderBreakdownForTitle(report)
                  )}
                </div>

                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 mt-6">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Info className="h-4 w-4 text-plum" /> Recommended Action Narrative
                  </h4>
                  {report.aiFeedback?.narrative ? (
                    <div className="space-y-2.5">
                      <p className="text-xs sm:text-sm font-bold text-slate-800">{report.aiFeedback.headline}</p>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">{report.aiFeedback.narrative}</p>
                      {report.aiFeedback.tip && (
                        <p className="text-xs text-plum font-semibold mt-2 bg-plum/5 p-3 rounded-lg border border-plum/10 leading-relaxed">
                          💡 <b>Tip</b>: {report.aiFeedback.tip}
                        </p>
                      )}
                    </div>
                  ) : (
                    renderNarrative(report.quizTitle || "", report.classification, report.score)
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons Footer */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={handleDownload}
                className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl px-6 py-3.5 font-bold text-sm transition-colors cursor-pointer border-none outline-none font-sans"
              >
                <Download className="h-4 w-4 text-slate-500" />
                Save Report Card
              </button>
              <button
                onClick={handleDownloadPdf}
                className="inline-flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-2xl px-6 py-3.5 font-bold text-sm transition-colors cursor-pointer border-none outline-none font-sans"
              >
                <Download className="h-4 w-4 text-indigo-500" />
                Save PDF
              </button>
              <button
                onClick={onClose}
                className="bg-plum hover:bg-plum/90 text-white rounded-2xl px-8 py-3.5 font-bold text-sm transition-colors cursor-pointer border-none outline-none shadow-md shadow-plum/10 font-sans"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
