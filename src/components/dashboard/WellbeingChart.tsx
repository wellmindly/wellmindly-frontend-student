import { LineChart } from "lucide-react";
import { Card, Button, EmptyState } from "../ui";
import { formatDayMonth, formatFullDate } from "../../lib/format";
import { cn } from "../../lib/cn";
import { displayQuizTitle } from "../../lib/wellbeing";
import type { TimelinePoint } from "../../types/student";

export interface WellbeingChartProps {
  timeline: TimelinePoint[] | undefined;
  onViewDetails: () => void;
}

const VB_W = 1000;
const VB_H = 256;

/** 0% sits on the baseline, 100% on the top gridline - so the labels are true. */
const yFor = (percentage: number) =>
  VB_H - (Math.max(0, Math.min(100, percentage)) / 100) * VB_H;

export function WellbeingChart({ timeline, onViewDetails }: WellbeingChartProps) {
  const points = (timeline || []).map((report, idx, arr) => {
    const N = arr.length;
    const x = N > 1 ? (idx / (N - 1)) * VB_W : VB_W / 2;
    const y = yFor(report.percentage);
    return {
      ...report,
      x,
      y,
      xPct: (x / VB_W) * 100,
      yPct: (y / VB_H) * 100,
    };
  });

  const N = points.length;

  // Build summary for SVG aria-label
  let summary = "Wellbeing trajectory chart";
  if (N > 0) {
    const first = points[0];
    const last = points[N - 1];
    const diff = last.percentage - first.percentage;
    const diffText =
      diff === 0
        ? `level at ${last.percentage}%`
        : `${diff > 0 ? "up" : "down"} ${Math.abs(diff)} points since the first`;
    summary = `Wellbeing trajectory: ${N} snapshots from ${formatDayMonth(
      first.date
    )} to ${formatDayMonth(last.date)}. Latest ${last.percentage}%, ${diffText}.`;
  }

  let linePath = "";
  let areaPath = "";
  if (N >= 2) {
    linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      linePath += ` L ${points[i].x} ${points[i].y}`;
    }
    areaPath = `${linePath} L ${points[points.length - 1].x} 256 L ${points[0].x} 256 Z`;
  }

  const uniqueTitles = Array.from(
    new Set((timeline || []).map((t) => displayQuizTitle(t.quizTitle)).filter(Boolean))
  ).sort();

  return (
    <section aria-labelledby="wellbeing-chart-heading">
      <Card padding="lg">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 id="wellbeing-chart-heading" className="text-xl font-black text-ink-900">
              Well-being Trajectory
            </h2>
            <p className="text-ink-500 font-medium text-sm mt-1">
              Historical scores based on check-ins
            </p>
            {uniqueTitles.length > 1 && (
              <p className="text-2xs text-ink-500 mt-1 font-medium">
                Includes: {uniqueTitles.join(", ")}
              </p>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onViewDetails}>
            View Details
          </Button>
        </div>

        {N === 0 ? (
          <EmptyState
            size="sm"
            icon={<LineChart className="h-6 w-6" aria-hidden="true" />}
            title="Nothing to plot yet"
            description="Your wellbeing snapshots appear here as a line you can follow. The first one gives it a starting point."
            action={{ label: "See assessments", onClick: onViewDetails }}
          />
        ) : (
          <>
            <div className="w-full h-64 relative flex items-end justify-between pl-8 pb-6 pr-4">
              {/* Y-Axis Labels */}
              <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs font-bold text-ink-500">
                <span>100</span>
                <span>75</span>
                <span>50</span>
                <span>25</span>
                <span>0</span>
              </div>

              {/* Chart SVG */}
              <div className="absolute inset-0 left-8 bottom-6 right-4 overflow-hidden">
                <svg
                  viewBox="0 0 1000 256"
                  preserveAspectRatio="none"
                  role="img"
                  aria-label={summary}
                  className="h-full w-full"
                >
                  {/* Grid lines */}
                  <line
                    x1="0"
                    y1="0"
                    x2="1000"
                    y2="0"
                    vectorEffect="non-scaling-stroke"
                    className="stroke-ink-100"
                    strokeWidth="1"
                  />
                  <line
                    x1="0"
                    y1="64"
                    x2="1000"
                    y2="64"
                    vectorEffect="non-scaling-stroke"
                    className="stroke-ink-100"
                    strokeWidth="1"
                  />
                  <line
                    x1="0"
                    y1="128"
                    x2="1000"
                    y2="128"
                    vectorEffect="non-scaling-stroke"
                    className="stroke-ink-100"
                    strokeWidth="1"
                  />
                  <line
                    x1="0"
                    y1="192"
                    x2="1000"
                    y2="192"
                    vectorEffect="non-scaling-stroke"
                    className="stroke-ink-100"
                    strokeWidth="1"
                  />
                  <line
                    x1="0"
                    y1="256"
                    x2="1000"
                    y2="256"
                    vectorEffect="non-scaling-stroke"
                    className="stroke-ink-300"
                    strokeWidth="1"
                  />

                  {/* Area fill */}
                  {areaPath && <path d={areaPath} className="fill-plum-500/15" />}

                  {/* Trajectory stroke line */}
                  {linePath && (
                    <path
                      d={linePath}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                      className="text-plum-600"
                    />
                  )}
                </svg>

                {/* HTML Data Dots (rendered as true circular dots) */}
                {points.map((p, i) => (
                  <span
                    key={p.id || i}
                    aria-hidden="true"
                    className={cn(
                      "absolute -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none",
                      i === points.length - 1
                        ? "h-3 w-3 bg-card ring-[3px] ring-plum-600"
                        : "h-2 w-2 bg-plum-600"
                    )}
                    style={{ left: `${p.xPct}%`, top: `${p.yPct}%` }}
                  />
                ))}
              </div>

              {/* X-Axis Labels */}
              <div className="absolute bottom-0 left-8 right-4 flex justify-between text-2xs font-bold text-ink-500">
                {points.map((report, idx) => {
                  const step = Math.max(1, Math.round(N / 4));
                  const isLabel =
                    idx === 0 ||
                    idx === N - 1 ||
                    (idx % step === 0 && idx !== 0 && idx !== N - 1);
                  return (
                    <span key={report.id || idx}>
                      {isLabel ? formatDayMonth(report.date) : ""}
                    </span>
                  );
                })}
              </div>
            </div>

            {N === 1 && (
              <p className="text-xs text-ink-600 font-medium mt-3 text-center">
                One snapshot so far: {formatDayMonth(points[0].date)}, {points[0].percentage}%. A
                second one gives this a direction.
              </p>
            )}

            {/* Accessible sr-only Table representation */}
            <table className="sr-only">
              <caption>Wellbeing snapshots, oldest first</caption>
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Assessment</th>
                  <th scope="col">Score</th>
                </tr>
              </thead>
              <tbody>
                {points.map((p, i) => (
                  <tr key={p.id || i}>
                    <td>{formatFullDate(p.date)}</td>
                    <td>{displayQuizTitle(p.quizTitle)}</td>
                    <td>{p.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </Card>
    </section>
  );
}
