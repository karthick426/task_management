import React, { useEffect, useMemo, useState } from "react";
import { useTasks } from "../context/TaskContext";
import { GlassCard } from "../components/GlassCard";
import { TASK_PRIORITIES, TASK_SORT_OPTIONS, TASK_STATUSES, formatStatusLabel, priorityRank } from "../constants/taskConfig";
import { 
  Plus, 
  Trash2, 
  Calendar, 
  User, 
  X,
  MessageSquare,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Edit3,
  Filter,
  Save,
  SortAsc
} from "lucide-react";

export const KanbanBoard = ({ searchQuery }) => {
  const { tasks, projects, activeProjectId, loadingTasks, createTask, updateTask, deleteTask, addComment } = useTasks();

  const [draggedId, setDraggedId] = useState(null);
  
  // Modal states for task creation
  const [showAddModal, setShowAddModal] = useState(false);
  const [targetStatus, setTargetStatus] = useState("todo");
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [newDueDate, setNewDueDate] = useState("");
  const [newAssignee, setNewAssignee] = useState("You");
  const [newTagsStr, setNewTagsStr] = useState("");

  // Drawer states for task details & comments
  const [selectedTask, setSelectedTask] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [editingTask, setEditingTask] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPriority, setEditPriority] = useState("medium");
  const [editStatus, setEditStatus] = useState("todo");
  const [editDueDate, setEditDueDate] = useState("");
  const [editAssignee, setEditAssignee] = useState("");
  const [editTagsStr, setEditTagsStr] = useState("");

  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [dueFilter, setDueFilter] = useState("all");
  const [hideCompleted, setHideCompleted] = useState(false);
  const [sortBy, setSortBy] = useState("created-desc");
  const [mobileColumn, setMobileColumn] = useState("todo");

  const columns = TASK_STATUSES;

  const assigneeOptions = useMemo(() => {
    const names = tasks.map(task => task.assignee).filter(Boolean);
    return [...new Set(names)].sort((a, b) => a.localeCompare(b));
  }, [tasks]);

  useEffect(() => {
    if (!selectedTask) return;
    const freshTask = tasks.find(task => task.id === selectedTask.id);
    if (freshTask) {
      setSelectedTask(freshTask);
    }
  }, [tasks, selectedTask]);

  const beginEditTask = (task) => {
    setEditTitle(task.title || "");
    setEditDesc(task.description || "");
    setEditPriority(task.priority || "medium");
    setEditStatus(task.status || "todo");
    setEditDueDate(task.dueDate || "");
    setEditAssignee(task.assignee || "You");
    setEditTagsStr((task.tags || []).join(", "));
    setEditingTask(true);
  };

  // Drag and Drop implementation
  const handleDragStart = (e, taskId) => {
    setDraggedId(taskId);
    e.dataTransfer.setData("text/plain", taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, columnStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain") || draggedId;
    if (taskId) {
      await updateTask(taskId, { status: columnStatus });
      setDraggedId(null);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    // Pick active project space or the first available
    const projId = activeProjectId !== "all" ? activeProjectId : (projects[0]?.id || "proj-1");
    const tags = newTagsStr.split(",").map(t => t.trim()).filter(t => t !== "");

    try {
      await createTask({
        projectId: projId,
        title: newTitle,
        description: newDesc,
        status: targetStatus,
        priority: newPriority,
        dueDate: newDueDate || new Date().toISOString().split("T")[0],
        assignee: newAssignee,
        tags
      });
      
      // Reset form
      setNewTitle("");
      setNewDesc("");
      setNewPriority("medium");
      setNewDueDate("");
      setNewAssignee("You");
      setNewTagsStr("");
      setShowAddModal(false);
    } catch (err) {
      alert("Failed to create task: " + err.message);
    }
  };

  const handleDeleteTaskInDrawer = async (taskId) => {
    if (confirm("Are you sure you want to delete this task?")) {
      await deleteTask(taskId);
      setSelectedTask(null);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedTask) return;
    try {
      const added = await addComment(selectedTask.id, commentText);
      // Update selectedTask local view comments list
      setSelectedTask(prev => ({
        ...prev,
        comments: [...(prev.comments || []), added]
      }));
      setCommentText("");
    } catch (err) {
      alert("Comment failed: " + err.message);
    }
  };

  const handleSaveTaskEdit = async (e) => {
    e.preventDefault();
    if (!selectedTask || !editTitle.trim()) return;

    const updatedData = {
      title: editTitle.trim(),
      description: editDesc.trim(),
      priority: editPriority,
      status: editStatus,
      dueDate: editDueDate,
      assignee: editAssignee.trim() || "Unassigned",
      tags: editTagsStr.split(",").map(tag => tag.trim()).filter(Boolean)
    };

    try {
      await updateTask(selectedTask.id, updatedData);
      setSelectedTask(prev => ({ ...prev, ...updatedData }));
      setEditingTask(false);
    } catch (err) {
      alert("Failed to update task: " + err.message);
    }
  };

  // Filter tasks by project scope & navbar search query
  const todayStr = new Date().toISOString().split("T")[0];
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      (task.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (task.assignee && task.assignee.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (task.tags && task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    const matchesAssignee = assigneeFilter === "all" || task.assignee === assigneeFilter;
    const matchesCompletion = !hideCompleted || task.status !== "completed";
    const matchesDue =
      dueFilter === "all" ||
      (dueFilter === "overdue" && task.dueDate && task.dueDate < todayStr && task.status !== "completed") ||
      (dueFilter === "today" && task.dueDate === todayStr) ||
      (dueFilter === "unscheduled" && !task.dueDate);

    return matchesSearch && matchesPriority && matchesAssignee && matchesCompletion && matchesDue;
  }).sort((a, b) => {
    if (sortBy === "due-asc") {
      return (a.dueDate || "9999-12-31").localeCompare(b.dueDate || "9999-12-31");
    }
    if (sortBy === "priority-desc") {
      return (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0);
    }
    if (sortBy === "title-asc") {
      return (a.title || "").localeCompare(b.title || "");
    }
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  const visibleTaskCount = filteredTasks.length;
  const completedTaskCount = filteredTasks.filter(task => task.status === "completed").length;
  const completionPercent = visibleTaskCount > 0
    ? Math.round((completedTaskCount / visibleTaskCount) * 100)
    : 0;
  const remainingTaskCount = visibleTaskCount - completedTaskCount;

  return (
    <div className="space-y-6 text-brand-text h-full flex flex-col max-w-7xl mx-auto">
      {/* Board Header details */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            Productivity Task Board
          </h2>
          <p className="text-xs text-white/50 mt-1">
            {activeProjectId === "all" 
              ? "Displaying all active project workspaces" 
              : `Space: ${projects.find(p => p.id === activeProjectId)?.name || "Active Space"}`}
          </p>
        </div>
        <button
          onClick={() => {
            setTargetStatus("todo");
            setShowAddModal(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-gradient hover:opacity-90 transition-opacity text-white text-xs font-bold shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Add Workspace Task
        </button>
      </div>

      {/* Completed progress bar */}
      <GlassCard className="p-4 rounded-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-extrabold">Completed Progress</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-white/50 font-bold">
                  {completedTaskCount}/{visibleTaskCount} done
                </span>
              </div>
              <p className="text-[11px] text-white/40 mt-1">
                {remainingTaskCount > 0
                  ? `${remainingTaskCount} task${remainingTaskCount === 1 ? "" : "s"} remaining in this view`
                  : visibleTaskCount > 0
                    ? "All visible tasks are completed"
                    : "No tasks match the current board view"}
              </p>
            </div>
          </div>

          <div className="w-full md:max-w-md space-y-2">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-white/40">
              <span>Completed</span>
              <span className="text-emerald-400">{completionPercent}%</span>
            </div>
            <div
              className="h-3 w-full overflow-hidden rounded-full bg-white/5 border border-white/5"
              role="progressbar"
              aria-label="Completed tasks"
              aria-valuenow={completionPercent}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-brand-primary shadow-[0_0_18px_rgba(16,185,129,0.35)] transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-4 rounded-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-3">
          <label className="space-y-1.5">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider flex items-center gap-1">
              <Filter className="w-3 h-3" /> Priority
            </span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs"
            >
              <option value="all">All priorities</option>
              {TASK_PRIORITIES.map(priority => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Assignee</span>
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs"
            >
              <option value="all">All assignees</option>
              {assigneeOptions.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Due Date</span>
            <select
              value={dueFilter}
              onChange={(e) => setDueFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs"
            >
              <option value="all">All dates</option>
              <option value="overdue">Overdue</option>
              <option value="today">Today</option>
              <option value="unscheduled">Unscheduled</option>
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider flex items-center gap-1">
              <SortAsc className="w-3 h-3" /> Sort
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs"
            >
              {TASK_SORT_OPTIONS.map(option => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5 sm:hidden">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Mobile Column</span>
            <select
              value={mobileColumn}
              onChange={(e) => setMobileColumn(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs"
            >
              {columns.map(col => (
                <option key={col.id} value={col.id}>{col.title}</option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 self-end min-h-9 px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-xs font-bold text-white/60">
            <input
              type="checkbox"
              checked={hideCompleted}
              onChange={(e) => setHideCompleted(e.target.checked)}
              className="accent-brand-primary"
            />
            Hide completed
          </label>
        </div>
      </GlassCard>

      {loadingTasks && (
        <div className="rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-xs text-white/50">
          Loading workspace tasks...
        </div>
      )}

      {/* Board Grid Columns */}
      <div className="flex-1 overflow-x-auto pb-4 flex gap-5 select-none items-start">
        {columns.map((col) => {
          const columnTasks = filteredTasks.filter(t => t.status === col.id);
          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`w-72 shrink-0 rounded-[20px] p-4 border border-white/5 flex-col gap-4 max-h-[75vh] overflow-y-auto ${col.id === mobileColumn ? "flex" : "hidden sm:flex"} ${col.color}`}
            >
              {/* Column header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-1 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-white/60">
                    {col.title}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/50 font-bold">
                    {columnTasks.length}
                  </span>
                </div>
                <button 
                  onClick={() => {
                    setTargetStatus(col.id);
                    setShowAddModal(true);
                  }}
                  className="p-1 rounded hover:bg-white/5 text-white/40 hover:text-white"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Task cards */}
              <div className="flex flex-col gap-3 overflow-y-auto pr-1">
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onClick={() => setSelectedTask(task)}
                    className="p-4 rounded-xl bg-[#1E293B] border border-white/5 shadow-md hover:border-brand-primary/40 hover:translate-y-[-2px] transition-all cursor-grab active:cursor-grabbing flex flex-col gap-3.5 relative group"
                  >
                    <div className="flex justify-between items-start">
                      <span className={`text-[9px] px-2 py-0.5 rounded font-extrabold uppercase tracking-wider ${
                        task.priority === "high" ? "bg-red-500/10 text-red-400" :
                        task.priority === "medium" ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"
                      }`}>
                        {task.priority}
                      </span>
                    </div>

                    <div className="text-xs font-bold leading-relaxed">{task.title}</div>
                    
                    {task.description && (
                      <p className="text-[10px] text-white/40 line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-1 mt-1">
                      {task.tags && task.tags.map((t, i) => (
                        <span key={i} className="text-[8px] px-1.5 py-0.5 rounded bg-white/5 text-white/50 font-semibold border border-white/5">
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="flex justify-between items-center border-t border-white/5 pt-3 mt-1 text-[9px] text-white/40 font-semibold">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-white/30" />
                        <span>{task.dueDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {task.comments && task.comments.length > 0 && (
                          <div className="flex items-center gap-0.5">
                            <MessageSquare className="w-3 h-3 text-white/30" />
                            <span>{task.comments.length}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded">
                          <User className="w-2.5 h-2.5 text-white/30" />
                          <span>{task.assignee}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {columnTasks.length === 0 && (
                  <div className="border border-dashed border-white/5 rounded-xl py-10 text-center text-xs text-white/20">
                    No active tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Creation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg p-6 glass-panel rounded-[20px] shadow-2xl border border-white/10 text-brand-text max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-primary" />
                Add Workspace Task
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-white/60 hover:text-white hover:bg-white/5 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider">Title</label>
                  <input 
                    type="text" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                    placeholder="Brief summary of work"
                    required
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider">Description</label>
                  <textarea 
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs min-h-[80px]"
                    placeholder="Detailed description of requirements..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider">Priority</label>
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

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider">Due Date</label>
                  <input 
                    type="date" 
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider">Assignee</label>
                  <input 
                    type="text" 
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                    placeholder="Name or Email"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider">Tags (comma-separated)</label>
                  <input 
                    type="text" 
                    value={newTagsStr}
                    onChange={(e) => setNewTagsStr(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                    placeholder="Design, Frontend, Review"
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
                  Dispatch Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Details & Comments Drawer (WOW Feature) */}
      {selectedTask && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-md bg-[#0F172A]/95 backdrop-blur-xl border-l border-white/10 shadow-2xl flex flex-col text-brand-text animate-slide-left">
          
          {/* Drawer Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <span className="text-xs font-bold text-white/40 uppercase tracking-wider">Task workspace</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => editingTask ? setEditingTask(false) : beginEditTask(selectedTask)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-white/60 hover:text-white"
                title={editingTask ? "Cancel Editing" : "Edit Task"}
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleDeleteTaskInDrawer(selectedTask.id)}
                className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400"
                title="Delete Task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setSelectedTask(null)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {editingTask ? (
              <form onSubmit={handleSaveTaskEdit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider">Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider">Description</label>
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs min-h-[90px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <label className="space-y-1.5">
                    <span className="block text-[10px] font-bold text-white/50 uppercase tracking-wider">Status</span>
                    <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="w-full px-4 py-2.5 rounded-xl glass-input text-xs">
                      {columns.map(col => <option key={col.id} value={col.id}>{col.title}</option>)}
                    </select>
                  </label>
                  <label className="space-y-1.5">
                    <span className="block text-[10px] font-bold text-white/50 uppercase tracking-wider">Priority</span>
                    <select value={editPriority} onChange={(e) => setEditPriority(e.target.value)} className="w-full px-4 py-2.5 rounded-xl glass-input text-xs">
                      {TASK_PRIORITIES.map(priority => <option key={priority} value={priority}>{priority}</option>)}
                    </select>
                  </label>
                  <label className="space-y-1.5">
                    <span className="block text-[10px] font-bold text-white/50 uppercase tracking-wider">Due Date</span>
                    <input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} className="w-full px-4 py-2.5 rounded-xl glass-input text-xs" />
                  </label>
                  <label className="space-y-1.5">
                    <span className="block text-[10px] font-bold text-white/50 uppercase tracking-wider">Assignee</span>
                    <input type="text" value={editAssignee} onChange={(e) => setEditAssignee(e.target.value)} className="w-full px-4 py-2.5 rounded-xl glass-input text-xs" />
                  </label>
                </div>
                <label className="space-y-1.5 block">
                  <span className="block text-[10px] font-bold text-white/50 uppercase tracking-wider">Tags</span>
                  <input type="text" value={editTagsStr} onChange={(e) => setEditTagsStr(e.target.value)} className="w-full px-4 py-2.5 rounded-xl glass-input text-xs" placeholder="Design, Frontend, Review" />
                </label>
                <button type="submit" className="w-full py-2.5 rounded-xl bg-brand-gradient text-white font-bold text-xs hover:opacity-90 shadow-lg flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" />
                  Save Task
                </button>
              </form>
            ) : (
              <>
                <div>
                  <h3 className="text-lg font-bold">{selectedTask.title}</h3>
                  <p className="text-xs text-white/40 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Status: <span className="font-bold text-brand-primary capitalize">{formatStatusLabel(selectedTask.status)}</span>
                  </p>
                </div>

                {selectedTask.description && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider">Description</h4>
                    <p className="text-xs text-white/70 leading-relaxed bg-white/5 p-3.5 rounded-xl border border-white/5">
                      {selectedTask.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 border-y border-white/5 py-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider block">Priority</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold uppercase inline-block ${
                      selectedTask.priority === "high" ? "bg-red-500/10 text-red-400" :
                      selectedTask.priority === "medium" ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"
                    }`}>
                      {selectedTask.priority}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider block">Assignee</span>
                    <span className="text-xs font-semibold flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-white/30" />
                      {selectedTask.assignee}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider block">Due Date</span>
                    <span className="text-xs font-semibold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-white/30" />
                      {selectedTask.dueDate || "Unscheduled"}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider block">Tags</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedTask.tags && selectedTask.tags.length > 0 ? selectedTask.tags.map((t, i) => (
                        <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/5 font-semibold text-white/60">
                          {t}
                        </span>
                      )) : <span className="text-[10px] text-white/30">No tags</span>}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Comments Thread Section */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-white/30" />
                Comments Thread ({selectedTask.comments ? selectedTask.comments.length : 0})
              </h4>
              
              {/* Comment Input form */}
              <form onSubmit={handlePostComment} className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl glass-input text-xs"
                  placeholder="Ask a question or comment..."
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-brand-primary text-white font-bold text-xs hover:bg-brand-primary/90 transition-colors"
                >
                  Send
                </button>
              </form>

              {/* Comments list */}
              <div className="space-y-3 pt-2">
                {selectedTask.comments && selectedTask.comments.length > 0 ? (
                  selectedTask.comments.map((comm) => (
                    <div key={comm.id} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1.5 text-xs">
                      <div className="flex justify-between items-center text-[10px] text-white/40 font-semibold">
                        <span className="text-[#F8FAFC]/90">{comm.authorName}</span>
                        <span>{new Date(comm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-white/80 leading-relaxed">{comm.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-white/20 border border-dashed border-white/5 rounded-xl">
                    No comments yet. Start the conversation!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
