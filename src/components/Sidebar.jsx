import React, { useState } from "react";
import { useTasks } from "../context/TaskContext";
import { isMock } from "../firebase";
import { 
  LayoutDashboard, 
  KanbanSquare, 
  Calendar, 
  BarChart3, 
  Settings, 
  FolderPlus, 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Dot
} from "lucide-react";

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { projects, activeProjectId, selectProject, createProject } = useTasks();
  
  const [isOpen, setIsOpen] = useState(true); // Desktop collapse state
  const [mobileOpen, setMobileOpen] = useState(false); // Mobile drawer state
  const [showProjModal, setShowProjModal] = useState(false);
  
  const [newProjName, setNewProjName] = useState("");
  const [newProjDesc, setNewProjDesc] = useState("");
  const [newProjColor, setNewProjColor] = useState("#6366F1");

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "tasks", label: "Tasks Board", icon: KanbanSquare },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings }
  ];

  const colors = ["#6366F1", "#8B5CF6", "#06B6D4", "#10B981", "#EF4444", "#F59E0B"];

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjName.trim()) return;
    try {
      await createProject(newProjName, newProjDesc, newProjColor);
      setNewProjName("");
      setNewProjDesc("");
      setNewProjColor("#6366F1");
      setShowProjModal(false);
    } catch (err) {
      alert("Failed to create project: " + err.message);
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full text-brand-text">
      {/* Brand Logo Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-gradient shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {(isOpen || mobileOpen) && (
            <span className="text-xl font-bold tracking-tight text-gradient">
              FlowSync AI
            </span>
          )}
        </div>
        {/* Toggle Collapse Btn (Desktop) */}
        {!mobileOpen && (
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg hover:bg-white/5 transition-colors border border-white/5"
          >
            {isOpen ? <ChevronLeft className="w-4 h-4 text-white/60" /> : <ChevronRight className="w-4 h-4 text-white/60" />}
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="px-4 py-6 space-y-1.5 flex-1 overflow-y-auto">
        <div className="text-xs font-semibold text-white/40 px-3 uppercase tracking-wider mb-2">
          Workspace
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileOpen(false);
              }}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all ${
                isActive 
                  ? "bg-brand-primary/10 text-brand-primary border border-brand-primary/20 shadow-[0_0_15px_rgba(99,102,241,0.1)] font-medium" 
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-brand-primary" : "text-white/60"}`} />
              {(isOpen || mobileOpen) && <span className="text-sm">{item.label}</span>}
            </button>
          );
        })}

        {/* Projects Section */}
        <div className="pt-8 space-y-2">
          <div className="flex items-center justify-between px-3">
            <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Projects</span>
            {(isOpen || mobileOpen) && (
              <button 
                onClick={() => setShowProjModal(true)}
                className="text-white/60 hover:text-brand-primary transition-colors"
                title="New Project"
              >
                <FolderPlus className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="space-y-1">
            <button
              onClick={() => {
                selectProject("all");
                setActiveTab("tasks"); // Redirect to task board for project view
                setMobileOpen(false);
              }}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-all ${
                activeProjectId === "all" && activeTab === "tasks"
                  ? "bg-white/10 text-white font-medium"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-brand-primary to-brand-accent animate-pulse-slow" />
              {(isOpen || mobileOpen) && <span>All Workspace Tasks</span>}
            </button>

            {projects.map((proj) => {
              const isSelected = activeProjectId === proj.id && activeTab === "tasks";
              return (
                <button
                  key={proj.id}
                  onClick={() => {
                    selectProject(proj.id);
                    setActiveTab("tasks");
                    setMobileOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-all ${
                    isSelected
                      ? "bg-white/15 text-white font-medium border-l-2 border-l-[var(--proj-color)]"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                  style={{ "--proj-color": proj.color }}
                >
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: proj.color }} />
                  {(isOpen || mobileOpen) && (
                    <span className="truncate flex-1 text-left">{proj.name}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* User Connection Banner */}
      <div className="p-4 border-t border-white/5">
        {(isOpen || mobileOpen) ? (
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
            <div className="text-xs text-white/50">Storage Provider</div>
            <div className="flex items-center justify-center gap-1.5 mt-1 font-semibold text-sm">
              <span className={`w-2.5 h-2.5 rounded-full ${isMock ? "bg-amber-400" : "bg-emerald-400 animate-pulse"}`} />
              {isMock ? "Local Mock Mode" : "Firebase Cloud"}
            </div>
            {isMock && (
              <button 
                onClick={() => setActiveTab("settings")}
                className="text-[10px] text-brand-accent hover:underline block mx-auto mt-1"
              >
                Connect Database
              </button>
            )}
          </div>
        ) : (
          <div className="flex justify-center">
            <span className={`w-3 h-3 rounded-full ${isMock ? "bg-amber-400" : "bg-emerald-400 animate-pulse"}`} title={isMock ? "Local Storage" : "Cloud Firestore Connected"} />
          </div>
        )}
      </div>

      {/* Project Modal */}
      {showProjModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 glass-panel rounded-[20px] shadow-2xl border border-white/10 text-brand-text animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Create Productivity Space</h3>
              <button 
                onClick={() => setShowProjModal(false)}
                className="text-white/60 hover:text-white hover:bg-white/5 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Space Name</label>
                <input 
                  type="text" 
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input"
                  placeholder="e.g., Q3 Launch"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Description</label>
                <textarea 
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input min-h-[80px]"
                  placeholder="What is this space for?"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Theme Color</label>
                <div className="flex gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewProjColor(c)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        newProjColor === c ? "border-white scale-110 shadow-lg" : "border-transparent"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowProjModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brand-gradient text-white font-medium hover:opacity-90 shadow-lg transition-opacity"
                >
                  Create Space
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Header Nav Trigger */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 px-4 bg-brand-bg/80 backdrop-blur-md border-b border-white/5 z-40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-gradient shadow-md">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-gradient">
            FlowSync AI
          </span>
        </div>
        <button 
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg hover:bg-white/5"
        >
          <Menu className="w-6 h-6 text-white/80" />
        </button>
      </div>

      {/* Desktop Sidebar Container */}
      <aside 
        className={`hidden md:block h-screen shrink-0 border-r border-white/5 bg-brand-bg/60 backdrop-blur-xl transition-all duration-300 ${
          isOpen ? "w-64" : "w-20"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer content */}
          <div className="relative w-64 max-w-xs h-full bg-brand-bg/95 border-r border-white/10 shadow-2xl flex flex-col z-10 animate-slide-right">
            <button 
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/5 text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
};
