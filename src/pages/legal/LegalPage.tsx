import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LandingHeader } from "../../components/landing/LandingHeader";
import { LandingFooter } from "../../components/landing/LandingFooter";
import type { LegalDoc } from "./legalContent";

/**
 * Shared layout for the Privacy Policy and Terms of Service pages. Mirrors the
 * public-page scaffold used by ContactPage (header + centred main + footer) but
 * narrows the column to a comfortable reading measure for long-form prose, and
 * renders the structured `LegalDoc` content model (paragraphs + bullet lists)
 * with a jump-to-section table of contents.
 */
export function LegalPage({ doc }: { doc: LegalDoc }) {
  const navigate = useNavigate();
  const handleCrisisClick = () => navigate("/crisis");

  return (
    <div className="min-h-screen bg-paper flex flex-col font-sans">
      <LandingHeader onCrisisClick={handleCrisisClick} />

      <main id="main-content" tabIndex={-1} className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
        <div className="mb-8">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inline-block px-3 py-1 bg-teal/10 text-teal rounded-full text-xs font-semibold uppercase tracking-wider mb-3"
          >
            Legal
          </motion.span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-ink-900 font-display tracking-tight">
            {doc.title}
          </h1>
          <p className="text-sm text-ink-600 mt-2">{doc.tagline}</p>
          <p className="text-xs text-ink-500 mt-3">Last updated: {doc.updated}</p>
        </div>

        {doc.intro.map((text, i) => (
          <p key={i} className="text-sm md:text-base text-ink-700 leading-relaxed mb-4">
            {text}
          </p>
        ))}

        {/* Table of contents */}
        <nav aria-label="Sections" className="mt-8 mb-10 bg-card border border-ink-200/70 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xs font-bold text-ink-900 uppercase tracking-wider mb-3">On this page</h2>
          <ol className="space-y-1.5">
            {doc.sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-sm text-ink-600 hover:text-plum transition-colors"
                >
                  {s.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="space-y-10">
          {doc.sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="text-lg md:text-xl font-bold text-ink-900 mb-3">{section.heading}</h2>
              <div className="space-y-3">
                {section.blocks.map((block, bi) =>
                  block.kind === "ul" ? (
                    <ul key={bi} className="list-disc pl-5 space-y-2 text-sm md:text-base text-ink-600 leading-relaxed">
                      {block.items?.map((item, ii) => (
                        <li key={ii}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p key={bi} className="text-sm md:text-base text-ink-600 leading-relaxed">
                      {block.text}
                    </p>
                  ),
                )}
              </div>
            </section>
          ))}
        </div>
      </main>

      <LandingFooter onCrisisClick={handleCrisisClick} />
    </div>
  );
}
