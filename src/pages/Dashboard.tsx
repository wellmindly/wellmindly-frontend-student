import { useState, useEffect } from "react";
import { useDashboard } from "../hooks/useDashboard";
import { DashboardLayout } from "../components/dashboard/DashboardLayout";
import { OverviewTab } from "../components/dashboard/OverviewTab";
import { AssessmentsTab } from "../components/dashboard/AssessmentsTab";
import { DiscoverTab } from "../components/dashboard/DiscoverTab";
import { CheckinModal } from "../components/dashboard/CheckinModal";
import { DailyCheckinPopup } from "../components/dashboard/DailyCheckinPopup";
import { ReportDetailModal } from "../components/dashboard/ReportDetailModal";
import { ComingSoonModal } from "../components/dashboard/ComingSoonModal";
import { WriteMindlyTab } from "../components/dashboard/WriteMindlyTab";

export function Dashboard() {
  const db = useDashboard();
  const [comingSoonFeature, setComingSoonFeature] = useState<"writemindly" | "talkmindly" | "sessionbooking" | null>(null);

  // Update document title for SEO
  useEffect(() => {
    document.title = "Student Dashboard — WellMindly";
  }, []);

  return (
    <>
      <DashboardLayout
        activeTab={db.activeTab}
        setActiveTab={db.setActiveTab}
        mobileMenuOpen={db.mobileMenuOpen}
        setMobileMenuOpen={db.setMobileMenuOpen}
        firstName={db.firstName}
        lastName={db.lastName}
        email={db.email}
        initials={db.initials}
        logout={db.logout}
        onLogoClick={() => db.navigate("/")}
        onComingSoonClick={(feature) => setComingSoonFeature(feature)}
      >
        {/* ---------- DASHBOARD HOME VIEW ---------- */}
        {db.activeTab === "overview" && (
          <OverviewTab
            greeting={db.greeting}
            firstName={db.firstName}
            dailyMood={db.dailyMood}
            historicalCheckins={db.historicalCheckins}
            resultsData={db.resultsData}
            onDailyCheckin={db.handleDailyCheckin}
            onExploreDiscover={() => db.setActiveTab("discover")}
            onViewAssessments={() => db.setActiveTab("assessments")}
            onStartScreening={() => db.setActiveTab("checkin")}
          />
        )}

        {/* ---------- QUIZ RESULTS VIEW ---------- */}
        {db.activeTab === "assessments" && (
          <AssessmentsTab
            resultsData={db.resultsData}
            selectedReport={db.selectedReport}
            setSelectedReport={db.setSelectedReport}
            historyPage={db.historyPage}
            setHistoryPage={db.setHistoryPage}
            onExploreDiscover={() => db.setActiveTab("discover")}
            onStartScreening={() => db.setActiveTab("phq9")}
          />
        )}

        {/* ---------- DISCOVER / CHECKIN VIEWS ---------- */}
        {(db.activeTab === "discover" || db.activeTab === "checkin") && (
          <DiscoverTab
            discoverView={db.discoverView}
            setDiscoverView={db.setDiscoverView}
            curDiscoverId={db.curDiscoverId}
            discoverQi={db.discoverQi}
            setDiscoverQi={db.setDiscoverQi}
            discoverResp={db.discoverResp}
            discoverResultData={db.discoverResultData}
            startDiscoverTest={db.startDiscoverTest}
            finishDiscoverTest={db.finishDiscoverTest}
            answerDiscoverLikert={db.answerDiscoverLikert}
            answerDiscoverPair={db.answerDiscoverPair}
            answerDiscoverPicture={db.answerDiscoverPicture}
            cardRef={db.cardRef}
            reportRef={db.reportRef}
            discoverLoading={db.discoverLoading}
            onSwitchToAssessments={() => db.setActiveTab("assessments")}
            resultsData={db.resultsData}
            onComingSoonClick={(feature) => setComingSoonFeature(feature)}
            isCheckinMode={db.activeTab === "checkin"}
            onBackToOverview={() => db.setActiveTab("overview")}
          />
        )}

        {/* ---------- WRITEMINDLY VIEW ---------- */}
        {db.activeTab === "writemindly" && (
          <WriteMindlyTab />
        )}
      </DashboardLayout>

      {/* ── Modals ──────────────────────────────────────── */}

      <DailyCheckinPopup
        show={db.showCheckinPopup}
        onClose={() => db.setShowCheckinPopup(false)}
        onSelect={db.handleDailyCheckin}
      />

      <CheckinModal
        show={db.showCheckinModal}
        onClose={() => db.setShowCheckinModal(false)}
        emoji={db.checkinEmoji}
        title={db.checkinTitle}
        message={db.checkinMessage}
        mood={db.dailyMood}
      />

      <ReportDetailModal
        report={db.selectedReport}
        onClose={() => db.setSelectedReport(null)}
      />

      <ComingSoonModal
        show={comingSoonFeature !== null}
        onClose={() => setComingSoonFeature(null)}
        feature={comingSoonFeature}
      />
    </>
  );
}
