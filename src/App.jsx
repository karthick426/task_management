import React, { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { Layout } from "./components/Layout";
import { LandingPage } from "./pages/LandingPage";
import { AuthPages } from "./pages/AuthPages";
import { Dashboard } from "./pages/Dashboard";
import { KanbanBoard } from "./pages/KanbanBoard";
import { CalendarView } from "./pages/CalendarView";
import { AnalyticsView } from "./pages/AnalyticsView";
import { SettingsView } from "./pages/SettingsView";

function App() {
  const { currentUser, loading } = useAuth();
  
  // Navigation tabs: "landing" | "login" | "register" | "dashboard" | "tasks" | "calendar" | "analytics" | "settings"
  const [activeTab, setActiveTab] = useState("landing");
  const [searchQuery, setSearchQuery] = useState("");

  // Handle auto-routing when authentication state changes
  useEffect(() => {
    if (!loading) {
      if (currentUser) {
        // Redirect to dashboard if logged in
        setActiveTab("dashboard");
      } else {
        // Otherwise show landing page
        setActiveTab("landing");
      }
    }
  }, [currentUser, loading]);

  // Listen for custom routing events (e.g. from navbar dropdowns)
  useEffect(() => {
    const handleRoute = (e) => {
      setActiveTab(e.detail);
    };

    const handleViewTask = (e) => {
      const task = e.detail;
      setActiveTab("tasks");
      // Search by task title to highlight/find it instantly on the Kanban board
      setSearchQuery(task.title);
    };

    window.addEventListener("route-tab", handleRoute);
    window.addEventListener("view-task", handleViewTask);

    return () => {
      window.removeEventListener("route-tab", handleRoute);
      window.removeEventListener("view-task", handleViewTask);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen w-screen bg-[#0F172A] flex flex-col items-center justify-center text-brand-text">
        {/* Sleek Glassmorphism Loading Skeleton */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 animate-spin flex items-center justify-center">
            <div className="w-8 h-8 rounded-lg bg-[#0F172A]" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-white/50 animate-pulse">
            Connecting FlowSync Workspace...
          </span>
        </div>
      </div>
    );
  }

  // Auth pages views
  if (activeTab === "landing" && !currentUser) {
    return (
      <LandingPage 
        onGetStarted={() => setActiveTab("register")}
        onLogin={() => setActiveTab("login")}
      />
    );
  }

  if ((activeTab === "login" || activeTab === "register") && !currentUser) {
    return (
      <AuthPages 
        defaultTab={activeTab}
        onAuthSuccess={() => setActiveTab("dashboard")}
        onBackToLanding={() => setActiveTab("landing")}
      />
    );
  }

  // Standard Authenticated Workspace Frame
  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    >
      {activeTab === "dashboard" && <Dashboard setActiveTab={setActiveTab} />}
      {activeTab === "tasks" && <KanbanBoard searchQuery={searchQuery} />}
      {activeTab === "calendar" && <CalendarView />}
      {activeTab === "analytics" && <AnalyticsView />}
      {activeTab === "settings" && <SettingsView />}
    </Layout>
  );
}

export default App;
