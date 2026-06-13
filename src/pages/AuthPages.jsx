import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Sparkles, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  ArrowLeft,
  Eye, 
  EyeOff,
  Github,
  Chrome,
  AlertCircle,
  Check
} from "lucide-react";

export const AuthPages = ({ defaultTab = "login", onAuthSuccess, onBackToLanding }) => {
  const { login, register, loginWithGoogle } = useAuth();
  
  const [tab, setTab] = useState(defaultTab); // "login" | "register"
  const [step, setStep] = useState(1); // Multi-step signup
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: "Empty", color: "bg-white/10" };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 20, label: "Weak", color: "bg-red-500" };
    if (score <= 3) return { score: 60, label: "Medium", color: "bg-amber-500" };
    return { score: 100, label: "Strong", color: "bg-emerald-500" };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (tab === "login") {
      try {
        await login(email, password);
        onAuthSuccess();
      } catch (err) {
        setError(err.message || "Failed to log in.");
      } finally {
        setLoading(false);
      }
    } else {
      // If register step 1, advance to step 2
      if (step === 1) {
        if (password.length < 6) {
          setError("Password must be at least 6 characters.");
          setLoading(false);
          return;
        }
        setStep(2);
        setLoading(false);
        return;
      }

      // Step 2 submit
      try {
        await register(email, password, displayName || email.split("@")[0]);
        onAuthSuccess();
      } catch (err) {
        setError(err.message || "Failed to register.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#0F172A] text-[#F8FAFC] flex overflow-hidden font-sans">
      {/* Left Column: Premium SaaS Intro Panel (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 bg-[#0E1527] relative items-center justify-center p-12 border-r border-white/5">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#6366F1]/10 via-purple-500/5 to-cyan-500/10 pointer-events-none" />
        
        {/* Animated Blob */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none animate-blob" />
        
        <div className="max-w-md relative text-center flex flex-col items-center">
          <button 
            onClick={onBackToLanding}
            className="absolute top-[-100px] left-0 flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to home
          </button>

          <div className="w-16 h-16 rounded-2xl bg-brand-gradient flex items-center justify-center text-white shadow-2xl mb-8">
            <Sparkles className="w-8 h-8" />
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
            FlowSync AI Workspace
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-8">
            Connect your team with real-time project boards, task comments, progress timelines, and visual charts. All optimized for speed and fluidity.
          </p>

          {/* Graphical features check */}
          <div className="space-y-3.5 text-left w-full max-w-sm px-6 py-5 rounded-[20px] bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Check className="w-3 h-3" />
              </div>
              <span className="text-xs font-semibold text-[#F8FAFC]/90">Cloud Sync & Local Fallback</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Check className="w-3 h-3" />
              </div>
              <span className="text-xs font-semibold text-[#F8FAFC]/90">Kanban Drag & Drop Board</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                <Check className="w-3 h-3" />
              </div>
              <span className="text-xs font-semibold text-[#F8FAFC]/90">Interactive Workspace Calendar</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Glassmorphism Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
        {/* Mobile top navigation link */}
        <button 
          onClick={onBackToLanding}
          className="absolute top-6 left-6 flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors lg:hidden"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Home
        </button>

        {/* Floating Accent Blobs */}
        <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-cyan-500/5 blur-[90px] pointer-events-none -z-10" />

        <div className="w-full max-w-md p-8 glass-panel rounded-[24px] shadow-2xl border border-white/10 relative">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold tracking-tight">
              {tab === "login" ? "Sign in to Workspace" : "Create Developer Space"}
            </h3>
            <p className="text-xs text-slate-400 mt-2">
              {tab === "login" 
                ? "Welcome back! Please enter your workspace keys." 
                : step === 1 
                  ? "Step 1: Set up authentication credentials." 
                  : "Step 2: Add your profile identifier."
              }
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-2.5 items-center text-xs text-red-400 mb-6">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {tab === "login" ? (
              // LOGIN FORM
              <>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-semibold text-white/50 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
                      placeholder="name@company.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-semibold text-white/50 uppercase tracking-wider">Password</label>
                    <button
                      type="button"
                      onClick={() => setError("Password reset is available after connecting Firebase email templates.")}
                      className="text-[10px] text-brand-primary hover:underline"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl glass-input text-sm"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/35 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              // REGISTER FORM (Multi-step)
              <>
                {step === 1 ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-semibold text-white/50 uppercase tracking-wider">Email Address</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
                          placeholder="name@company.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-semibold text-white/50 uppercase tracking-wider">Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input 
                          type={showPassword ? "text" : "password"} 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl glass-input text-sm"
                          placeholder="Create secure password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/35 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      
                      {/* Password strength progress */}
                      {password && (
                        <div className="pt-2">
                          <div className="flex justify-between items-center text-[10px] mb-1">
                            <span className="text-white/40">Strength:</span>
                            <span className="font-bold uppercase" style={{ color: strength.color.replace('bg-', 'text-') }}>
                              {strength.label}
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${strength.color} transition-all duration-300`} 
                              style={{ width: `${strength.score}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-semibold text-white/50 uppercase tracking-wider">Display Name</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input 
                          type="text" 
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
                          placeholder="e.g., Sarah Connor"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Form submission button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-brand-gradient text-white font-bold text-sm hover:opacity-90 shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-2 mt-4 disabled:opacity-50 transition-opacity"
            >
              {loading ? (
                <span>Securing workspace...</span>
              ) : tab === "login" ? (
                <>
                  Connect Workspace
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : step === 1 ? (
                <>
                  Continue to Name
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Finalize Setup
                  <Check className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Multi-step back button for signup */}
          {tab === "register" && step === 2 && (
            <button 
              onClick={() => setStep(1)} 
              className="w-full text-center text-xs text-white/40 hover:text-white mt-4 block"
            >
              Back to step 1
            </button>
          )}

          {/* Social login grid */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px bg-white/5 flex-1" />
            <span className="text-[10px] text-white/35 font-bold uppercase tracking-wider">Or continue with</span>
            <div className="h-px bg-white/5 flex-1" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              type="button"
              onClick={async () => {
                setError("");
                setLoading(true);
                try {
                  await loginWithGoogle();
                  onAuthSuccess();
                } catch (err) {
                  setError(err.message || "Google sign-in failed.");
                } finally {
                  setLoading(false);
                }
              }}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-xs font-semibold transition-colors"
            >
              <Chrome className="w-4 h-4" /> Google
            </button>
            <button 
              type="button"
              onClick={() => {
                setError("GitHub sign-in requires OAuth configuration in Firebase console.");
              }}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-xs font-semibold transition-colors"
            >
              <Github className="w-4 h-4" /> Github
            </button>
          </div>

          {/* Footer toggle tab */}
          <div className="mt-8 text-center text-xs text-white/50">
            {tab === "login" ? (
              <span>
                Don't have an account?{" "}
                <button 
                  onClick={() => {
                    setTab("register");
                    setStep(1);
                    setError("");
                  }} 
                  className="text-brand-primary hover:underline font-bold"
                >
                  Sign Up
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{" "}
                <button 
                  onClick={() => {
                    setTab("login");
                    setError("");
                  }} 
                  className="text-brand-primary hover:underline font-bold"
                >
                  Log In
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
