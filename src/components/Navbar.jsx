import React, { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useTasks } from "../context/TaskContext";
import { 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  Sparkles,
  LogOut, 
  User, 
  Palette,
  CheckCircle,
  Clock,
  Plus
} from "lucide-react";

export const Navbar = ({ searchQuery, setSearchQuery }) => {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { tasks, activities } = useTasks();

  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  
  const [readNotificationIds, setReadNotificationIds] = useState([]);

  const notifications = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const highPriority = tasks.filter(t => t.priority === "high" && t.status !== "completed");
    const overdue = tasks.filter(t => t.dueDate && t.dueDate < todayStr && t.status !== "completed");
    const taskAlerts = [];

    if (overdue.length > 0) {
      taskAlerts.push({
        id: "overdue",
        title: `${overdue.length} overdue task${overdue.length === 1 ? "" : "s"}`,
        desc: `"${overdue[0].title}" needs attention.`,
        time: "Now",
        type: "urgent"
      });
    }

    if (highPriority.length > 0) {
      taskAlerts.push({
        id: "priority",
        title: `${highPriority.length} high-priority task${highPriority.length === 1 ? "" : "s"}`,
        desc: `"${highPriority[0].title}" is still open.`,
        time: "Priority",
        type: "urgent"
      });
    }

    const activityAlerts = activities.slice(0, 5).map(activity => ({
      id: activity.id,
      title: activity.action,
      desc: activity.target,
      time: activity.createdAt ? new Date(activity.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Recent",
      type: activity.type || "system"
    }));

    return [...taskAlerts, ...activityAlerts].map(item => ({
      ...item,
      read: readNotificationIds.includes(item.id)
    }));
  }, [activities, readNotificationIds, tasks]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed:", err.message);
    }
  };

  const markAllRead = () => {
    setReadNotificationIds(notifications.map(n => n.id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="h-16 px-6 glass-panel border-b border-white/5 flex items-center justify-between sticky top-0 z-30 text-brand-text">
      {/* Search Bar */}
      <div className="relative w-full max-w-md hidden sm:block">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-sm"
          placeholder="Quick search tasks by name, assignee, or tags..."
        />
      </div>
      <div className="sm:hidden w-10 h-10" /> {/* Spacer for mobile logo overlap */}

      {/* Action Icons */}
      <div className="flex items-center gap-4">
        {/* Theme Selector Trigger */}
        <div className="relative">
          <button
            onClick={() => {
              setThemeDropdownOpen(!themeDropdownOpen);
              setProfileDropdownOpen(false);
              setNotifOpen(false);
            }}
            className="p-2 rounded-xl hover:bg-white/5 text-white/70 hover:text-white transition-colors border border-white/5"
            title="Switch Theme"
          >
            {theme === "light" && <Sun className="w-5 h-5 text-amber-400" />}
            {theme === "dark" && <Moon className="w-5 h-5 text-indigo-400" />}
            {theme === "cyberpunk" && <Palette className="w-5 h-5 text-pink-400" />}
          </button>

          {/* Theme Dropdown */}
          {themeDropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 glass-panel rounded-xl border border-white/10 shadow-2xl p-1.5 animate-scale-in">
              <div className="px-2.5 py-1 text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">
                Themes
              </div>
              <button
                onClick={() => {
                  toggleTheme("dark");
                  setThemeDropdownOpen(false);
                }}
                className={`flex items-center gap-2.5 w-full px-2.5 py-2 text-sm rounded-lg hover:bg-white/5 transition-colors ${
                  theme === "dark" ? "text-indigo-400 bg-white/5 font-semibold" : "text-white/70"
                }`}
              >
                <Moon className="w-4 h-4" />
                Dark Mode
              </button>
              <button
                onClick={() => {
                  toggleTheme("light");
                  setThemeDropdownOpen(false);
                }}
                className={`flex items-center gap-2.5 w-full px-2.5 py-2 text-sm rounded-lg hover:bg-white/5 transition-colors ${
                  theme === "light" ? "text-amber-500 bg-white/5 font-semibold" : "text-white/70"
                }`}
              >
                <Sun className="w-4 h-4" />
                Light Mode
              </button>
              <button
                onClick={() => {
                  toggleTheme("cyberpunk");
                  setThemeDropdownOpen(false);
                }}
                className={`flex items-center gap-2.5 w-full px-2.5 py-2 text-sm rounded-lg hover:bg-white/5 transition-colors ${
                  theme === "cyberpunk" ? "text-pink-400 bg-white/5 font-semibold" : "text-white/70"
                }`}
              >
                <Palette className="w-4 h-4" />
                Cyberpunk
              </button>
            </div>
          )}
        </div>

        {/* Notifications Icon */}
        <div className="relative">
          <button
            onClick={() => {
              setNotifOpen(!notifOpen);
              setProfileDropdownOpen(false);
              setThemeDropdownOpen(false);
            }}
            className="p-2 rounded-xl hover:bg-white/5 text-white/70 hover:text-white transition-colors relative border border-white/5"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-danger text-[9px] font-bold text-white flex items-center justify-center rounded-full animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 glass-panel rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-scale-in">
              <div className="flex justify-between items-center px-4 py-3 border-b border-white/5 bg-white/5">
                <span className="font-semibold text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllRead} 
                    className="text-xs text-brand-primary hover:underline font-medium"
                  >
                    Mark read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-white/5">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-white/40">
                    No new alerts
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`px-4 py-3 flex gap-3 items-start transition-colors ${
                        notif.read ? "opacity-60" : "bg-brand-primary/5"
                      }`}
                    >
                      <div className="mt-0.5">
                        {notif.type === "urgent" ? (
                          <Clock className="w-4 h-4 text-brand-danger" />
                        ) : notif.type === "project" ? (
                          <Plus className="w-4 h-4 text-brand-accent" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-brand-success" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold">{notif.title}</div>
                        <div className="text-[11px] text-white/60 mt-0.5">{notif.desc}</div>
                        <div className="text-[9px] text-white/40 mt-1">{notif.time}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileDropdownOpen(!profileDropdownOpen);
              setThemeDropdownOpen(false);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-white/5 transition-colors border border-white/5"
          >
            <div className="w-7 h-7 rounded-full bg-brand-gradient flex items-center justify-center text-xs font-bold text-white shadow-md">
              {(currentUser?.displayName || currentUser?.email || "U").charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-medium max-w-[100px] truncate hidden md:inline">
              {currentUser?.displayName || currentUser?.email || "User"}
            </span>
          </button>

          {/* Profile Dropdown */}
          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 glass-panel rounded-xl border border-white/10 shadow-2xl p-1.5 animate-scale-in">
              <div className="px-2.5 py-1.5 border-b border-white/5 mb-1">
                <div className="text-xs font-bold truncate">
                  {currentUser?.displayName || "FlowSync Member"}
                </div>
                <div className="text-[10px] text-white/40 truncate mt-0.5">
                  {currentUser?.email}
                </div>
              </div>
              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  // Quick page redirect to settings
                  window.dispatchEvent(new CustomEvent("route-tab", { detail: "settings" }));
                }}
                className="flex items-center gap-2.5 w-full px-2.5 py-2 text-xs rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors"
              >
                <User className="w-4 h-4 text-white/60" />
                Profile Settings
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 w-full px-2.5 py-2 text-xs rounded-lg text-brand-danger hover:bg-brand-danger/10 transition-colors mt-0.5"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
