import React, { useState } from "react";
import { useTasks } from "../context/TaskContext";
import { useAuth } from "../context/AuthContext";
import { GlassCard } from "../components/GlassCard";
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Folder, 
  Plus, 
  Users, 
  ChevronRight,
  TrendingUp
} from "lucide-react";

export const Dashboard = ({ setActiveTab }) => {
  const { currentUser } = useAuth();
  const { tasks, projects, activities, loadingTasks, loadingActivities, createTask, activeProjectId } = useTasks();

  const [quickTitle, setQuickTitle] = useState("");
  const [quickProj, setQuickProj] = useState(activeProjectId !== "all" ? activeProjectId : "");

  // Calculate task statistics
  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.status === "completed").length;
  const pendingCount = tasks.filter(t => t.status !== "completed" && t.status !== "backlog").length;
  
  // Calculate overdue tasks (dueDate < today && status !== completed)
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueCount = tasks.filter(t => t.dueDate && t.dueDate < todayStr && t.status !== "completed").length;

  const handleQuickCreate = async (e) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    const projectIdToUse = quickProj || (projects[0]?.id || "proj-1");
    try {
      await createTask({
        projectId: projectIdToUse,
        title: quickTitle,
        description: "Created via quick dashboard widget.",
        status: "todo",
        priority: "medium",
        dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // 2 days from now
        assignee: "You",
        tags: ["Task"]
      });
      setQuickTitle("");
    } catch (err) {
      alert("Failed to quick-create task: " + err.message);
    }
  };

  const formatActivityTime = (dateValue) => {
    if (!dateValue) return "Recently";
    const created = new Date(dateValue);
    const diffMs = Date.now() - created.getTime();
    const minutes = Math.max(1, Math.round(diffMs / 60000));
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.round(hours / 24)}d ago`;
  };

  const team = Object.values(tasks.reduce((acc, task) => {
    const name = task.assignee || "Unassigned";
    if (!acc[name]) {
      acc[name] = {
        name,
        role: "Workspace Member",
        status: "Active",
        initials: name.split(" ").map(part => part[0]).join("").slice(0, 2).toUpperCase() || "U",
        color: "bg-indigo-500",
        count: 0
      };
    }
    acc[name].count += 1;
    return acc;
  }, {})).slice(0, 5);

  return (
    <div className="space-y-8 text-brand-text max-w-7xl mx-auto">
      {/* Header Greeting Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Welcome back, <span className="text-gradient">{currentUser?.displayName || "FlowSync Member"}</span>
          </h2>
          <p className="text-xs text-white/50 mt-1">Here is a quick overview of your workspace productivity metrics today.</p>
        </div>
        <button
          onClick={() => setActiveTab("tasks")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-gradient hover:opacity-90 transition-opacity text-white text-xs font-bold shadow-lg"
        >
          View Kanban Board
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Grid statistics metrics cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <GlassCard className="border-l-4 border-l-indigo-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-white/40 font-bold uppercase tracking-wider">Total Tasks</p>
              <h4 className="text-2xl md:text-3xl font-extrabold mt-2">{totalCount}</h4>
            </div>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Folder className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[10px] text-white/40 mt-3 font-semibold flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
            {loadingTasks ? "Syncing tasks..." : "Across all projects"}
          </div>
        </GlassCard>

        <GlassCard className="border-l-4 border-l-emerald-400">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-white/40 font-bold uppercase tracking-wider">Completed</p>
              <h4 className="text-2xl md:text-3xl font-extrabold mt-2 text-emerald-400">{completedCount}</h4>
            </div>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[10px] text-white/40 mt-3 font-semibold">
            Completion Rate: {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
          </div>
        </GlassCard>

        <GlassCard className="border-l-4 border-l-amber-400">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-white/40 font-bold uppercase tracking-wider">In Progress</p>
              <h4 className="text-2xl md:text-3xl font-extrabold mt-2 text-amber-400">{pendingCount}</h4>
            </div>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[10px] text-white/40 mt-3 font-semibold">
            Active backlog items
          </div>
        </GlassCard>

        <GlassCard className="border-l-4 border-l-rose-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-white/40 font-bold uppercase tracking-wider">Overdue</p>
              <h4 className="text-2xl md:text-3xl font-extrabold mt-2 text-rose-400">{overdueCount}</h4>
            </div>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[10px] text-white/40 mt-3 font-semibold">
            Requires immediate focus
          </div>
        </GlassCard>
      </div>

      {/* Main dashboard body: Left content, Right side widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2/3 width) - Charts & Quick Creation */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Custom SVG Weekly Analytics Chart */}
          <GlassCard>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-bold">Weekly Performance Trend</h3>
                <p className="text-[11px] text-white/40 mt-0.5">Summary of task velocity completed each day.</p>
              </div>
              <span className="text-[10px] bg-white/5 border border-white/5 px-2.5 py-1 rounded-full font-bold uppercase">
                Last 7 Days
              </span>
            </div>

            {/* Custom high-fidelity SVG bar graph */}
            <div className="h-48 w-full flex items-end justify-between px-2 pt-6 relative border-b border-white/5">
              {/* Chart Grid Lines */}
              <div className="absolute left-0 right-0 top-6 border-t border-dashed border-white/5" />
              <div className="absolute left-0 right-0 top-20 border-t border-dashed border-white/5" />
              <div className="absolute left-0 right-0 top-32 border-t border-dashed border-white/5" />

              {/* Bars */}
              {[
                { day: "Mon", count: 4, height: "h-[30%]" },
                { day: "Tue", count: 7, height: "h-[60%]" },
                { day: "Wed", count: 9, height: "h-[85%]" },
                { day: "Thu", count: 5, height: "h-[45%]" },
                { day: "Fri", count: 8, height: "h-[75%]" },
                { day: "Sat", count: 3, height: "h-[25%]" },
                { day: "Sun", count: 2, height: "h-[15%]" }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 z-10 w-[10%]">
                  <span className="text-[10px] font-bold text-white/50">{item.count}</span>
                  <div className={`w-full ${item.height} rounded-t-lg bg-gradient-to-t from-brand-primary via-brand-secondary to-brand-accent shadow-md transition-all hover:scale-105 duration-300 relative group`}>
                    {/* Hover tooltip */}
                    <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 px-2 py-0.5 rounded text-[8px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                      {item.count} completed
                    </div>
                  </div>
                  <span className="text-[10px] text-white/40 mt-1 font-semibold">{item.day}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Quick Create Task Widget */}
          <GlassCard>
            <h3 className="text-base font-bold mb-4">Quick Task Dispatch</h3>
            <form onSubmit={handleQuickCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Task Title</label>
                <input
                  type="text"
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                  placeholder="e.g., Finalize security code review..."
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Project Space</label>
                <select
                  value={quickProj}
                  onChange={(e) => setQuickProj(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                >
                  <option value="">Select Project</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3 flex justify-end mt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#6366F1] text-xs font-bold hover:bg-[#6366F1]/90 transition-colors flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Quick Dispatch
                </button>
              </div>
            </form>
          </GlassCard>

        </div>

        {/* Right Column (1/3 width) - Activities & Team status */}
        <div className="space-y-6">
          
          {/* Recent Activity Feed */}
          <GlassCard>
            <h3 className="text-base font-bold mb-4">Workspace Timeline</h3>
            <div className="space-y-4">
              {loadingActivities && (
                <div className="text-xs text-white/30 border border-dashed border-white/5 rounded-xl py-6 text-center">
                  Loading recent activity...
                </div>
              )}
              {!loadingActivities && activities.length === 0 && (
                <div className="text-xs text-white/30 border border-dashed border-white/5 rounded-xl py-6 text-center">
                  No activity yet.
                </div>
              )}
              {!loadingActivities && activities.slice(0, 6).map((act) => (
                <div key={act.id} className="flex gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-brand-accent mt-1.5 animate-pulse" />
                  <div>
                    <div className="leading-relaxed">
                      <span className="font-bold text-[#F8FAFC]/90">{act.user}</span>{" "}
                      <span className="text-white/50">{act.action}</span>{" "}
                      <span className="font-semibold text-brand-primary">{act.target}</span>
                    </div>
                    <div className="text-[10px] text-white/30 mt-1">{formatActivityTime(act.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Team Collaboration Status */}
          <GlassCard>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold">Team Workspace</h3>
              <Users className="w-4 h-4 text-white/40" />
            </div>
            <div className="space-y-4">
              {team.map((user, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${user.color} flex items-center justify-center font-bold text-xs text-white`}>
                      {user.initials}
                    </div>
                    <div>
                      <div className="text-xs font-bold">{user.name}</div>
                      <div className="text-[10px] text-white/40">{user.count} assigned task{user.count === 1 ? "" : "s"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      user.status === "Active" ? "bg-emerald-400" :
                      user.status === "Focused" ? "bg-cyan-400 animate-pulse" : "bg-white/20"
                    }`} />
                    <span className="text-[10px] text-white/60 font-semibold">{user.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

        </div>

      </div>
    </div>
  );
};
