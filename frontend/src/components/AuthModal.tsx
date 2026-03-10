"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff, Mail, Lock, User, ArrowRight, UserPlus, Shield, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type AuthMode = "login" | "signup";

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [mode, setMode] = useState<AuthMode>("login");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Login fields
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Signup fields
    const [signupName, setSignupName] = useState("");
    const [signupEmail, setSignupEmail] = useState("");
    const [signupPassword, setSignupPassword] = useState("");
    const [signupRole, setSignupRole] = useState("Admin");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            const data = await api.login({ email, password });
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            window.location.href = "/dashboard";
        } catch (err: any) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            const data = await api.signup({
                name: signupName,
                email: signupEmail,
                password: signupPassword,
                role: signupRole,
            });
            // Auto login after signup
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            window.location.href = "/dashboard";
        } catch (err: any) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        background: "#f9fafb",
        border: "1px solid #e5e7eb",
        color: "#111827",
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        e.target.style.borderColor = "#ee2a7b";
        e.target.style.boxShadow = "0 0 0 3px rgba(238, 42, 123, 0.1)";
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        e.target.style.borderColor = "#e5e7eb";
        e.target.style.boxShadow = "none";
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[100]"
                        style={{ background: "rgba(0, 0, 0, 0.4)", backdropFilter: "blur(4px)" }}
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.3, type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed inset-0 z-[101] flex items-center justify-center p-4"
                    >
                        <div
                            className="relative w-full max-w-[440px] rounded-2xl p-6 md:p-8"
                            style={{
                                background: "white",
                                border: "1px solid #e5e7eb",
                                boxShadow: "0 25px 60px rgba(238, 42, 123, 0.12), 0 4px 20px rgba(0, 0, 0, 0.06)",
                                fontFamily: "var(--font-geist-sans)"
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors"
                                style={{ color: "#9ca3af" }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = "#111827"; e.currentTarget.style.background = "#f3f4f6"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = "#9ca3af"; e.currentTarget.style.background = "transparent"; }}
                            >
                                <X size={18} />
                            </button>

                            {/* Brand */}
                            <div className="text-center mb-5">
                                <h2 className="text-xl font-black tracking-tight" style={{ color: "#111827" }}>
                                    {mode === "login" ? "Welcome back" : "Create Account"}
                                </h2>
                                <p className="text-[11px] mt-0.5 font-medium" style={{ color: "#6b7280" }}>
                                    {mode === "login"
                                        ? "Sign in to your dashboard"
                                        : "Start your 14-day free trial today"}
                                </p>
                            </div>

                            {/* Toggle */}
                            <div
                                className="flex mb-4 rounded-xl p-1"
                                style={{ background: "#f3f4f6" }}
                            >
                                <button
                                    onClick={() => setMode("login")}
                                    className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
                                    style={{
                                        background: mode === "login" ? "linear-gradient(135deg, #f9ce34, #ee2a7b, #6228d7)" : "transparent",
                                        color: mode === "login" ? "white" : "#9ca3af",
                                        boxShadow: mode === "login" ? "0 2px 8px rgba(238,42,123,0.3)" : "none",
                                    }}
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => setMode("signup")}
                                    className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
                                    style={{
                                        background: mode === "signup" ? "linear-gradient(135deg, #f9ce34, #ee2a7b, #6228d7)" : "transparent",
                                        color: mode === "signup" ? "white" : "#9ca3af",
                                        boxShadow: mode === "signup" ? "0 2px 8px rgba(238,42,123,0.3)" : "none",
                                    }}
                                >
                                    Sign Up
                                </button>
                            </div>

                            {/* Social Auth */}
                            <div className="mb-4">
                                <button
                                    type="button"
                                    className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 flex items-center justify-center gap-3 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98] shadow-sm"
                                >
                                    <svg width="16" height="16" viewBox="0 0 18 18">
                                        <path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.49h4.84c-.21 1.12-.84 2.07-1.79 2.7l2.85 2.21c1.67-1.53 2.64-3.79 2.64-6.56z" />
                                        <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.85-2.21c-.79.53-1.8.84-3.11.84-2.39 0-4.41-1.61-5.13-3.77L.95 13.51C2.42 16.18 5.48 18 9 18z" />
                                        <path fill="#FBBC05" d="M3.87 10.68c-.18-.53-.28-1.1-.28-1.68s.1-1.15.28-1.68L.95 4.81C.34 6.07 0 7.49 0 9s.34 2.93.95 4.19l2.92-2.51z" />
                                        <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.89 11.43 0 9 0 5.48 0 2.42 1.82.95 4.49L3.87 7c.72-2.16 2.74-3.77 5.13-3.77z" />
                                    </svg>
                                    {mode === "login" ? "Sign in with Google" : "Sign up with Google"}
                                </button>

                                <div className="relative my-4">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-slate-100"></div>
                                    </div>
                                    <div className="relative flex justify-center">
                                        <span className="bg-white px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">or use email</span>
                                    </div>
                                </div>
                            </div>

                            {/* ============ LOGIN ============ */}
                            {mode === "login" && (
                                <motion.form
                                    key="login"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.2 }}
                                    onSubmit={handleLogin}
                                    className="space-y-4"
                                >
                                    {error && (
                                        <div className="p-3 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2 text-red-600 text-xs font-medium">
                                            <AlertCircle size={14} />
                                            {error}
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-xs font-medium mb-1.5" style={{ color: "#4b5563" }}>
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }} />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="your@email.com"
                                                className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                                                style={inputStyle}
                                                onFocus={handleFocus}
                                                onBlur={handleBlur}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium mb-1.5" style={{ color: "#4b5563" }}>
                                            Password
                                        </label>
                                        <div className="relative">
                                            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }} />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Enter your password"
                                                className="w-full pl-11 pr-11 py-3 rounded-xl text-sm outline-none transition-all"
                                                style={inputStyle}
                                                onFocus={handleFocus}
                                                onBlur={handleBlur}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2"
                                                style={{ color: "#9ca3af" }}
                                            >
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" className="w-4 h-4 rounded" style={{ accentColor: "#ee2a7b" }} />
                                            <span className="text-xs" style={{ color: "#6b7280" }}>Remember me</span>
                                        </label>
                                        <a href="#" className="text-xs font-medium" style={{ color: "#ee2a7b" }}>Forgot password?</a>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
                                        style={{
                                            background: "linear-gradient(135deg, #f9ce34, #ee2a7b, #6228d7)",
                                            boxShadow: "0 4px 14px rgba(238, 42, 123, 0.3)",
                                            opacity: isLoading ? 0.7 : 1,
                                        }}
                                    >
                                        {isLoading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" style={{ animation: "spin 0.7s linear infinite" }} />
                                        ) : (
                                            <>
                                                Sign In
                                                <ArrowRight size={16} />
                                            </>
                                        )}
                                    </button>
                                </motion.form>
                            )}

                            {/* ============ SIGNUP ============ */}
                            {mode === "signup" && (
                                <motion.form
                                    key="signup"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.2 }}
                                    onSubmit={handleSignup}
                                    className="space-y-3"
                                >
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: "#4b5563" }}>
                                                Name
                                            </label>
                                            <div className="relative">
                                                <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }} />
                                                <input
                                                    type="text"
                                                    value={signupName}
                                                    onChange={(e) => setSignupName(e.target.value)}
                                                    placeholder="Full Name"
                                                    className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs outline-none transition-all"
                                                    style={inputStyle}
                                                    onFocus={handleFocus}
                                                    onBlur={handleBlur}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: "#4b5563" }}>
                                                Email
                                            </label>
                                            <div className="relative">
                                                <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }} />
                                                <input
                                                    type="email"
                                                    value={signupEmail}
                                                    onChange={(e) => setSignupEmail(e.target.value)}
                                                    placeholder="Email"
                                                    className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs outline-none transition-all"
                                                    style={inputStyle}
                                                    onFocus={handleFocus}
                                                    onBlur={handleBlur}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: "#4b5563" }}>
                                                Password
                                            </label>
                                            <div className="relative">
                                                <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }} />
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    value={signupPassword}
                                                    onChange={(e) => setSignupPassword(e.target.value)}
                                                    placeholder="Secret"
                                                    className="w-full pl-9 pr-9 py-2.5 rounded-xl text-xs outline-none transition-all"
                                                    style={inputStyle}
                                                    onFocus={handleFocus}
                                                    onBlur={handleBlur}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-2.5 top-1/2 -translate-y-1/2"
                                                    style={{ color: "#9ca3af" }}
                                                >
                                                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: "#4b5563" }}>
                                                Role
                                            </label>
                                            <select
                                                value={signupRole}
                                                onChange={(e) => setSignupRole(e.target.value)}
                                                className="w-full px-3 py-2.5 rounded-xl text-xs outline-none transition-all appearance-none cursor-pointer"
                                                style={{
                                                    background: "#f9fafb",
                                                    border: "1px solid #e5e7eb",
                                                    color: "#111827",
                                                }}
                                                onFocus={handleFocus}
                                                onBlur={handleBlur}
                                            >
                                                <option value="Staff">Staff</option>
                                                <option value="Manager">Manager</option>
                                                <option value="Admin">Admin</option>
                                            </select>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-3 mt-2 rounded-xl text-xs font-black uppercase tracking-widest text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
                                        style={{
                                            background: "linear-gradient(135deg, #f9ce34, #ee2a7b, #6228d7)",
                                            boxShadow: "0 4px 14px rgba(238, 42, 123, 0.3)",
                                            opacity: isLoading ? 0.7 : 1,
                                        }}
                                    >
                                        {isLoading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" style={{ animation: "spin 0.7s linear infinite" }} />
                                        ) : (
                                            <>
                                                Sign Up
                                                <UserPlus size={14} />
                                            </>
                                        )}
                                    </button>
                                </motion.form>
                            )}

                            {/* Footer */}
                            <div className="mt-6 pt-5 border-t border-slate-50 text-center">
                                <p className="text-[11px] font-medium text-slate-500">
                                    {mode === "login" ? (
                                        <>
                                            Don't have an account?{" "}
                                            <button
                                                onClick={() => setMode("signup")}
                                                className="text-[#ee2a7b] font-bold hover:underline"
                                            >
                                                Sign up
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            Already have an account?{" "}
                                            <button
                                                onClick={() => setMode("login")}
                                                className="text-[#ee2a7b] font-bold hover:underline"
                                            >
                                                Log in
                                            </button>
                                        </>
                                    )}
                                </p>
                            </div>

                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
