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
} from "lucide-react";
import type { ReactNode } from "react";
import { config } from "../../config";

interface MenuItem {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
}

const menuItems: MenuItem[] = [
  { id: "overview", label: "Dashboard Home", icon: LayoutDashboard },
  { id: "checkin", label: "Emotional Check-in", icon: Heart },
  { id: "assessments", label: "My Quiz Results", icon: ClipboardList },
  { id: "discover", label: "Explore Tests", icon: BrainCircuit },
  { id: "writemindly", label: "WriteMindly", icon: PenTool },
  { id: "talkmindly", label: "TalkMindly", icon: MessageSquare },
  { id: "sessionbooking", label: "Book a Session", icon: Calendar },
];

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
  onComingSoonClick?: (feature: "writemindly" | "talkmindly" | "sessionbooking") => void;
  children: ReactNode;
}

export function DashboardLayout({
  activeTab,
  setActiveTab,
  mobileMenuOpen,
  setMobileMenuOpen,
  firstName,
  lastName,
  email,
  initials,
  logout,
  onLogoClick,
  onComingSoonClick,
  children,
}: DashboardLayoutProps) {
  const navigate = useNavigate();
  return (
    <div className="h-screen w-screen flex bg-[#F4F6F5] text-slate-800 font-sans overflow-hidden">
      {/* 1. Desktop Sidebar Navigation */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200/50 h-full shrink-0 relative z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        {/* Brand Logo Header */}
        <div
          onClick={onLogoClick}
          className="h-20 flex items-center gap-3 px-8 border-b border-slate-100 shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-plum text-white shadow-lg shadow-plum/20">
            <Heart className="h-5 w-5 fill-current animate-pulse" />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900 select-none font-serif">
            WellMindly
          </span>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const IconComp = item.icon;
            const isActive = activeTab === item.id;
            const isComingSoon =
              (item.id === "writemindly" && !config.enableWriteMindly) ||
              item.id === "talkmindly" ||
              item.id === "sessionbooking";
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (isComingSoon) {
                    onComingSoonClick?.(item.id as "writemindly" | "talkmindly" | "sessionbooking");
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`w-full flex items-center justify-between gap-4 px-5 py-3.5 rounded-2xl text-left text-sm font-bold transition-all duration-300 relative group outline-none cursor-pointer ${
                  isActive ? "text-plum" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Plum active state background utilizing Framer Motion layoutId */}
                  {isActive && (
                    <motion.div
                      layoutId="activeSidebarBg"
                      className="absolute inset-0 bg-plum/10 rounded-2xl z-0"
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                  )}

                  <IconComp
                    className={`h-5 w-5 shrink-0 z-10 transition-colors duration-300 ${
                      isActive ? "text-plum" : "text-slate-400 group-hover:text-slate-600"
                    }`}
                  />
                  <span className="z-10 tracking-wide">{item.label}</span>
                </div>
                {isComingSoon && (
                  <span className="ml-auto z-10 bg-plum/10 text-plum text-[10px] px-2 py-0.5 rounded-full font-bold select-none">
                    Soon
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Card in Desktop Sidebar Footer */}
        <div className="p-6 border-t border-slate-100 shrink-0 bg-white">
          <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100">
            <div className="h-12 w-12 rounded-full bg-plum/15 flex items-center justify-center font-black text-plum text-base shadow-inner">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900 truncate">
                {firstName} {lastName}
              </p>
              <p className="text-xs font-medium text-slate-500 truncate">{email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Mobile Off-Canvas Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 bottom-0 left-0 w-72 bg-white shadow-2xl z-50 flex flex-col h-full lg:hidden"
            >
              <div className="h-auto pt-safe pb-4 flex items-center justify-between px-6 border-b border-slate-100 shrink-0">
                <div
                  onClick={() => {
                    onLogoClick();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-plum text-white shadow-lg">
                    <Heart className="h-5 w-5 fill-current animate-pulse" />
                  </div>
                  <span className="text-xl font-black tracking-tight text-slate-900 font-serif">
                    WellMindly
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                  const IconComp = item.icon;
                  const isActive = activeTab === item.id;
                  const isComingSoon =
                    (item.id === "writemindly" && !config.enableWriteMindly) ||
                    item.id === "talkmindly" ||
                    item.id === "sessionbooking";
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (isComingSoon) {
                          onComingSoonClick?.(item.id as "writemindly" | "talkmindly" | "sessionbooking");
                        } else {
                          setActiveTab(item.id);
                        }
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between gap-4 px-5 py-3.5 rounded-2xl text-left text-sm font-bold transition-all duration-200 relative group cursor-pointer"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        {isActive && <div className="absolute inset-0 bg-plum/10 rounded-2xl z-0" />}
                        <IconComp
                          className={`h-5 w-5 shrink-0 z-10 ${isActive ? "text-plum" : "text-slate-400"}`}
                        />
                        <span className={`z-10 ${isActive ? "text-plum font-bold" : "text-slate-600"}`}>
                          {item.label}
                        </span>
                      </div>
                      {isComingSoon && (
                        <span className="z-10 bg-plum/10 text-plum text-[10px] px-2 py-0.5 rounded-full font-bold select-none">
                          Soon
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="px-6 pt-6 pb-safe border-t border-slate-100 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-plum/15 flex items-center justify-center font-black text-plum text-base">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {firstName} {lastName}
                    </p>
                    <p className="text-xs font-medium text-slate-500 truncate">{email}</p>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 3. Primary Main Content Viewport */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {/* Global Crisis Support Banner (Subtle, like homepage) */}
        <div className="w-full bg-[#fcf8f2] border-b border-amber-200/45 pt-safe pb-2 px-6 text-center text-[11px] sm:text-xs font-semibold text-amber-800 relative z-25 shrink-0 select-none flex items-center justify-center">
          <span className="inline-flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-amber-600 animate-pulse fill-current" />
            Need help right now?
            <button 
              onClick={() => navigate("/crisis")} 
              className="underline hover:text-amber-900 transition-colors ml-1 font-bold cursor-pointer border-none bg-transparent p-0 text-[inherit]"
            >
              Get help immediately &rarr;
            </button>
          </span>
        </div>

        {/* Top Header Bar */}
        <header className="h-20 border-b border-slate-200/50 bg-white/80 backdrop-blur-md px-6 sm:px-10 flex items-center justify-between shrink-0 z-10 sticky top-0 animate-fade-in">
          <div className="flex items-center gap-4 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2.5 -ml-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border-none"
            >
              <Menu className="h-6 w-6" />
            </button>
            <span
              onClick={onLogoClick}
              className="font-black text-slate-900 text-xl tracking-tight cursor-pointer font-serif hover:opacity-85 transition-opacity"
            >
              WellMindly
            </span>
          </div>

          <div className="flex items-center gap-6 ml-auto">
            <button
              onClick={logout}
              className="group flex items-center gap-2.5 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition-all duration-300 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm"
            >
              <span className="hidden sm:inline">Sign Out</span>
              <LogOut className="h-4 w-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
            </button>
          </div>
        </header>

        {/* Main Scrolling Area */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-10 relative">
          <div className="max-w-6xl mx-auto">


            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
