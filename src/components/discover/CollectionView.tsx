import { useState } from "react";
import { Compass } from "lucide-react";
import { DiscoverIcon } from "./DiscoverIcon";
import { TESTS, loadAll, saveAll } from "./types";
import type { SavedResult } from "./types";
import { ActionCard, Badge, Chip, ConfirmSheet, EmptyState, Button, SectionHeader } from "../ui";

interface CollectionViewProps {
  startTest: (id: string) => void;
  goTo: (v: 'hub' | 'test' | 'result' | 'results') => void;
  showToast: (m: string) => void;
}

export function CollectionView({ startTest, goTo, showToast }: CollectionViewProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [, forceUpdate] = useState(0);
  const all = loadAll();
  const ids = Object.keys(all).filter(id => all[id]?.length && TESTS[id]);
  const attempts = ids.flatMap(id => 
    all[id].map((attempt, index) => ({
      id,
      attempt,
      index,
      totalAttempts: all[id].length
    }))
  ).sort((a, b) => b.attempt.t - a.attempt.t);

  const wipeAll = () => {
    saveAll({} as Record<string, SavedResult[]>);
    setConfirmOpen(false);
    forceUpdate((n) => n + 1);
    showToast('All data cleared.');
  };

  return (
    <div className="pt-12 sm:pt-14">
      <SectionHeader
        as="h1"
        eyebrow="Your collection"
        title={<>What you've <em className="italic text-plum-500">discovered.</em></>}
        description="Everything from your tests so far. Re-take any test to watch how you shift."
      />

      {/* Tabs */}
      <div className="mt-8 mb-4 flex flex-wrap gap-2">
        <Chip onClick={() => goTo("hub")}>All tests</Chip>
        <Chip selected onClick={() => goTo("results")}>My collection</Chip>
      </div>

      {attempts.length === 0 ? (
        <EmptyState
          icon={<Compass />}
          title="Nothing saved yet"
          description="Take a test and your results will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {attempts.map(({ id, attempt, index, totalAttempts }) => {
            const t = TESTS[id];
            const d = new Date(attempt.t);
            return (
              <ActionCard key={`${id}-${index}`} onClick={() => startTest(id)} className="overflow-hidden">
                {totalAttempts > 1 && (
                  <Badge tone="neutral" className="absolute right-3.5 top-3.5">
                    Attempt #{index + 1}
                  </Badge>
                )}
                <div className="mb-3 flex items-center gap-2.5 pr-20">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm"
                    style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.accentTo})` }}
                  >
                    <DiscoverIcon name={t.icon} className="h-4.5 w-4.5 text-on-primary" />
                  </div>
                  <span className="truncate font-display text-base font-semibold text-ink-900">{t.title}</span>
                </div>
                <p className="mb-2 text-sm text-ink-600">{attempt.summary}</p>
                <p className="text-2xs font-semibold text-ink-500">
                  {d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · {d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </p>
              </ActionCard>
            );
          })}
        </div>
      )}

      {ids.length > 0 && (
        <Button variant="outline" size="sm" className="mt-8" onClick={() => setConfirmOpen(true)}>
          Reset all data
        </Button>
      )}

      <ConfirmSheet
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={wipeAll}
        title="Clear all your saved results?"
        description="This can't be undone."
        confirmLabel="Reset all data"
        destructive
      />
    </div>
  );
}
