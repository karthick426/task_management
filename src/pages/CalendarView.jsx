import React, { useState, useRef, useCallback } from "react";
import { useTasks } from "../context/TaskContext";
import { GlassCard } from "../components/GlassCard";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Info,
  Clock,
  X,
  GripVertical,
  CheckCircle2,
  Circle
} from "lucide-react";

export const CalendarView = () => {
  const { tasks, projects, activeProjectId, loadingTasks, createTask, updateTask } = useTasks();

  const [currentDate, setCurrentDate] = useState(new Date());

  // ── Drag state ─────────────────────────────────────────────────────────────
  // Use a ref so the value is always current inside async drop handlers.
  const draggedTaskId = useRef(null);
  const [draggingOver, setDraggingOver] = useState(null); // dateString of hovered cell
  const [isDragging, setIsDragging] = useState(false);
  // Track whether the last action was a drop so day-click can be suppressed.
  const justDropped = useRef(false);

  // ── Modal state ────────────────────────────────────────────────────────────
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [newAssignee, setNewAssignee] = useState("You");

  // ── Calendar helpers ───────────────────────────────────────────────────────
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const pad = (n) => String(n).padStart(2, "0");

  // Build calendar day cells
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const calendarDays = [];

  // Previous month filler
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const m = month === 0 ? 12 : month;
    const y = month === 0 ? year - 1 : year;
    calendarDays.push({
      dayNum: d,
      isCurrentMonth: false,
      dateString: `${y}-${pad(m)}-${pad(d)}`
    });
  }

  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      dayNum: i,
      isCurrentMonth: true,
      dateString: `${year}-${pad(month + 1)}-${pad(i)}`
    });
  }

  // Next month filler
  const remaining = calendarDays.length % 7 === 0 ? 0 : 7 - (calendarDays.length % 7);
  for (let i = 1; i <= remaining; i++) {
    const m = month === 11 ? 1 : month + 2;
    const y = month === 11 ? year + 1 : year;
    calendarDays.push({
      dayNum: i,
      isCurrentMonth: false,
      dateString: `${y}-${pad(m)}-${pad(i)}`
    });
  }

  const todayStr = new Date().toISOString().split("T")[0];

  // ── Drag handlers ──────────────────────────────────────────────────────────

  const handleDragStart = useCallback((e, taskId) => {
    draggedTaskId.current = taskId;
    setIsDragging(true);
    // Required for Firefox
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragEnd = useCallback(() => {
    draggedTaskId.current = null;
    setIsDragging(false);
    setDraggingOver(null);
  }, []);

  const handleCellDragEnter = useCallback((e, dateString) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingOver(dateString);
  }, []);

  const handleCellDragOver = useCallback((e) => {
    // Must call preventDefault to allow dropping
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleCellDragLeave = useCallback((e) => {
    // Only clear highlight if we truly left this cell (not just entered a child)
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDraggingOver(null);
    }
  }, []);

  const handleDrop = useCallback(async (e, dateString) => {
    e.preventDefault();
    e.stopPropagation();

    const taskId = draggedTaskId.current || e.dataTransfer.getData("text/plain");
    draggedTaskId.current = null;
    setIsDragging(false);
    setDraggingOver(null);

    if (taskId && dateString) {
      justDropped.current = true;
      // Reset the flag after the click event fires (which happens right after drop)
      setTimeout(() => { justDropped.current = false; }, 300);
      try {
        await updateTask(taskId, { dueDate: dateString, status: "todo" });
      } catch (err) {
        console.error("Failed to reschedule task:", err.message);
      }
    }
  }, [updateTask]);

  // ── Day click (open quick-schedule modal) ──────────────────────────────────
  const handleDayClick = useCallback((dateString) => {
    // Suppress click if it was triggered immediately after a drop
    if (justDropped.current) return;
    setSelectedDateStr(dateString);
    setShowAddModal(true);
  }, []);

  // ── Quick-schedule form ────────────────────────────────────────────────────
  const handleQuickAddTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const projId =
      activeProjectId !== "all" ? activeProjectId : projects[0]?.id || "proj-1";
    try {
      await createTask({
        projectId: projId,
        title: newTitle,
        description: "Scheduled via calendar click.",
        status: "todo",
        priority: newPriority,
        dueDate: selectedDateStr,
        assignee: newAssignee,
        tags: ["Schedule"]
      });
      setNewTitle("");
      setNewPriority("medium");
      setShowAddModal(false);
    } catch (err) {
      alert("Failed to schedule task: " + err.message);
    }
  };

  // Tasks without a date or in backlog status are considered "unscheduled"
  const unscheduledTasks = tasks.filter(
    (t) => t.status === "backlog" || !t.dueDate
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 text-brand-text max-w-7xl mx-auto h-full flex flex-col">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Workspace Calendar</h2>
          <p className="text-xs text-white/50 mt-1">
            Drag tasks from the backlog panel onto any day cell to schedule them. Click a day to create a new task.
          </p>
        </div>

        {/* Month navigation */}
        <div className="flex items-center gap-3 bg-white/5 border border-white/5 p-1 rounded-xl">
          <button
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            className="p-2 rounded-lg hover:bg-white/5 text-white/70 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold min-w-[130px] text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            className="p-2 rounded-lg hover:bg-white/5 text-white/70 hover:text-white"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active drag banner */}
      {loadingTasks && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-xs font-semibold text-white/50">
          Loading calendar tasks...
        </div>
      )}

      {isDragging && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-primary/10 border border-brand-primary/30 text-xs font-semibold text-brand-primary animate-pulse">
          <GripVertical className="w-4 h-4" />
          Drop onto a day cell to reschedule the task
        </div>
      )}

      {/* Main grid: calendar + sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start flex-1">

        {/* ── Calendar grid (3 / 4 columns) ── */}
        <div className="xl:col-span-3 glass-panel rounded-[24px] p-4 border border-white/10 shadow-2xl flex flex-col">

          {/* Day-of-week labels */}
          <div className="grid grid-cols-7 text-center pb-3 border-b border-white/5 font-bold text-xs text-white/40 tracking-wider">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1 mt-2 select-none">
            {calendarDays.map((cell, idx) => {
              const dayTasks = tasks.filter(
                (t) => t.dueDate === cell.dateString && t.status !== "backlog"
              );
              const isToday = cell.dateString === todayStr;
              const isHovered = draggingOver === cell.dateString;

              return (
                <div
                  key={idx}
                  /* ── drop-zone events ── */
                  onDragEnter={(e) => handleCellDragEnter(e, cell.dateString)}
                  onDragOver={handleCellDragOver}
                  onDragLeave={handleCellDragLeave}
                  onDrop={(e) => handleDrop(e, cell.dateString)}
                  /* ── click to schedule ── */
                  onClick={() => handleDayClick(cell.dateString)}
                  className={[
                    "min-h-[90px] p-1.5 rounded-xl border flex flex-col transition-all duration-150 cursor-pointer",
                    cell.isCurrentMonth
                      ? "bg-slate-900/40 border-white/5 hover:bg-white/5"
                      : "bg-slate-950/20 border-transparent text-white/20",
                    isToday
                      ? "border-brand-primary/60 bg-brand-primary/5 ring-1 ring-brand-primary/30"
                      : "",
                    isHovered
                      ? "border-brand-accent/60 bg-brand-accent/10 ring-2 ring-brand-accent/40 scale-[1.02] shadow-lg shadow-brand-accent/10"
                      : ""
                  ].join(" ")}
                >
                  {/* Day number + task count badge */}
                  <div className="flex justify-between items-center mb-1 shrink-0">
                    <span
                      className={`text-[10px] font-bold ${
                        isToday
                          ? "text-brand-primary"
                          : cell.isCurrentMonth
                          ? "text-white/60"
                          : "text-white/20"
                      }`}
                    >
                      {cell.dayNum}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="text-[8px] bg-brand-primary/10 text-brand-primary font-bold px-1.5 py-0.5 rounded-full">
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  {/* Drop hint shown when actively dragging over an empty cell */}
                  {isHovered && dayTasks.length === 0 && (
                    <div className="flex-1 flex items-center justify-center text-[9px] text-brand-accent/70 font-bold border border-dashed border-brand-accent/30 rounded-lg">
                      Drop here
                    </div>
                  )}

                  {/* Task chips inside the cell */}
                  <div className="flex flex-col gap-0.5 overflow-hidden">
                    {dayTasks.map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => {
                          e.stopPropagation();
                          handleDragStart(e, task.id);
                        }}
                        onDragEnd={handleDragEnd}
                        title={task.title}
                        className={[
                          "text-[8px] px-1 py-0.5 rounded font-bold cursor-grab active:cursor-grabbing border flex items-center gap-1 group/chip",
                          task.status === "completed"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : task.priority === "high"
                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                            : task.priority === "medium"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-white/5 text-white/70 border-white/5"
                        ].join(" ")}
                      >
                        {/* Complete toggle button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const newStatus = task.status === "completed" ? "todo" : "completed";
                            updateTask(task.id, { status: newStatus });
                          }}
                          title={task.status === "completed" ? "Mark as To Do" : "Mark as Completed"}
                          className="shrink-0 hover:scale-110 transition-transform"
                        >
                          {task.status === "completed"
                            ? <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                            : <Circle className="w-2.5 h-2.5 opacity-50 group-hover/chip:opacity-100" />}
                        </button>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            window.dispatchEvent(new CustomEvent("view-task", { detail: task }));
                          }}
                          className={`truncate flex-1 ${task.status === "completed" ? "line-through opacity-60" : ""}`}
                        >
                          {task.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Unscheduled backlog sidebar (1 / 4 columns) ── */}
        <div className="space-y-4">
          <GlassCard className="p-5">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-white/60 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-brand-primary" />
                Unscheduled
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/50 font-bold">
                {unscheduledTasks.length}
              </span>
            </div>

            <div className="space-y-2.5 max-h-[55vh] overflow-y-auto pr-0.5">
              {unscheduledTasks.length === 0 ? (
                <div className="py-8 text-center text-xs text-white/20 border border-dashed border-white/5 rounded-xl">
                  All tasks are scheduled!
                </div>
              ) : (
                unscheduledTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    className="p-3 rounded-xl bg-slate-900/60 border border-white/5 shadow-md hover:border-brand-primary/40 transition-all cursor-grab active:cursor-grabbing active:scale-95 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[8px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
                          task.priority === "high"
                            ? "bg-red-500/10 text-red-400"
                            : task.priority === "medium"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-emerald-500/10 text-emerald-400"
                        }`}
                      >
                        {task.priority}
                      </span>
                      <GripVertical className="w-3 h-3 text-white/20" />
                    </div>
                    <div className="text-[11px] font-bold text-white/90 leading-tight">
                      {task.title}
                    </div>
                    <div className="text-[9px] text-brand-accent/60 font-semibold">
                      Drag then drop onto a day
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex gap-2.5 items-start text-[10px] text-indigo-300">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-indigo-400" />
              <span>
                Drag a card from here and drop it onto a day cell to set its due date.
                Click any empty day to create a new scheduled task.
              </span>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* ── Quick-schedule modal ── */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddModal(false);
          }}
        >
          <div className="w-full max-w-md p-6 glass-panel rounded-[20px] shadow-2xl border border-white/10 text-brand-text">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-primary" />
                New task on{" "}
                <span className="text-brand-accent">{selectedDateStr}</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-white/60 hover:text-white hover:bg-white/5 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickAddTask} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-white/60 uppercase tracking-wider mb-2">
                  Task Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                  placeholder="e.g. Schedule team sync"
                  autoFocus
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-white/60 uppercase tracking-wider mb-2">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-white/60 uppercase tracking-wider mb-2">
                    Assignee
                  </label>
                  <input
                    type="text"
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                    placeholder="You"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brand-gradient text-white font-bold text-xs hover:opacity-90 shadow-lg"
                >
                  Schedule Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
