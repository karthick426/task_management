import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { GlassCard } from "../components/GlassCard";
import { 
  User, 
  Database, 
  Palette, 
  Bell, 
  Lock, 
  Sparkles, 
  Check, 
  AlertCircle,
  Eye,
  EyeOff
} from "lucide-react";

export const SettingsView = () => {
  const { currentUser, updateProfile, updatePassword } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Profile forms
  const [dispName, setDispName] = useState(currentUser?.displayName || "");
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Password forms
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [passSuccess, setPassSuccess] = useState(false);
  const [passError, setPassError] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Firebase configurations
  const [apiKey, setApiKey] = useState(localStorage.getItem("fs_api_key") || "");
  const [projectId, setProjectId] = useState(localStorage.getItem("fs_project_id") || "");
  const [dbSuccess, setDbSuccess] = useState(false);

  // Preference switches
  const [notifSound, setNotifSound] = useState(() => localStorage.getItem("fs_pref_sound") !== "false");
  const [notifAssign, setNotifAssign] = useState(() => localStorage.getItem("fs_pref_assign") !== "false");

  useEffect(() => {
    localStorage.setItem("fs_pref_sound", String(notifSound));
    localStorage.setItem("fs_pref_assign", String(notifAssign));
  }, [notifAssign, notifSound]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileError("");
    try {
      await updateProfile({ displayName: dispName.trim() || currentUser?.email });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      setProfileError(err.message || "Could not update profile.");
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!oldPass || !newPass) return;
    setPassError("");
    try {
      await updatePassword({ oldPassword: oldPass, newPassword: newPass });
      setPassSuccess(true);
      setOldPass("");
      setNewPass("");
      setTimeout(() => setPassSuccess(false), 3000);
    } catch (err) {
      setPassError(err.message || "Could not update password.");
    }
  };

  const handleConnectFirebase = (e) => {
    e.preventDefault();
    if (apiKey && projectId) {
      localStorage.setItem("fs_api_key", apiKey);
      localStorage.setItem("fs_project_id", projectId);
      setDbSuccess(true);
      setTimeout(() => {
        setDbSuccess(false);
        // Reload page to re-initialize firebase config from localstorage
        window.location.reload();
      }, 1500);
    }
  };

  const handleClearDbConfig = () => {
    localStorage.removeItem("fs_api_key");
    localStorage.removeItem("fs_project_id");
    setApiKey("");
    setProjectId("");
    window.location.reload();
  };

  return (
    <div className="space-y-8 text-brand-text max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight">Workspace Settings</h2>
        <p className="text-xs text-white/50 mt-1">Configure profile metrics, storage database options, and visual interface themes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Left column navigation anchors */}
        <div className="md:col-span-1 space-y-2.5">
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center font-bold text-white text-sm">
              {(currentUser?.displayName || currentUser?.email || "U").charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-xs font-bold truncate max-w-[150px]">
                {currentUser?.displayName || "FlowSync Member"}
              </div>
              <div className="text-[10px] text-white/40 truncate max-w-[150px]">
                {currentUser?.email}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-[10px] text-indigo-300 leading-relaxed flex gap-2.5 items-start">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-indigo-400" />
            <span>Switch UI themes in the panel below to activate custom CSS variables matching Dark, Light, or Cyberpunk styles.</span>
          </div>
        </div>

        {/* Right column forms */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Profile form */}
          <GlassCard>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-white/40 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-primary" />
              Profile settings
            </h3>

            {profileSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2 mb-4">
                <Check className="w-4 h-4" /> Profile credentials updated.
              </div>
            )}
            {profileError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4" /> {profileError}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2">Display Name</label>
                <input
                  type="text"
                  value={dispName}
                  onChange={(e) => setDispName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                  placeholder="e.g. Sarah Connor"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2">Email Address (Read-only)</label>
                <input
                  type="text"
                  value={currentUser?.email || ""}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs opacity-50 cursor-not-allowed"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#6366F1] text-xs font-bold text-white hover:bg-[#6366F1]/90 shadow-md"
              >
                Save Profile
              </button>
            </form>
          </GlassCard>

          {/* Database setup */}
          <GlassCard>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-white/40 mb-2 flex items-center gap-2">
              <Database className="w-4 h-4 text-brand-accent" />
              Database Provider
            </h3>
            <p className="text-[10px] text-white/40 mb-4">Configure Firebase credentials to transition workspace data to Firestore cloud.</p>

            {dbSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2 mb-4 animate-pulse">
                <Check className="w-4 h-4" /> Credentials saved. Refreshing workspace...
              </div>
            )}

            <form onSubmit={handleConnectFirebase} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider">Firebase API Key</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                    placeholder="AIzaSy..."
                    required={!!projectId}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider">Firebase Project ID</label>
                  <input
                    type="text"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                    placeholder="flowsync-ai-12345"
                    required={!!apiKey}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={!apiKey || !projectId}
                  className="px-5 py-2.5 rounded-xl bg-brand-gradient text-xs font-bold text-white hover:opacity-90 shadow-md disabled:opacity-40"
                >
                  Connect Cloud Firestore
                </button>
                {(localStorage.getItem("fs_api_key")) && (
                  <button
                    type="button"
                    onClick={handleClearDbConfig}
                    className="px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-400 hover:bg-red-500/20"
                  >
                    Disconnect Cloud
                  </button>
                )}
              </div>
            </form>
          </GlassCard>

          {/* Theme customizer */}
          <GlassCard>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-white/40 mb-4 flex items-center gap-2">
              <Palette className="w-4 h-4 text-brand-secondary" />
              Theme customizer
            </h3>
            
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => toggleTheme("dark")}
                className={`py-4 rounded-xl border flex flex-col items-center gap-2 text-xs font-bold transition-all ${
                  theme === "dark" 
                    ? "border-brand-primary bg-brand-primary/10 shadow-lg text-white" 
                    : "border-white/5 bg-white/5 text-white/60 hover:text-white"
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-slate-900 border border-white/10" />
                Dark Slate
              </button>
              <button
                type="button"
                onClick={() => toggleTheme("light")}
                className={`py-4 rounded-xl border flex flex-col items-center gap-2 text-xs font-bold transition-all ${
                  theme === "light" 
                    ? "border-indigo-600 bg-indigo-500/10 shadow-lg text-indigo-700 font-extrabold" 
                    : "border-white/5 bg-white/5 text-white/60 hover:text-white"
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-200" />
                Light Minimal
              </button>
              <button
                type="button"
                onClick={() => toggleTheme("cyberpunk")}
                className={`py-4 rounded-xl border flex flex-col items-center gap-2 text-xs font-bold transition-all ${
                  theme === "cyberpunk" 
                    ? "border-pink-500 bg-pink-500/10 shadow-lg text-pink-400" 
                    : "border-white/5 bg-white/5 text-white/60 hover:text-white"
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-purple-950 border border-pink-500/30" />
                Cyberpunk Pink
              </button>
            </div>
          </GlassCard>

          {/* Notification toggles */}
          <GlassCard>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-white/40 mb-4 flex items-center gap-2">
              <Palette className="w-4 h-4 text-emerald-400" />
              Workspace Preferences
            </h3>
            
            <div className="space-y-4 text-xs font-bold">
              <div className="flex items-center justify-between">
                <div>
                  <div>Sound notifications</div>
                  <div className="text-[10px] text-white/40 mt-0.5 font-normal">Play alert sounds on high priority deadlines.</div>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifSound(!notifSound)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${notifSound ? "bg-brand-primary" : "bg-white/10"}`}
                >
                  <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${notifSound ? "left-6" : "left-1"}`} />
                </button>
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <div>
                  <div>Assignee updates</div>
                  <div className="text-[10px] text-white/40 mt-0.5 font-normal">Send notification bubble when task assignee shifts.</div>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifAssign(!notifAssign)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${notifAssign ? "bg-brand-primary" : "bg-white/10"}`}
                >
                  <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${notifAssign ? "left-6" : "left-1"}`} />
                </button>
              </div>
            </div>
          </GlassCard>

          {/* Security forms */}
          <GlassCard>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-white/40 mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-brand-primary" />
              Workspace Security
            </h3>

            {passSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2 mb-4">
                <Check className="w-4 h-4" /> Password reset successful.
              </div>
            )}
            {passError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4" /> {passError}
              </div>
            )}

            <form onSubmit={handleSavePassword} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2">Current Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={oldPass}
                    onChange={(e) => setOldPass(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/35 hover:text-white"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2">New Password</label>
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                  placeholder="Min 6 characters"
                />
              </div>

              <button
                type="submit"
                disabled={!oldPass || !newPass}
                className="px-5 py-2.5 rounded-xl bg-[#6366F1] text-xs font-bold text-white hover:bg-[#6366F1]/90 shadow-md disabled:opacity-40"
              >
                Change Password
              </button>
            </form>
          </GlassCard>

        </div>

      </div>
    </div>
  );
};
