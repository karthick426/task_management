export const TASK_STATUSES = [
  { id: "backlog", title: "Backlog", color: "border-t-slate-500 bg-slate-500/5" },
  { id: "todo", title: "To Do", color: "border-t-indigo-500 bg-indigo-500/5" },
  { id: "in-progress", title: "In Progress", color: "border-t-amber-500 bg-amber-500/5" },
  { id: "review", title: "In Review", color: "border-t-cyan-500 bg-cyan-500/5" },
  { id: "completed", title: "Completed", color: "border-t-emerald-500 bg-emerald-500/5" }
];

export const TASK_PRIORITIES = ["low", "medium", "high"];

export const TASK_SORT_OPTIONS = [
  { id: "created-desc", label: "Newest" },
  { id: "due-asc", label: "Due soon" },
  { id: "priority-desc", label: "Priority" },
  { id: "title-asc", label: "Title" }
];

export const priorityRank = {
  low: 1,
  medium: 2,
  high: 3
};

export const formatStatusLabel = (status) => {
  const match = TASK_STATUSES.find(item => item.id === status);
  return match ? match.title : status.replace("-", " ");
};
