import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import html2canvas from "html2canvas";
import {
  TESTS,
  saveResult,
  scoreProfile,
  rankDims,
  pickArchetype,
} from "../components/discover/types";
import type { PictureOption, TestDef } from "../components/discover/types";

export interface DiscoverResultData {
  kind: string;
  scores?: Record<string, number>;
  top?: string[];
  archetype?: { name: string; desc: string };
  pictureOption?: PictureOption;
}

export function useDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // ── UI state ──────────────────────────────────────────────
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("tab") || "overview";
  });
  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  });

  // ── Daily check-in ───────────────────────────────────────
  const [dailyMood, setDailyMood] = useState<number | null>(null);
  const [historicalCheckins, setHistoricalCheckins] = useState<any[]>([]);
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [checkinMessage, setCheckinMessage] = useState("");
  const [checkinEmoji, setCheckinEmoji] = useState("");
  const [checkinTitle, setCheckinTitle] = useState("");

  // ── Quiz results / trajectory ────────────────────────────
  const [resultsData, setResultsData] = useState<any>(null);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [showScreening, setShowScreening] = useState(false);

  // ── Discover tab ─────────────────────────────────────────
  const [discoverView, setDiscoverView] = useState<"hub" | "test" | "result" | "results">("hub");
  const [curDiscoverId, setCurDiscoverId] = useState<string | null>(null);
  const [discoverQi, setDiscoverQi] = useState(0);
  const [discoverResp, setDiscoverResp] = useState<(number | string)[]>([]);
  const [discoverResultData, setDiscoverResultData] = useState<DiscoverResultData | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);

  // ── API helpers ──────────────────────────────────────────
  const fetchResults = async () => {
    try {
      const response = await api.get("/students/me/results");
      setResultsData(response.data);
    } catch (err) {
      console.error("Failed to fetch quiz results:", err);
    }
  };

  const fetchCheckins = async () => {
    try {
      const response = await api.get("/students/me/daily-checkins");
      if (response.data && response.data.checkins) {
        setHistoricalCheckins(response.data.checkins);
      }
    } catch (err) {
      console.error("Failed to fetch historical daily check-ins:", err);
    }
  };

  const submitDiscoverToBackend = async (
    title: string,
    category: string,
    overallScore: number,
    maxScore: number,
    classification: string
  ) => {
    try {
      await api.post("/quizzes/submit", {
        quizTitle: title,
        quizCategory: category,
        overallScore,
        maxScore,
        classification,
      });
      fetchResults();
    } catch (err) {
      console.error("Failed to submit Discover result to backend:", err);
    }
  };

  // ── Bootstrap ────────────────────────────────────────────
  useEffect(() => {
    const fetchCheckin = async () => {
      try {
        const response = await api.get("/students/me/daily-checkin");
        if (response.data && response.data.checkin !== null) {
          setDailyMood(response.data.checkin);
        }
      } catch (err) {
        console.error("Failed to fetch daily check-in:", err);
      }
    };
    fetchCheckin();
    fetchCheckins();
    fetchResults();
  }, []);

  // ── Screening ────────────────────────────────────────────
  const handleScreeningComplete = async (_score: number, answers?: Record<number, number>) => {
    try {
      await api.post("/quizzes/submit", { answers: answers || {} });
      fetchResults();
    } catch (err) {
      console.error("Failed to submit baseline screening:", err);
    }
  };

  // ── Discover flow ────────────────────────────────────────
  const startDiscoverTest = (id: string) => {
    setCurDiscoverId(id);
    setDiscoverQi(0);
    setDiscoverResp([]);
    setDiscoverResultData(null);
    setDiscoverView("test");
  };

  const finishDiscoverTest = async (id: string, test: TestDef, responses: (number | string)[]) => {
    const category = test.tag?.split(" · ")[0] || "General";

    if (test.kind === "pairs") {
      const tally: Record<string, number> = {};
      responses.forEach((v) => {
        tally[v as string] = (tally[v as string] || 0) + 1;
      });
      const ranked = Object.entries(tally).sort((a, b) => b[1] - a[1]);
      const top = ranked.slice(0, 2).map((x) => x[0]);
      const summary = top.join(" + ");
      saveResult(id, { t: Date.now(), summary, top });
      setDiscoverResultData({ kind: "values", top });
      setDiscoverView("result");
      await submitDiscoverToBackend(test.title, category, 100, 100, summary);
      return;
    }

    const scores = scoreProfile(test.items!, responses as number[]);
    const ranked = rankDims(scores);

    if (test.kind === "rank") {
      const top = ranked.slice(0, test.topN).map((x) => x[0]);
      const summary = top.join(", ");
      saveResult(id, { t: Date.now(), summary, scores, top });
      setDiscoverResultData({ kind: "strengths", scores, top });
      setDiscoverView("result");
      await submitDiscoverToBackend(test.title, category, 100, 100, summary);
      return;
    }

    if (test.kind === "type") {
      const top = ranked[0][0];
      saveResult(id, { t: Date.now(), summary: top, scores, top: [top] });
      setDiscoverResultData({ kind: "type", scores, top: [top] });
      setDiscoverView("result");
      await submitDiscoverToBackend(test.title, category, 100, 100, top);
      return;
    }

    // profile
    const summary = ranked[0][0] + " strongest";
    saveResult(id, { t: Date.now(), summary, scores });
    if (test.archetype) {
      const arch = pickArchetype(scores);
      setDiscoverResultData({ kind: "bigfive", scores, archetype: arch });
      setDiscoverView("result");
      await submitDiscoverToBackend(test.title, category, 100, 100, arch.name);
    } else {
      setDiscoverResultData({ kind: "checkin", scores });
      setDiscoverView("result");
      const sum = (responses as number[]).reduce((a, b) => a + b, 0);
      await submitDiscoverToBackend(
        test.title,
        category,
        sum,
        test.items!.length * 5,
        "Strongest: " + ranked[0][0]
      );
    }
  };

  const answerDiscoverLikert = (val: number) => {
    const cur = curDiscoverId ? TESTS[curDiscoverId] : null;
    if (!cur || !cur.items) return;
    const newResp = [...discoverResp];
    newResp[discoverQi] = val;
    setDiscoverResp(newResp);
    setTimeout(() => {
      if (discoverQi < cur.items!.length - 1) {
        setDiscoverQi(discoverQi + 1);
      } else {
        finishDiscoverTest(curDiscoverId!, cur, newResp);
      }
    }, 200);
  };

  const answerDiscoverPair = (val: string) => {
    const cur = curDiscoverId ? TESTS[curDiscoverId] : null;
    if (!cur || !cur.pairs) return;
    const newResp = [...discoverResp];
    newResp[discoverQi] = val;
    setDiscoverResp(newResp);
    if (discoverQi < cur.pairs.length - 1) {
      setDiscoverQi(discoverQi + 1);
    } else {
      finishDiscoverTest(curDiscoverId!, cur, newResp);
    }
  };

  const answerDiscoverPicture = async (opt: PictureOption) => {
    if (!curDiscoverId) return;
    const test = TESTS[curDiscoverId];
    const category = test.tag?.split(" · ")[0] || "General";
    saveResult(curDiscoverId, { t: Date.now(), summary: opt.label, tone: opt.tone, label: opt.label });
    setDiscoverResultData({ kind: "picture", pictureOption: opt });
    setDiscoverView("result");
    await submitDiscoverToBackend(test.title, category, opt.tone, 100, opt.label);
  };

  // ── Card save ────────────────────────────────────────────
  const doSaveCard = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const a = document.createElement("a");
      a.download = "my-wellmindly-card.png";
      a.href = canvas.toDataURL("image/png");
      a.click();
    } catch (err) {
      console.error("Failed to generate card image:", err);
    }
  }, []);

  // ── Daily check-in handler ───────────────────────────────
  const handleDailyCheckin = async (rating: number) => {
    try {
      setDailyMood(rating);
      await api.post("/students/me/daily-checkin", { rating });
      fetchCheckins();

      const checkinConfigs: Record<number, { emoji: string; title: string; msg: string }> = {
        1: {
          emoji: "💜",
          title: "Gentle Reminder",
          msg: "It's okay to have tough days. Remember to take gentle breaths and reach out to campus resources or someone you trust.",
        },
        2: {
          emoji: "🌿",
          title: "Self-Care Moment",
          msg: "Be gentle with yourself today. Taking a short break, walking in nature, or listening to a favorite song might help ease things.",
        },
        3: {
          emoji: "🌱",
          title: "Steady & Balanced",
          msg: "A steady, balanced day. Keep taking it one step at a time!",
        },
        4: {
          emoji: "☀️",
          title: "Bright Energy",
          msg: "Keep riding this positive wave. Try sharing some of your good energy with a friend or colleague today.",
        },
        5: {
          emoji: "🎉",
          title: "Thriving & Strong",
          msg: "Your light is shining bright today. Celebrate this moment and keep doing what makes you thrive!",
        },
      };

      const config = checkinConfigs[rating] || checkinConfigs[3];
      setCheckinEmoji(config.emoji);
      setCheckinMessage(config.msg);
      setCheckinTitle(config.title);
      setShowCheckinModal(true);
    } catch (err) {
      console.error("Failed to save daily check-in:", err);
    }
  };

  // ── Derived user values ──────────────────────────────────
  const firstName = user?.firstName || "Student";
  const lastName = user?.lastName || "";
  const email = user?.email || "";
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "S";

  return {
    // auth / nav
    user,
    logout,
    navigate,
    firstName,
    lastName,
    email,
    initials,
    greeting,

    // layout
    mobileMenuOpen,
    setMobileMenuOpen,
    activeTab,
    setActiveTab,

    // daily check-in
    dailyMood,
    handleDailyCheckin,
    showCheckinModal,
    setShowCheckinModal,
    checkinEmoji,
    checkinTitle,
    checkinMessage,
    historicalCheckins,
    fetchCheckins,

    // quiz results
    resultsData,
    selectedReport,
    setSelectedReport,
    historyPage,
    setHistoryPage,
    showScreening,
    setShowScreening,
    handleScreeningComplete,

    // discover
    discoverView,
    setDiscoverView,
    curDiscoverId,
    discoverQi,
    setDiscoverQi,
    discoverResp,
    discoverResultData,
    startDiscoverTest,
    finishDiscoverTest,
    answerDiscoverLikert,
    answerDiscoverPair,
    answerDiscoverPicture,
    cardRef,
    doSaveCard,
  };
}

export type DashboardState = ReturnType<typeof useDashboard>;
