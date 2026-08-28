import { Download } from "lucide-react";
import { Button, Badge } from "../ui";
import { downloadSampleReport } from "./sampleReport";

export function SampleReportSection() {
  return (
    <>
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-2xs font-bold text-coral uppercase tracking-widest block mb-3">
          Data Transparency
        </span>
        <h2 className="text-3xl font-display text-ink-900 tracking-tight font-medium">
          Sample Analytics Reports
        </h2>
        <p className="text-sm text-ink-600 mt-3">
          Preview the layout of the aggregate cohort report. Every figure shown below is an illustrative placeholder.
        </p>
      </div>

      <div className="bg-card border border-ink-200/70 rounded-[2.5rem] p-6 sm:p-10 shadow-sm grid lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="bg-teal/10 text-teal text-2xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Report Layout Preview
              </span>
              <Badge tone="neutral" size="sm">
                Illustrative figures
              </Badge>
            </div>
            <h3 className="text-xl font-bold text-ink-900 mt-3">
              Example University Report Specimen
            </h3>
            <p className="text-xs text-ink-600 mt-2 leading-relaxed">
              Aggregated cohort intelligence provides a clear timeline of stress hotspots and support uptake rates across departments, helping you allocate counselor resources where they are needed most.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-paper-2 rounded-2xl border border-ink-200/70 text-center">
              <div className="text-lg font-bold text-ink-900">6.8 / 10</div>
              <div className="text-2xs text-ink-600 font-semibold mt-1 font-sans">
                Campus Index
              </div>
            </div>
            <div className="p-4 bg-paper-2 rounded-2xl border border-ink-200/70 text-center">
              <div className="text-lg font-bold text-ink-900">61%</div>
              <div className="text-2xs text-ink-600 font-semibold mt-1 font-sans">
                Cohort Coverage
              </div>
            </div>
            <div className="p-4 bg-paper-2 rounded-2xl border border-ink-200/70 text-center">
              <div className="text-lg font-bold text-ink-900">4.2%</div>
              <div className="text-2xs text-ink-600 font-semibold mt-1 font-sans">
                Support Uptake
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-xs font-bold text-ink-900">
              Anonymized Stress Distribution:
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-2xs text-ink-600 font-semibold mb-1 font-sans">
                  <span>Mild Strain Tiers</span>
                  <span>64%</span>
                </div>
                <div className="w-full bg-paper-2 h-2 rounded-full overflow-hidden">
                  <div className="bg-teal h-full rounded-full" style={{ width: "64%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-2xs text-ink-600 font-semibold mb-1 font-sans">
                  <span>Moderate Strain Tiers</span>
                  <span>24%</span>
                </div>
                <div className="w-full bg-paper-2 h-2 rounded-full overflow-hidden">
                  <div className="bg-plum h-full rounded-full" style={{ width: "24%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-paper-2 border border-ink-200/70 rounded-2xl text-center space-y-4">
          <div className="w-14 h-14 bg-plum/10 text-plum rounded-full flex items-center justify-center">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-ink-900 text-sm">Download Sample PDF Report</h4>
            <p className="text-xs text-ink-600 mt-1 leading-relaxed">
              Get a copy of the high-fidelity sample PDF report showing aggregate department benchmarks, cohort retention correlations, and quarterly trends.
            </p>
          </div>
          <Button
            variant="primary"
            fullWidth
            leadingIcon={<Download className="w-4 h-4" />}
            onClick={downloadSampleReport}
          >
            Download PDF (A4)
          </Button>
        </div>
      </div>
    </>
  );
}
