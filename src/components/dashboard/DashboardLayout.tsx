import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BrainCircuit,
  Menu,
  X,
  LogOut,
  Heart,
  ClipboardList,
  PenTool,
  MessageSquare,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import type { ReactNode } from "react";
import { config } from "../../config";
import { cn } from "../../lib/cn";
import { spring, tween } from "../../lib/motion";
import { Avatar, CrisisBanner, IconButton } from "../ui";
import logoPng from "../../assets/logo.png";

/* ============================================================================
   DashboardLayout
   ----------------------------------------------------------------------------
   One shell for every signed-in surface. The previous version forked into a
   separate hard-coded dark tree for TalkMindly (losing the nav entirely) and
   used h-screen/w-screen with four different greys. This unifies on the design
   system while keeping the two things that were genuinely right: a focused
   immersive mode for the chat/community space, and a persistent crisis banner.
   ========================================================================= */

type FeatureId = "writemindly" | "talkmindly" | "sessionbooking";

interface MenuItem {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
}

// Full navigation - desktop sidebar + mobile drawer. Order is the IA priority.
const menuItems: MenuItem[] = [
  { id: "overview", label: "Home", icon: LayoutDashboard },
  { id: "checkin", label: "Check-in", icon: Heart },
  { id: "assessments", label: "My results", icon: ClipboardList },
  { id: "discover", label: "Explore quizzes", icon: BrainCircuit },
  { id: "writemindly", label: "WriteMindly", icon: PenTool },
  { id: "talkmindly", label: "TalkMindly", icon: MessageSquare },
  { id: "sessionbooking", label: "Book a session", icon: Calendar },
];

// The five that live on the mobile bottom bar; the rest live in the drawer.
const bottomNavIds = ["overview", "checkin", "discover", "writemindly", "talkmindly"];

// Tabs that take over the whole viewport (their own immersive UI).
const immersiveTabs = new Set(["talkmindly"]);

interface DashboardLayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  firstName: string;
  lastName: string;
  email: string;
  initials: string;
  logout: () => void;
  onLogoClick: () => void;
  onComingSoonClick?: (feature: FeatureId) => void;
  children: ReactNode;
}

