import React from "react";
import { useTasks } from "../context/TaskContext";
import { GlassCard } from "../components/GlassCard";
import { TASK_STATUSES } from "../constants/taskConfig";
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Calendar,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export const AnalyticsView = () => {
  const { tasks, projects, loadingTasks, loadingProjects } = useTasks();

  // Statistics calculations
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === "completed").length;

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  // Tasks by priority
  const highPriority = tasks.filter(t => t.priority === "high").length;
  const mediumPriority = tasks.filter(t => t.priority === "medium").length;
  const lowPriority = tasks.filter(t => t.priority === "low").length;

  // Calculate SVG circular stroke offset
  // Radius = 50, Circumference = 2 * PI * 50 = 314
  const radius = 50;
  const strokeDash = 2 * Math.PI * radius;
  const strokeOffset = strokeDash - (completionRate / 100) * strokeDash;

  return (
    <div className="space-y-8 text-brand-text max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight">Productivity Analytics</h2>
        <p className="text-xs text-white/50 mt-1">Deep analysis of your workspace performance metrics and task completion rates.</p>
      </div>

      {(loadingTasks || loadingProjects) && (
        <div className="rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-xs text-white/50">
          Loading analytics data...
        </div>
      )}

      {/* Primary Row: Completion Ring & Workload Bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* SVG Progress Ring */}
        <GlassCard className="flex flex-col items-center justify-center text-center p-8">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-white/40 mb-6">Completion Rate</h3>
          
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* SVG Circle */}
            <svg className="w-full h-full transform -rotate-90">
              {/* Outer ring */}
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="stroke-white/5 fill-transparent"
                strokeWidth="10"
              />
              {/* Filled Ring with Gradients */}
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="stroke-[url(#gradient1)] fill-transparent transition-all duration-1000 ease-out"
                strokeWidth="10"
                strokeDasharray={strokeDash}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="50%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
              </defs>
            </svg>

            {/* Inner Percentage */}
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-extrabold tracking-tight text-white">{completionRate}%</span>
              <span className="text-[9px] text-white/40 uppercase tracking-widest mt-1 font-bold">Done</span>
            </div>
          </div>

          <div className="flex gap-4 mt-6 text-xs font-semibold text-white/50">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-primary" />
              <span>{completed} Completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white/20" />
              <span>{total - completed} Pending</span>
            </div>
          </div>
        </GlassCard>

        {/* Priority Workload Distribution Chart */}
        <GlassCard className="md:col-span-2">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-white/40 mb-6">Workload Priority Map</h3>
          
          <div className="space-y-5">
            {/* High priority */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-rose-400">High Priority</span>
                <span className="font-semibold text-white/60">{highPriority} tasks</span>
              </div>
              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-rose-500 rounded-full transition-all duration-500" 
                  style={{ width: `${total > 0 ? (highPriority / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Medium priority */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-amber-400">Medium Priority</span>
                <span className="font-semibold text-white/60">{mediumPriority} tasks</span>
              </div>
              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                  style={{ width: `${total > 0 ? (mediumPriority / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Low priority */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-emerald-400">Low Priority</span>
                <span className="font-semibold text-white/60">{lowPriority} tasks</span>
              </div>
              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                  style={{ width: `${total > 0 ? (lowPriority / total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </GlassCard>

      </div>

      {/* SVG Line Graph: Productivity trends */}
      <GlassCard>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-base font-bold">Productivity Acceleration</h3>
            <p className="text-[11px] text-white/40 mt-0.5">Historical overview of workspace completion rates.</p>
          </div>
          <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
            <TrendingUp className="w-3.5 h-3.5" />
            +18.4% Velocity
          </div>
        </div>

        {/* Custom SVG Line graph */}
        <div className="w-full h-56 pt-6 relative">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 700 200" preserveAspectRatio="none">
            {/* Grid horizontal guidelines */}
            <line x1="0" y1="50" x2="700" y2="50" className="stroke-white/5" strokeDasharray="5" />
            <line x1="0" y1="100" x2="700" y2="100" className="stroke-white/5" strokeDasharray="5" />
            <line x1="0" y1="150" x2="700" y2="150" className="stroke-white/5" strokeDasharray="5" />
            
            {/* Gradient fill area */}
            <path
              d="M0,200 L50,160 L150,140 L250,100 L350,90 L450,120 L550,60 L700,40 L700,200 Z"
              fill="url(#chartGrad)"
            />
            
            {/* Graph Line */}
            <path
              d="M0,200 L50,160 L150,140 L250,100 L350,90 L450,120 L550,60 L700,40"
              fill="transparent"
              className="stroke-[url(#lineGrad)]"
              strokeWidth="4"
              strokeLinecap="round"
            />
            
            {/* Tooltip marker circles */}
            <circle cx="250" cy="100" r="6" className="fill-brand-accent stroke-[#0F172A] stroke-2" />
            <circle cx="550" cy="60" r="6" className="fill-brand-primary stroke-[#0F172A] stroke-2" />
            <circle cx="700" cy="40" r="6" className="fill-[#06B6D4] stroke-[#0F172A] stroke-2" />

            {/* Gradients */}
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366F1" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
            </defs>
          </svg>

          {/* X Axis labels */}
          <div className="flex justify-between items-center text-[10px] text-white/40 mt-3 font-semibold">
            <span>May 1</span>
            <span>May 8</span>
            <span>May 15</span>
            <span>May 22</span>
            <span>May 29</span>
            <span>Jun 5</span>
            <span>Jun 10 (Today)</span>
          </div>
        </div>
      </GlassCard>

      {/* Row 3: Projects breakdown table */}
      <GlassCard>
        <h3 className="text-base font-bold mb-6">Space Projects Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-white/40 font-bold uppercase tracking-wider">
                <th className="pb-3.5">Space Name</th>
                <th className="pb-3.5">Workspace Tasks</th>
                <th className="pb-3.5">Completion Rate</th>
                <th className="pb-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[#F8FAFC]/90">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-6 text-center text-white/30">
                    No projects established.
                  </td>
                </tr>
              ) : (
                projects.map((proj) => {
                  const projTasks = tasks.filter(t => t.projectId === proj.id);
                  const projCompleted = projTasks.filter(t => t.status === "completed").length;
                  const rate = projTasks.length > 0 ? Math.round((projCompleted / projTasks.length) * 100) : 0;
                  const activeStatuses = TASK_STATUSES.filter(status =>
                    projTasks.some(task => task.status === status.id)
                  ).length;
                  return (
                    <tr key={proj.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 font-bold flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: proj.color }} />
                        {proj.name}
                      </td>
                      <td className="py-4 font-semibold text-white/60">
                        {projCompleted}/{projTasks.length} Done - {activeStatuses} lanes active
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-3 w-40">
                          <span className="font-semibold w-8">{rate}%</span>
                          <div className="h-1.5 flex-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-primary" style={{ width: `${rate}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          rate === 100 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                            : "bg-indigo-500/10 text-brand-primary border border-indigo-500/20"
                        }`}>
                          {rate === 100 ? "Sync'd" : "Syncing"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};
