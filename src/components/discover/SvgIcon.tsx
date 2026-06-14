const ICONS: Record<string, string> = {
  heart: '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A3.5 3.5 0 0 0 12 6 3.5 3.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"/>',
  star: '<path d="M12 3l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.3 6.8 19l1-5.8L3.6 9.1l5.8-.8Z"/>',
  bloom: '<path d="M12 12c0-3 2-6 2-6s2 3 2 6-2 4-2 4-2-1-2-4Z"/><path d="M12 12c0-3-2-6-2-6s-2 3-2 6 2 4 2 4 2-1 2-4Z"/><path d="M12 16v5"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="M15 9l-2 5-5 2 2-5Z"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18"/>',
  cloud: '<path d="M7 18a4 4 0 1 1 .8-7.9A5 5 0 0 1 18 11a3.5 3.5 0 0 1-.5 7Z"/>',
  scale: '<path d="M12 4v16M6 8h12M6 8l-3 6a3 3 0 0 0 6 0ZM18 8l-3 6a3 3 0 0 0 6 0Z"/>',
  shield: '<path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6Z"/>',
  check: '<path d="M5 12l4 4L19 7"/>',
  clipboard: '<rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',
};

export function SvgIcon({ name, className }: { name: string; className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      className={className || 'w-6 h-6 stroke-white fill-none'}
      style={{ strokeWidth: 1.8 }} 
      dangerouslySetInnerHTML={{ __html: ICONS[name] || '' }} 
    />
  );
}
