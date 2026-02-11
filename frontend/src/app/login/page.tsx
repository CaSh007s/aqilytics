"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { login, signup, getSession } from "@/services/auth";
import {
  Loader2,
  ArrowRight,
  Mail,
  Lock,
  User,
  AlertCircle,
} from "lucide-react"; // Assuming Chrome icon is available or use a generic one/svg
import AtmosphericBackground from "@/components/dashboard/AtmosphericBackground";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); // Only for signup

  // Check if already logged in
  useEffect(() => {
    getSession().then((user) => {
      if (user) router.push(redirectPath);
    });
  }, [router, redirectPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "login") {
        // Mock admin if specific email
        const loginUsername =
          email === "admin@aqilytics.com" ? "admin" : username || email;
        await login(loginUsername, password);
      } else {
        await signup(username, email, password);
      }
      router.push(redirectPath);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(mode === "login" ? "Invalid credentials" : "Signup failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative flex items-center justify-center bg-slate-950 font-sans overflow-hidden">
      <AtmosphericBackground />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md p-1"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            className="text-4xl font-thin tracking-[0.2em] text-white uppercase mb-4"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Aqilytics
          </motion.h1>
          <motion.p
            className="text-slate-400 text-sm tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Atmospheric Intelligence Platform
          </motion.p>
        </div>

        {/* Card Container */}
        <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl shadow-sky-900/20 overflow-hidden">
          {/* Toggle Switch */}
          <div className="flex p-2 gap-2 bg-slate-950/30">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError(null);
                }}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative ${
                  mode === m
                    ? "text-white"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {mode === m && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-slate-800/80 rounded-xl shadow-inner border border-white/5"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 uppercase tracking-wider">
                  {m === "login" ? "Login" : "Sign Up"}
                </span>
              </button>
            ))}
          </div>

          <div className="p-8 pt-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400 text-sm overflow-hidden"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="popLayout">
                {mode === "signup" && (
                  <motion.div
                    key="username"
                    initial={{ opacity: 0, y: -20, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -20, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                        Username
                      </label>
                      <div className="relative group">
                        <User className="absolute left-4 top-3.5 w-4 h-4 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-slate-200 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all placeholder:text-slate-700 sm:text-sm"
                          placeholder="CreatorID"
                          required={mode === "signup"}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                  Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
                  <input
                    type="text" // using text to allow username login for admin
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-slate-200 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all placeholder:text-slate-700 sm:text-sm"
                    placeholder={
                      mode === "login"
                        ? "username or email"
                        : "name@example.com"
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-slate-200 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all placeholder:text-slate-700 sm:text-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full group relative overflow-hidden rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium py-3.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-sky-900/20 mt-2"
              >
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="flex items-center justify-center gap-2 relative z-10">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      {mode === "login" ? "Access Dashboard" : "Create Account"}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </button>
            </form>

            <div className="mt-8 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0f172a] px-4 text-slate-500 tracking-wider">
                  Or continue with
                </span>
                {/* Hack: Hardcoded hex color to match slate-900/60 approximation or transparent if possible. 
                             Better: use the actual background color or transparent. 
                             Trying transparent with some padding might be weird. 
                             Let's use a blurred span or just transparent if the line is subtle. 
                             Actually, since the bg is blur, we can't easily match.
                             Let's just make the text background transparent and not strike through the text? 
                             No, standard pattern. 
                             Let's just use the slate-900 approx.
                         */}
              </div>
            </div>

            <button
              type="button"
              disabled // Placeholder functionality
              className="w-full mt-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 text-slate-300 text-sm font-medium transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* Simple Google G icon SVG */}
              <svg
                className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z"
                  fill="#4285F4"
                />
                <path
                  d="M12.24 24.0008C15.4765 24.0008 18.2058 22.9382 20.1899 21.1039L16.3229 18.1056C15.2425 18.8284 13.8587 19.2612 12.2399 19.2612C9.11379 19.2612 6.45942 17.1534 5.51333 14.3079H1.51651V17.4076C3.48655 21.3255 7.54013 24.0008 12.24 24.0008Z"
                  fill="#34A853"
                />
                <path
                  d="M5.51336 14.3079C5.03434 12.8724 5.03434 11.1276 5.51336 9.69208V6.5918H1.51654C-0.124699 9.85289 -0.124699 13.7381 1.51654 16.9992L5.51336 14.3079Z"
                  fill="#FBBC05"
                />
                <path
                  d="M12.24 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.034466 12.24 0.000808666C7.54013 0.000808666 3.48655 2.67608 1.51651 6.5918L5.51333 9.69208C6.45398 6.84074 9.10915 4.74966 12.24 4.74966Z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-slate-600">
            Authorized Personnel Only • Secure Connection
          </p>
        </div>
      </motion.div>
    </main>
  );
}
