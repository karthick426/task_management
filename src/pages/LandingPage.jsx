import React, { useState } from "react";
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Users, 
  Shield, 
  Kanban,
  Calendar,
  BarChart3,
  Moon,
  ChevronDown,
  Github,
  Twitter,
  ExternalLink
} from "lucide-react";

export const LandingPage = ({ onGetStarted, onLogin }) => {
  const [activeFaq, setActiveFaq] = useState(null);

  // Interactive Live Kanban Sandbox states
  const [sandboxTasks, setSandboxTasks] = useState([
    { id: "sand-1", title: "Drag me to In Progress", status: "todo", priority: "medium" },
    { id: "sand-2", title: "Review marketing copy", status: "review", priority: "high" },
    { id: "sand-3", title: "Draft launch checklists", status: "todo", priority: "low" },
    { id: "sand-4", title: "Setup Figma design system", status: "completed", priority: "high" }
  ]);
  const [newTitle, setNewTitle] = useState("");

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    setSandboxTasks(prev => 
      prev.map(t => t.id === taskId ? { ...t, status: targetStatus } : t)
    );
  };

  const handleAddSandboxTask = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newTask = {
      id: "sand-" + Date.now(),
      title: newTitle,
      status: "todo",
      priority: ["low", "medium", "high"][Math.floor(Math.random() * 3)]
    };
    setSandboxTasks(prev => [...prev, newTask]);
    setNewTitle("");
  };

  const faqs = [
    { q: "What is FlowSync AI?", a: "FlowSync AI is an all-in-one productivity workspace that combines tasks, project boards, analytics, calendars, and real-time syncing under a glassmorphic dark-theme SaaS layout." },
    { q: "Does it support team collaboration?", a: "Yes! When connected to a Firebase database instance, tasks, board changes, and comments automatically sync across all open client browsers in real time." },
    { q: "Can I use it offline or without setup?", a: "Absolutely. FlowSync AI includes an intelligent automatic local fallback. If no Firebase configuration is supplied, it operates directly inside your local storage, ensuring full workspace capabilities." },
    { q: "What technologies are used?", a: "It is built on Vite, React, Tailwind CSS, Framer Motion, and connects to Firebase Auth & Cloud Firestore." }
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC] overflow-x-hidden font-sans relative">
      {/* Background Glowing Blobs */}
      <div className="absolute top-[-10%] left-[-20%] w-[800px] h-[800px] rounded-full bg-indigo-600/10 blur-[150px] pointer-events-none -z-10 animate-pulse-slow" />
      <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-600/10 blur-[130px] pointer-events-none -z-10 animate-blob" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[700px] h-[700px] rounded-full bg-purple-600/10 blur-[160px] pointer-events-none -z-10 animate-blob [animation-delay:3s]" />

      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 h-20 border-b border-white/5 bg-[#0F172A]/70 backdrop-blur-md z-50 flex items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6366F1] via-[#8B5CF6] to-[#06B6D4] shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#06B6D4] bg-clip-text text-transparent">
            FlowSync AI
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onLogin}
            className="px-4 py-2 text-sm text-[#F8FAFC]/80 hover:text-white transition-colors"
          >
            Sign In
          </button>
          <button 
            onClick={onGetStarted}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white text-sm font-semibold hover:opacity-90 shadow-lg shadow-indigo-500/20 transition-all"
          >
            Get Started Free
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 animate-bounce">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-[#F8FAFC]/80">Next-Gen Productivity Workspace</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl leading-tight">
          Synchronize Your Workflow <br className="hidden md:block" />
          With <span className="bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#06B6D4] bg-clip-text text-transparent">AI-Driven Precision</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl">
          A premium, high-speed space designed to manage tasks, schedules, and analytics. Built with beautiful glassmorphism and instant sync.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <button 
            onClick={onGetStarted}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#06B6D4] text-white font-bold text-base hover:opacity-90 shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-2 group transition-all"
          >
            Launch Free Workspace
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <a
            href="#sandbox"
            className="px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#F8FAFC] font-semibold text-base flex items-center justify-center transition-colors"
          >
            Try Live Sandbox
          </a>
        </div>

        {/* Live Interactive Sandbox Preview (WOW Feature) */}
        <div id="sandbox" className="w-full max-w-5xl mt-8 p-1.5 rounded-[24px] bg-gradient-to-tr from-[#6366F1]/20 via-purple-500/10 to-[#06B6D4]/20 border border-white/10 shadow-2xl relative">
          <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-indigo-600 text-[10px] font-extrabold uppercase tracking-widest shadow-md">
            Interactive Live Sandbox Sandbox
          </div>
          <div className="w-full rounded-[22px] bg-[#1E293B]/80 backdrop-blur-xl p-6 md:p-8 text-left border border-white/5">
            {/* Sandbox Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Kanban className="w-5 h-5 text-[#6366F1]" />
                  FlowSync Taskboard Sandbox
                </h3>
                <p className="text-xs text-slate-400 mt-1">Drag and drop cards or add items below to test the workspace physics.</p>
              </div>
              <form onSubmit={handleAddSandboxTask} className="flex gap-2 w-full sm:w-auto">
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="px-4 py-2 text-xs rounded-xl glass-input flex-1 sm:w-48"
                  placeholder="Create task..."
                  required
                />
                <button 
                  type="submit" 
                  className="px-4 py-2 rounded-xl bg-[#6366F1] text-xs font-bold hover:bg-[#6366F1]/90"
                >
                  Add Task
                </button>
              </form>
            </div>

            {/* Sandbox Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {["todo", "review", "completed"].map((colStatus) => {
                const columnTasks = sandboxTasks.filter(t => t.status === colStatus);
                return (
                  <div 
                    key={colStatus}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, colStatus)}
                    className="p-4 rounded-2xl bg-slate-900/50 border border-white/5 min-h-[200px] flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {colStatus === "todo" ? "To Do" : colStatus === "review" ? "In Review" : "Completed"}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-400 font-bold">
                        {columnTasks.length}
                      </span>
                    </div>

                    {columnTasks.map(task => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className="p-3.5 rounded-xl bg-[#1E293B] border border-white/5 shadow-md cursor-grab active:cursor-grabbing hover:border-indigo-500/40 hover:shadow-indigo-500/5 transition-all flex flex-col gap-2 relative group"
                      >
                        <div className="flex justify-between items-start">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold uppercase ${
                            task.priority === "high" ? "bg-red-500/10 text-red-400" :
                            task.priority === "medium" ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                        <div className="text-xs font-semibold">{task.title}</div>
                      </div>
                    ))}

                    {columnTasks.length === 0 && (
                      <div className="flex-1 border-2 border-dashed border-white/5 rounded-xl flex items-center justify-center text-slate-600 text-xs py-8">
                        Drop items here
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-20 px-6 bg-[#0F172A]/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Complete Productivity Workspace</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Skip the tools overlap. We built everything you need inside a single fluid page structure.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-[20px] bg-slate-900/50 border border-white/5 hover:border-indigo-500/30 transition-all hover:translate-y-[-4px] group">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                <Kanban className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Kanban boards</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Drag cards, assign collaborators, toggle checklists, and manage details via floating detail overlays.</p>
            </div>
            
            <div className="p-8 rounded-[20px] bg-slate-900/50 border border-white/5 hover:border-cyan-500/30 transition-all hover:translate-y-[-4px] group">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-6 group-hover:bg-cyan-500 group-hover:text-white transition-all">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Interactive Calendar</h3>
              <p className="text-slate-400 text-sm leading-relaxed">View all deadline items in a grid calendar. Drag items in from a sidebar task list to schedule them dynamically.</p>
            </div>

            <div className="p-8 rounded-[20px] bg-slate-900/50 border border-white/5 hover:border-purple-500/30 transition-all hover:translate-y-[-4px] group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6 group-hover:bg-purple-500 group-hover:text-white transition-all">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Productivity Analytics</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Monitor team metrics, pending counters, and week-over-week trends using beautiful customized SVG analytics charts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics section */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
            <div className="text-3xl md:text-5xl font-extrabold text-[#6366F1] tracking-tight">99.9%</div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-2">API Uptime</div>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
            <div className="text-3xl md:text-5xl font-extrabold text-[#8B5CF6] tracking-tight">40ms</div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-2">Sync Latency</div>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
            <div className="text-3xl md:text-5xl font-extrabold text-[#06B6D4] tracking-tight">150k+</div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-2">Tasks Sync'd</div>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
            <div className="text-3xl md:text-5xl font-extrabold text-emerald-400 tracking-tight">2.5x</div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-2">Team Velocity</div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-[#0E1527] border-t border-white/5">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-16">Trusted by High-Growth Teams</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="p-8 rounded-[24px] bg-[#1E293B]/50 border border-white/10 backdrop-blur-md flex flex-col justify-between">
              <p className="text-slate-300 italic text-base leading-relaxed mb-6">
                "FlowSync changed the way we handle launch checklists. The UI is incredibly fast, and dragging tasks directly onto the calendar was an instant productivity boost."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center font-bold text-sm text-white">
                  SK
                </div>
                <div>
                  <div className="text-sm font-bold">Sarah K.</div>
                  <div className="text-xs text-slate-400">Lead Product Designer, Vercel</div>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-[24px] bg-[#1E293B]/50 border border-white/10 backdrop-blur-md flex flex-col justify-between">
              <p className="text-slate-300 italic text-base leading-relaxed mb-6">
                "The automatic Local Storage fallback is brilliant. We could play around with the tasks and structure before setting up any firebase configs. 10/10 developers experience."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center font-bold text-sm text-white">
                  MJ
                </div>
                <div>
                  <div className="text-sm font-bold">Marcus J.</div>
                  <div className="text-xs text-slate-400">Technical Director, Linear</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isActive = activeFaq === index;
            return (
              <div key={index} className="rounded-xl border border-white/5 bg-[#1E293B]/30 overflow-hidden">
                <button
                  onClick={() => setActiveFaq(isActive ? null : index)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left font-semibold text-sm hover:bg-white/5 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isActive ? "rotate-180" : ""}`} />
                </button>
                {isActive && (
                  <div className="px-6 py-4 text-xs text-slate-400 border-t border-white/5 leading-relaxed bg-slate-900/20">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 bg-slate-950 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white font-bold text-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-[#F8FAFC]">FlowSync AI</span>
          </div>
          
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
              <Github className="w-3.5 h-3.5" /> Github
            </a>
          </div>

          <div>
            © 2026 FlowSync AI, Inc. Built for premium workspaces.
          </div>
        </div>
      </footer>
    </div>
  );
};
