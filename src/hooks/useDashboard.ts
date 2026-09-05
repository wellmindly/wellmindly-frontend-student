import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import { moodByRating } from "../lib/mood";
import { bandFor } from "../lib/wellbeing";

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

/**
 * Valid dashboard tab identifiers.
 * Keep in step with menuItems in src/components/dashboard/DashboardLayout.tsx.
 */
export const TABS = new Set([
  "overview",
  "checkin",
  "assessments",
  "discover",
  "writemindly",
  "talkmindly",
  "sessionbooking",
]);

/**
 * `?tab=` accepts a couple of shorthands that aren't tabs in their own right:
 * `phq9` means "the discover tab, with the wellbeing check-in already running".
 * Resolving them here is what keeps `activeTab` a value the dashboard can actually
 * render - a cold load of `/dashboard?tab=phq9` previously set activeTab to the
 * literal string "phq9", which matches no branch, and the page came up blank.
 * Unknown tab params fallback to "overview" to prevent rendering an empty panel.
 */
export function normalizeTab(tab: string | null | undefined): string {
  if (!tab) return "overview";
  if (tab === "phq9") return "discover";
  return TABS.has(tab) ? tab : "overview";
}

export function useDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ── UI state ──────────────────────────────────────────────
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, _setActiveTab] = useState<string>(() =>
    normalizeTab(new URLSearchParams(window.location.search).get("tab")),
  );

  /**
   * Applies a tab to local state *without* touching history. Shared by
   * setActiveTab and by the back/forward sync effect, so a URL change and a
   * click end up in exactly the same state.
   */
  const applyTab = useCallback((tab: string) => {
    if (tab === "checkin" || tab === "phq9") {
      _setActiveTab(tab === "checkin" ? "checkin" : "discover");
      setCurDiscoverId(tab);
      setDiscoverQi(0);
      setDiscoverResp([]);
      setDiscoverResultData(null);
      setDiscoverView("test");
    } else if (tab === "discover") {
      _setActiveTab("discover");
      setDiscoverView("hub");
      setCurDiscoverId(null);
      setDiscoverQi(0);
      setDiscoverResp([]);
      setDiscoverResultData(null);
    } else {
      _setActiveTab(tab);
    }
  }, []);

  const setActiveTab = useCallback(
    (tab: string) => {
      applyTab(tab);
      // Push rather than replace. Moving between dashboard sections is real
      // navigation: browser back and the Android hardware back button should
      // step through it instead of jumping straight out of the dashboard.
      navigate(`/dashboard?tab=${normalizeTab(tab)}`);
    },
    [applyTab, navigate],
  );

  // Keep state in step with the URL whenever history moves under us -
  // back/forward, or the Android back button. Pushing history without this
  // would change the address bar while leaving the UI on the old tab.
  const rawUrlTab = new URLSearchParams(location.search).get("tab");
  const urlTab = normalizeTab(rawUrlTab);
  useEffect(() => {
    if (urlTab !== activeTab) applyTab(rawUrlTab ?? "overview");
  }, [urlTab, rawUrlTab, activeTab, applyTab]);

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
  const [checkinTitle, setCheckinTitle] = useState("");

  // ── Quiz results / trajectory ────────────────────────────
  const [resultsData, setResultsData] = useState<any>(null);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [historyPage, setHistoryPage] = useState(1);

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
          // Only prompt on the tab whose job is the daily pulse. A student who
          // deep-linked (or reloaded) into Book a session, TalkMindly or a quiz
          // asked for that thing, and a mood modal over it is an interruption,
          // not a nudge - Home still asks, and the Check-in tab is one tap away.
          const landedOn = normalizeTab(new URLSearchParams(window.location.search).get("tab"));
          setShowCheckinPopup(landedOn === "overview");
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
        // One band table, shared with ReportDetailModal and mirrored in
        // backend/src/routes/quizzes.ts. This used to read
        // "Escalated Anxiety / Stress" at 13+ while the server wrote
        // "Severe Depression" for the same score - a diagnosis neither side
        // was in a position to make. See lib/wellbeing.ts.
        classText = bandFor(sum).label;
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

      const { title, message } = moodByRating(rating).affirmation;
      setCheckinMessage(message);
      setCheckinTitle(title);
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
