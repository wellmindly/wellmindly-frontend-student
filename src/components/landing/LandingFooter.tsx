import { useNavigate } from "react-router-dom";
import logoPng from "../../assets/logo.png";


interface LandingFooterProps {
  onCrisisClick: () => void;
}

export function LandingFooter({ onCrisisClick }: LandingFooterProps) {
  const navigate = useNavigate();

  return (
    <footer className="border-t border-line bg-paper-2/25 py-12 mt-16 text-xs text-ink-soft relative z-10">
      <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex flex-col items-center md:items-start gap-3">
          <div 
            onClick={() => navigate("/")}
            className="flex items-center gap-2 cursor-pointer hover:opacity-85 select-none transition-opacity"
            id="footer-logo-container"
          >
            <img src={logoPng} alt="WellMindly Logo" className="h-6 w-auto block select-none" />
          </div>
          <p className="text-center md:text-left text-[11px] max-w-sm">
            A space for self-discovery and peer support. We fit alongside campus care to help you understand what you carry.
          </p>
          <p className="text-center md:text-left text-[10px] text-ink-soft/80 mt-1">
            Developed by <a href="https://www.linkedin.com/in/jai-malani" target="_blank" rel="noreferrer" className="underline hover:text-plum font-semibold">Jai Malani</a>
          </p>
        </div>

        <div className="flex flex-col items-center md:items-end gap-4 text-center md:text-right">
          <p className="text-[11px] leading-relaxed max-w-md">
            🔒 Private & Secure. We do not share your details with your university. You are in control of your data, always.
          </p>
          
          <div className="flex items-center gap-2">
            <a href="https://instagram.com/wellmindly" target="_blank" rel="noreferrer" className="p-2 hover:bg-rose/10 hover:text-rose rounded-full transition-all text-ink-soft flex items-center justify-center" title="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>
            <a href="https://linkedin.com/company/wellmindly" target="_blank" rel="noreferrer" className="p-2 hover:bg-sky/10 hover:text-sky rounded-full transition-all text-ink-soft flex items-center justify-center" title="LinkedIn">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect width="4" height="12" x="2" y="9" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
            <a href="https://www.youtube.com/@WellMindly" target="_blank" rel="noreferrer" className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-full transition-all text-ink-soft flex items-center justify-center" title="YouTube">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z" />
                <polygon points="10 15 15 12 10 9" fill="currentColor" stroke="none" />
              </svg>
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-4 pt-1">
            <button
              onClick={onCrisisClick}
              className="text-ember font-bold hover:underline cursor-pointer border-none bg-transparent p-0 text-[inherit]"
            >
              Need help right now? View support helplines &rarr;
            </button>
            <span className="hidden sm:inline text-line">|</span>
            <span className="text-ink-soft select-none">&copy; {new Date().getFullYear()} WellMindly. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
