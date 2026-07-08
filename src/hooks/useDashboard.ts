import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

import {
  TESTS,
  saveResult,
  scoreProfile,
  rankDims,
  pickArchetype,
} from "../components/discover/types";
import type { PictureOption, TestDef } from "../components/discover/types";

export interface DiscoverResultData {
  resultId?: string | null;
  kind: string;
  scores?: Record<string, number>;
  top?: string[];
  archetype?: { name: string; desc: string };
  pictureOption?: PictureOption;
  aiFeedback?: { headline: string; narrative: string; tip: string; insights?: string[] } | null;
}

export function useDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // ── UI state ──────────────────────────────────────────────
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, _setActiveTab] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("tab") || "overview";
  });

  const setActiveTab = useCallback((tab: string) => {
    if (tab === "checkin" || tab === "phq9") {
      // Navigate to discover tab but auto-start the check-in or phq9 test
      _setActiveTab(tab === "checkin" ? "checkin" : "discover");
      setCurDiscoverId(tab);
      setDiscoverQi(0);
      setDiscoverResp([]);
      setDiscoverResultData(null);
      setDiscoverView("test");
    } else if (tab === "discover") {
      _setActiveTab(tab);
      setDiscoverView("hub");
      setCurDiscoverId(null);
      setDiscoverQi(0);
      setDiscoverResp([]);
      setDiscoverResultData(null);
    } else {
      _setActiveTab(tab);
    }
  }, []);
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
  const [showCheckinPopup, setShowCheckinPopup] = useState(false);
  const [checkinMessage, setCheckinMessage] = useState("");
  const [checkinEmoji, setCheckinEmoji] = useState("");
  const [checkinTitle, setCheckinTitle] = useState("");

  // ── Quiz results / trajectory ────────────────────────────
  const [resultsData, setResultsData] = useState<any>(null);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [showScreening, setShowScreening] = useState(false);

  // ── Discover tab ─────────────────────────────────────────
  const [discoverView, setDiscoverView] = useState<"hub" | "test" | "result" | "results">(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab === "checkin" || tab === "phq9") return "test";
    return "hub";
  });
  const [curDiscoverId, setCurDiscoverId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab === "checkin" || tab === "phq9") return tab;
    return null;
  });
  const [discoverQi, setDiscoverQi] = useState(0);
  const [discoverResp, setDiscoverResp] = useState<(number | string)[]>([]);
  const [discoverResultData, setDiscoverResultData] = useState<DiscoverResultData | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const [discoverLoading, setDiscoverLoading] = useState(false);

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
    classification: string,
    answers?: any
  ) => {
    setDiscoverLoading(true);
    try {
      const response = await api.post("/quizzes/submit", {
        quizTitle: title,
        quizCategory: category,
        overallScore,
        maxScore,
        classification,
        answers,
      });
      fetchResults();
      return {
        resultId: response.data?.id || null,
        aiFeedback: response.data?.aiFeedback || null,
      };
    } catch (err) {
      console.error("Failed to submit Discover result to backend:", err);
      return { resultId: null, aiFeedback: null };
    } finally {
      setDiscoverLoading(false);
    }
  };

  // ── Bootstrap ────────────────────────────────────────────
  useEffect(() => {
    const fetchCheckin = async () => {
      try {
        const response = await api.get("/students/me/daily-checkin");
        if (response.data && response.data.checkin !== null) {
          setDailyMood(response.data.checkin);
          setShowCheckinPopup(false);
        } else {
          setShowCheckinPopup(true);
        }
      } catch (err) {
        console.error("Failed to fetch daily check-in:", err);
      }
    };
    fetchCheckin();
    fetchCheckins();
    fetchResults();
  }, []);

  // Redirect to a specific quiz result page if showResult is set in the URL (e.g. after login/signup)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const showResult = params.get("showResult");
    if (showResult && resultsData?.timeline) {
      const testDef = TESTS[showResult];
      if (testDef) {
        // Find latest matching result in timeline
        const matches = resultsData.timeline.filter((r: any) => r.quizTitle === testDef.title);
        if (matches.length > 0) {
          const latest = matches[matches.length - 1];
          
          // Reconstruct discoverResultData
          const data: DiscoverResultData = {
            resultId: latest.id,
            kind: showResult === "phq9"
              ? "phq9"
              : showResult === "checkin"
                ? "checkin"
                : showResult === "mood"
                  ? "picture"
                  : showResult === "strengths"
                    ? "strengths"
                    : showResult === "bigfive"
                      ? "bigfive"
                      : showResult === "values"
                        ? "values"
                        : "type",
            scores: latest.answers?.scores || latest.scores,
            top: latest.answers?.top || latest.top,
            archetype: showResult === "bigfive" && (latest.answers?.scores || latest.scores)
              ? pickArchetype(latest.answers?.scores || latest.scores)
              : undefined,
            pictureOption: showResult === "mood" && (latest.answers?.label || latest.label || latest.classification)
              ? TESTS.mood.options?.find((o: any) => o.label === (latest.answers?.label || latest.label || latest.classification))
              : undefined,
            aiFeedback: latest.aiFeedback,
          };
          
          setCurDiscoverId(showResult);
          setDiscoverResultData(data);
          setDiscoverView("result");
          _setActiveTab(showResult === "checkin" ? "checkin" : "discover");
          
          // Clean the query parameters
          navigate(showResult === "checkin" ? "/dashboard?tab=checkin" : "/dashboard?tab=discover", { replace: true });
        }
      }
    }
  }, [resultsData, navigate]);

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
      
      const { resultId, aiFeedback } = await submitDiscoverToBackend(test.title, category, 100, 100, summary, { top, summary, responses });
      
      saveResult(id, { t: Date.now(), summary, top, aiFeedback });
      setDiscoverResultData({ resultId, kind: "values", top, aiFeedback });
      setDiscoverView("result");
      return;
    }

    const scores = scoreProfile(test.items!, responses as number[], test.scale);
    const ranked = rankDims(scores);

    if (test.kind === "rank") {
      const top = ranked.slice(0, test.topN).map((x) => x[0]);
      const summary = top.join(", ");
      
      const { resultId, aiFeedback } = await submitDiscoverToBackend(test.title, category, 100, 100, summary, { scores, top, summary, responses });

      saveResult(id, { t: Date.now(), summary, scores, top, aiFeedback });
      setDiscoverResultData({ resultId, kind: "strengths", scores, top, aiFeedback });
      setDiscoverView("result");
      return;
    }

    if (test.kind === "type") {
      const top = ranked[0][0];
      
      const { resultId, aiFeedback } = await submitDiscoverToBackend(test.title, category, 100, 100, top, { scores, top: [top], summary: top, responses });

      saveResult(id, { t: Date.now(), summary: top, scores, top: [top], aiFeedback });
      setDiscoverResultData({ resultId, kind: "type", scores, top: [top], aiFeedback });
      setDiscoverView("result");
      return;
    }

    // profile
    const summary = ranked[0][0] + " strongest";
    if (test.archetype) {
      const arch = pickArchetype(scores);
      
      const { resultId, aiFeedback } = await submitDiscoverToBackend(test.title, category, 100, 100, arch.name, { scores, archetype: arch, responses });

      saveResult(id, { t: Date.now(), summary, scores, aiFeedback });
      setDiscoverResultData({ resultId, kind: "bigfive", scores, archetype: arch, aiFeedback });
      setDiscoverView("result");
    } else {
      const sum = (responses as number[]).reduce((a, b) => a + b, 0);
      const maxPoints = test.scale ? Math.max(...test.scale.map((x: any) => x[1])) : 5;
      const maxScore = test.items!.length * maxPoints;

      let classText = "Strongest: " + ranked[0][0];
      if (id === "phq9") {
        if (sum <= 4) classText = "Minimal Stress";
        else if (sum <= 8) classText = "Mild Stress";
        else if (sum <= 12) classText = "Moderate Stress";
        else classText = "Escalated Anxiety / Stress";
      }
      
      const { resultId, aiFeedback } = await submitDiscoverToBackend(
        test.title,
        category,
        sum,
        maxScore,
        classText,
        { scores, summary, responses }
      );

      saveResult(id, { t: Date.now(), summary, scores, aiFeedback });
      setDiscoverResultData({ resultId, kind: id === "phq9" ? "phq9" : "checkin", scores, aiFeedback });
      setDiscoverView("result");
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
    
    const { resultId, aiFeedback } = await submitDiscoverToBackend(test.title, category, opt.tone, 100, opt.label);

    saveResult(curDiscoverId, { t: Date.now(), summary: opt.label, tone: opt.tone, label: opt.label, aiFeedback });
    setDiscoverResultData({ resultId, kind: "picture", pictureOption: opt, aiFeedback });
    setDiscoverView("result");
  };



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
    showCheckinPopup,
    setShowCheckinPopup,
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
    reportRef,
    discoverLoading,

  };
}

export type DashboardState = ReturnType<typeof useDashboard>;
