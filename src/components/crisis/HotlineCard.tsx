import { Phone, ExternalLink } from "lucide-react";
import { Badge } from "../ui/Badge";
import { type CrisisHotline, CATEGORY_TONE_MAP } from "./hotlines";

interface HotlineCardProps {
  hotline: CrisisHotline;
}

export function HotlineCard({ hotline }: HotlineCardProps) {
  const tone = CATEGORY_TONE_MAP[hotline.category] || "neutral";

  return (
    <div className="bg-card border border-ink-200/70 rounded-[2rem] p-7 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <Badge tone={tone} size="sm">
            {hotline.category}
          </Badge>
          <Badge tone="neutral" size="sm">
            {hotline.country}
          </Badge>
        </div>
        <h3 className="font-display text-lg font-bold text-ink-900 mb-2">
          {hotline.name}
        </h3>
        <p className="text-ink-600 text-xs leading-relaxed mb-6 font-medium">
          {hotline.description}
        </p>
      </div>

      {/* Call and Website Action Buttons side-by-side */}
      <div className="flex flex-col sm:flex-row gap-2.5 mt-auto">
        {hotline.phone &&
        hotline.phone !== "Online Support" &&
        hotline.phone !== "Online only" ? (
          <a
            href={`tel:${hotline.phone.replace(/[^0-9+]/g, "")}`}
            className="flex-1 flex items-center justify-center gap-2 bg-ink-900 text-ink-50 hover:bg-ink-800 transition-colors py-3.5 px-4 rounded-xl font-bold text-xs shadow-sm hover:shadow active:scale-[0.99]"
          >
            <Phone className="w-3.5 h-3.5" />
            Call {hotline.phone}
          </a>
        ) : null}

        {hotline.website ? (
          <a
            href={hotline.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-card text-ink-900 border border-ink-200/70 hover:bg-ink-50 transition-colors py-3.5 px-4 rounded-xl font-bold text-xs shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5 text-ink-600" />
            Website
          </a>
        ) : null}
      </div>
    </div>
  );
}