export function DashboardLayout(props: DashboardLayoutProps) {
  const { activeTab, setActiveTab, onComingSoonClick, children } = props;
  const navigate = useNavigate();

  const isComingSoon = (id: string) => id === "writemindly" && !config.enableWriteMindly;

  const handleNav = (id: string, alsoCloseDrawer = false) => {
    if (isComingSoon(id)) {
      onComingSoonClick?.(id as FeatureId);
    } else {
      setActiveTab(id);
    }
    if (alsoCloseDrawer) props.setMobileMenuOpen(false);
  };

  /* ---------------------------------------------------- immersive (chat) mode */
  if (immersiveTabs.has(activeTab)) {
    return (
      <div className="flex min-h-dvh flex-col bg-ink-900 text-ink-50">
        <header className="z-[var(--z-nav)] flex min-h-16 shrink-0 items-center justify-between border-b border-ink-700 bg-ink-800 px-4 pt-safe sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-plum-500 text-white">
              <MessageSquare className="h-4 w-4" />
            </span>
            <span className="font-display text-lg font-semibold text-white">
              {activeTab === "talkmindly" ? "TalkMindly" : "WellMindly"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={cn(
              "inline-flex min-h-9 items-center gap-2 rounded-full border border-ink-700 bg-ink-800 px-4",
              "text-xs font-semibold text-ink-100 transition-colors hover:bg-ink-700",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-400",
            )}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Dashboard
          </button>
        </header>
        <main className="relative flex-1 overflow-hidden">{children}</main>
      </div>
    );
  }

  /* ------------------------------------------------------------- normal shell */
  return (
    <div className="flex min-h-dvh bg-paper text-ink-800">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 z-[var(--z-raised)] hidden h-dvh w-72 shrink-0 flex-col border-r border-ink-200/60 bg-white lg:flex">
        <button
          type="button"
          onClick={props.onLogoClick}
          className="flex h-20 shrink-0 cursor-pointer items-center border-b border-ink-100 px-8 transition-opacity hover:opacity-90"
        >
          <img src={logoPng} alt="WellMindly - home" className="block h-8 w-auto" />
        </button>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6" aria-label="Dashboard sections">
          {menuItems.map((item) => (
            <NavLink
              key={item.id}
              item={item}
              active={activeTab === item.id}
              comingSoon={isComingSoon(item.id)}
              onClick={() => handleNav(item.id)}
              layoutId="sidebarActive"
            />
          ))}
        </nav>

        <div className="shrink-0 border-t border-ink-100 p-4">
          <div className="flex items-center gap-3 rounded-2xl p-2">
            <Avatar name={`${props.firstName} ${props.lastName}`} initials={props.initials} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink-900">
                {props.firstName} {props.lastName}
              </p>
              <p className="truncate text-xs text-ink-500">{props.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {props.mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={tween.fast}
              onClick={() => props.setMobileMenuOpen(false)}
              className="fixed inset-0 z-[var(--z-overlay)] bg-ink-900/45 backdrop-blur-[2px] lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={spring.soft}
              className="fixed inset-y-0 left-0 z-[var(--z-overlay)] flex w-[82%] max-w-xs flex-col bg-white shadow-2xl lg:hidden"
              aria-label="Menu"
            >
              <div className="flex shrink-0 items-center justify-between border-b border-ink-100 px-5 pt-safe pb-4">
                <button
                  type="button"
                  onClick={() => {
                    props.onLogoClick();
                    props.setMobileMenuOpen(false);
                  }}
                  className="flex cursor-pointer items-center transition-opacity hover:opacity-90"
                >
                  <img src={logoPng} alt="WellMindly - home" className="block h-8 w-auto" />
                </button>
                <IconButton
                  label="Close menu"
                  size="sm"
                  variant="ghost"
                  icon={<X />}
                  onClick={() => props.setMobileMenuOpen(false)}
                />
              </div>

              <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5" aria-label="Dashboard sections">
                {menuItems.map((item) => (
                  <NavLink
                    key={item.id}
                    item={item}
                    active={activeTab === item.id}
                    comingSoon={isComingSoon(item.id)}
                    onClick={() => handleNav(item.id, true)}
                    layoutId="drawerActive"
                  />
                ))}
              </nav>

              <div className="shrink-0 border-t border-ink-100 px-5 pt-4 pb-[calc(1rem+var(--safe-area-bottom))]">
                <div className="mb-3 flex items-center gap-3">
                  <Avatar name={`${props.firstName} ${props.lastName}`} initials={props.initials} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink-900">
                      {props.firstName} {props.lastName}
                    </p>
                    <p className="truncate text-xs text-ink-500">{props.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={props.logout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-ink-200 py-2.5 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main column */}
      <div className="relative flex min-w-0 flex-1 flex-col">
        {/* Crisis banner - always reachable, calm not alarming */}
        <CrisisBanner
          onAction={() => navigate("/crisis")}
          className="z-[var(--z-sticky)] shrink-0 pt-safe"
        />

        {/* Top bar */}
        <header className="sticky top-0 z-[var(--z-sticky)] flex min-h-16 shrink-0 items-center justify-between border-b border-ink-200/50 bg-white/85 px-4 backdrop-blur-md sm:h-20 sm:px-8">
          <div className="flex items-center gap-3 lg:hidden">
            <IconButton
              label="Open menu"
              size="sm"
              variant="ghost"
              icon={<Menu />}
              onClick={() => props.setMobileMenuOpen(true)}
              className="-ml-1"
            />
            <button
              type="button"
              onClick={props.onLogoClick}
              className="flex cursor-pointer items-center transition-opacity hover:opacity-85"
            >
              <img src={logoPng} alt="WellMindly - home" className="block h-6 w-auto" />
            </button>
          </div>

          <button
            type="button"
            onClick={props.logout}
            className={cn(
              "ml-auto hidden items-center gap-2 rounded-full border border-ink-200 bg-white px-5 py-2.5",
              "text-sm font-semibold text-ink-700 transition-colors hover:border-ink-300 hover:bg-ink-50",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-400 sm:flex",
            )}
          >
            Sign out
            <LogOut className="h-4 w-4 text-ink-400" />
          </button>
        </header>

        {/* Scroll area */}
        <main className="relative flex-1 px-4 py-5 pb-nav sm:px-6 sm:py-6 lg:px-10 lg:py-8 lg:pb-10">
          <div className="mx-auto max-w-6xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={tween.base}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-[var(--z-nav)] flex items-stretch justify-around border-t border-ink-200/70 bg-white/95 px-1 pb-[calc(0.375rem+var(--safe-area-bottom))] pt-1.5 backdrop-blur-md lg:hidden"
      >
        {menuItems
          .filter((item) => bottomNavIds.includes(item.id))
          .map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "active-press relative flex min-h-12 flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-2xl border-none bg-transparent px-1 py-1",
                  isActive ? "text-plum-700" : "text-ink-400",
                )}
              >
                <span className="relative flex items-center justify-center p-1.5">
                  {isActive && (
                    <motion.span
                      layoutId="bottomNavActive"
                      transition={spring.snappy}
                      className="absolute inset-0 rounded-xl bg-plum-100"
                    />
                  )}
                  <Icon className={cn("relative h-5 w-5", isActive && "scale-110")} />
                </span>
                <span className="text-2xs font-semibold leading-none">{item.label}</span>
              </button>
            );
          })}
      </nav>
    </div>
  );
}

/* ----------------------------------------------------------------- NavLink */

function NavLink({
  item,
  active,
  comingSoon,
  onClick,
  layoutId,
}: {
  item: MenuItem;
  active: boolean;
  comingSoon: boolean;
  onClick: () => void;
  layoutId: string;
}) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex w-full items-center gap-3.5 rounded-2xl px-4 py-3 text-left text-sm font-semibold",
        "cursor-pointer border-none bg-transparent transition-colors duration-200",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-400",
        active ? "text-plum-800" : "text-ink-500 hover:text-ink-900",
      )}
    >
      {active && (
        <motion.span
          layoutId={layoutId}
          transition={spring.snappy}
          className="absolute inset-0 rounded-2xl bg-plum-100"
        />
      )}
      <Icon
        className={cn(
          "relative h-5 w-5 shrink-0 transition-colors",
          active ? "text-plum-600" : "text-ink-400 group-hover:text-ink-600",
        )}
      />
      <span className="relative flex-1">{item.label}</span>
      {comingSoon && (
        <span className="relative rounded-full bg-plum-100 px-2 py-0.5 text-2xs font-bold text-plum-700">
          Soon
        </span>
      )}
    </button>
  );
}
