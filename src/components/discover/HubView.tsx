import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { ActionCard, Badge, Chip, SectionHeader } from "../ui";
import { staggerItem, staggerParent } from "../../lib/motion";
import { DiscoverIcon } from "./DiscoverIcon";
import { TESTS, DISCOVER_TEST_ORDER, loadAll } from "./types";

interface HubViewProps {
  startTest: (id: string) => void;
  goTo: (v: 'hub' | 'test' | 'result' | 'results') => void;
  /**
   * Heading level for the hub's own title. `h1` on /discover, where this is
   * the page's only heading; `h2` inside the dashboard, which renders its own
   * <h2> above this component (DiscoverTab.tsx:85).
   */
  as?: "h1" | "h2";
}

export function HubView({ startTest, goTo, as = "h1" }: HubViewProps) {
  const all = loadAll();
  return (
    <div className="pt-12 sm:pt-14">
      <SectionHeader
        as={as}
        eyebrow="Self-discovery"
        title={<>Get to know <em className="italic text-plum-500">yourself.</em></>}
        description="Five quick self-discovery tests. Each takes about two minutes and hands back something worth keeping. Follow your curiosity, there's no wrong place to begin."
      />

      <div className="mt-5 flex flex-wrap gap-2">
        {["~2 minutes", "Private to you", "Never a diagnosis"].map((t) => (
          <Badge key={t} tone="primary" size="md" icon={<Check />}>
            {t}
          </Badge>
        ))}
      </div>

      {/* Tabs */}
      <div className="mt-8 mb-4 flex flex-wrap gap-2">
        <Chip selected onClick={() => goTo("hub")}>All tests</Chip>
        <Chip onClick={() => goTo("results")}>My collection</Chip>
      </div>

      {/* Grid */}
      <motion.div
        variants={staggerParent(0.06)}
        initial="hidden"
        animate="show"
        className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {DISCOVER_TEST_ORDER.map((id) => {
          const t = TESTS[id];
          if (!t) return null;
          const done = all[id]?.length;
          return (
            <ActionCard
              key={id}
              variants={staggerItem}
              onClick={() => startTest(id)}
              padding="none"
              className="group overflow-hidden"
            >
              {done ? (
                <Badge tone="primary" className="absolute right-3.5 top-3.5 z-[3]" icon={<Check />}>
                  Done
                </Badge>
              ) : null}
              {/* Banner */}
              <div className="h-[82px] relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.accentTo})` }}>
                <svg className="absolute inset-0 w-full h-full opacity-[.08]" viewBox="0 0 200 80">
                  <circle cx="160" cy="20" r="40" fill="var(--color-on-primary)" />
                  <circle cx="30" cy="60" r="25" fill="var(--color-on-primary)" />
                  <circle cx="100" cy="10" r="15" fill="var(--color-on-primary)" />
                </svg>
                <div 
                  className="absolute bottom-0 left-5 translate-y-[50%] w-[50px] h-[50px] rounded-[14px] flex items-center justify-center border-3 border-card z-[2] shadow-md"
                  style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.accentTo})` }}
                >
                  <DiscoverIcon name={t.icon} className="w-6 h-6 text-on-primary" />
                </div>
              </div>
              {/* Body */}
              <div className="pt-8 pb-5 px-5">
                <h3 className="font-display text-lg font-semibold mb-1.5 text-ink">{t.title}</h3>
                <p className="text-ink-soft text-xs leading-snug mb-4 font-medium">{t.blurb}</p>
                <Badge tone="neutral">{t.tag || "~2 min"}</Badge>
              </div>
            </ActionCard>
          );
        })}
      </motion.div>

      <div className="text-2xs text-ink-soft bg-paper-2/60 rounded-2xl p-4.5 border border-line mt-8 leading-relaxed font-semibold">
        WellMindly is a non-clinical self-reflection &amp; self-discovery tool, not a medical or psychological assessment. It doesn't diagnose anything. If something feels heavy, talking to a counsellor or someone you trust can help.
      </div>
    </div>
  );
}
