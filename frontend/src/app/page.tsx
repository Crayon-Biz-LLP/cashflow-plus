"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/Logo";
import AuthModal from "@/components/AuthModal";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Shield,
  TrendingUp,
  Briefcase,
  Receipt,
  Zap,
  CheckCircle2,
  ChevronRight,
  Activity,
  Sparkles,
  MousePointer2,
  Twitter,
  Linkedin,
  LifeBuoy
} from "lucide-react";

/* ─────────────────── ANIMATION VARIANTS ─────────────────── */
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  } as any,
};

const floating = {
  animate: {
    y: [0, -15, 0],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  } as any
};

const paperTurn = {
  hidden: {
    opacity: 0,
    rotateY: -90,
    perspective: 1000,
    transformOrigin: "left center"
  },
  visible: {
    opacity: 1,
    rotateY: 0,
    transition: {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
      opacity: { duration: 0.6 }
    }
  }
} as any;

/* ─────────────────── LANDING PAGE ─────────────────── */
export default function LandingPage() {
  const [authOpen, setAuthOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);

  const rotatingWords = ["Profitability", "Liquidity", "Efficiency", "Growth"];

  useEffect(() => {
    const timer = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen antigravity-mesh text-slate-900 selection:bg-teal-500/30 overflow-x-hidden">
      {/* ============ NAVIGATION ============ */}
      <nav
        className="fixed top-0 left-0 right-0 z-[100] transition-all duration-500"
        style={{
          background: scrolled ? "rgba(255, 255, 255, 0.8)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(0, 0, 0, 0.05)" : "1px solid transparent",
          padding: scrolled ? "0.75rem 0" : "1.25rem 0",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex items-center justify-between">
          <Logo size={32} showText={true} textColor="#0f172a" />

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            {["Features", "About", "Discover"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 hover:text-teal-600 transition-colors"
                style={{ fontFamily: "var(--font-geist-sans)" }}
              >
                {item}
              </a>
            ))}
            <button
              onClick={() => setAuthOpen(true)}
              className="group relative px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest overflow-hidden transition-all hover:scale-105 active:scale-95 text-white"
            >
              <div className="absolute inset-0 bg-teal-600 group-hover:bg-teal-500 transition-colors" />
              <span className="relative z-10 flex items-center gap-2">
                Get Started <ArrowRight size={12} />
              </span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-slate-500 hover:text-slate-900 transition-colors font-black text-[10px]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? "CLOSE" : "MENU"}
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white/95 backdrop-blur-xl border-b border-black/5 overflow-hidden"
            >
              <div className="px-8 py-10 flex flex-col gap-6">
                {["Features", "About", "Discover"].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-bold text-slate-900 hover:text-teal-600 transition-colors py-3"
                    style={{ fontFamily: "var(--font-geist-sans)" }}
                  >
                    {item}
                  </a>
                ))}
                <button
                  onClick={() => {
                    setAuthOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-4 bg-teal-600 rounded-2xl font-black uppercase tracking-widest text-xs text-white"
                >
                  Login
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ============ HERO SECTION ============ */}
      <section className="pt-40 md:pt-56 pb-20 md:pb-32 px-6 md:px-8 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] md:w-[800px] h-[300px] md:h-[800px] bg-teal-500/5 rounded-full blur-[80px] md:blur-[120px] pointer-events-none" />

        <motion.div
          className="max-w-6xl mx-auto text-center relative z-10"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            variants={fadeUp}
            className="mb-8 md:mb-10 inline-flex items-center gap-3 px-5 py-2 rounded-full relative group cursor-default"
          >
            {/* Animated Gradient Border Overlay */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-500/20 via-blue-500/20 to-emerald-500/20 blur opacity-50 group-hover:opacity-100 transition duration-1000" />

            {/* Main Glass Body */}
            <div className="absolute inset-0 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_2px_15px_rgba(0,0,0,0.03)]" />

            <div className="relative z-10 flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                <Sparkles size={12} className="text-teal-600" />
              </div>
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.25em] text-teal-700/80 leading-none" style={{ fontFamily: "var(--font-geist-sans)" }}>
                Fueling Innovation for Startups & Purpose-Driven Ventures
              </span>
            </div>
          </motion.div>

          <motion.h1
            variants={paperTurn}
            className="text-4xl md:text-8xl font-black leading-[1.1] mb-6 md:mb-8 tracking-tighter"
          >
            Chart the <span className="relative inline-flex flex-col h-[1.1em] overflow-hidden align-top text-left min-w-[320px] md:min-w-[580px]">
              <AnimatePresence mode="wait">
                <motion.span
                  key={rotatingWords[wordIndex]}
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  exit={{ y: "-100%", opacity: 0 }}
                  transition={{
                    duration: 0.8,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                  className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600"
                >
                  {rotatingWords[wordIndex]}
                </motion.span>
              </AnimatePresence>
            </span> <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-slate-900 to-slate-500">of your Vision.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-base md:text-xl text-slate-500 max-w-3xl mx-auto mb-10 md:mb-12 leading-relaxed font-medium px-4"
          >
            Bridge the gap between billing and actual profit. <br className="hidden md:block" />
            Real-time cashflow intelligence for elite law firms.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mb-16 md:mb-24 px-4 font-black">
            <button
              onClick={() => setAuthOpen(true)}
              className="w-full md:w-auto px-10 py-5 rounded-2xl bg-teal-600 text-white text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg"
            >
              Get Started Now
            </button>
            <button className="w-full md:w-auto px-10 py-5 rounded-2xl glass-card border-black/5 text-sm uppercase tracking-widest hover:bg-black/5 transition-all text-slate-900 font-black">
              Watch Demo
            </button>
          </motion.div>

          {/* ── Dashboard Preview ── */}
          <motion.div
            variants={fadeUp}
            className="relative max-w-5xl mx-auto px-4"
          >
            <motion.div
              variants={floating}
              animate="animate"
              className="glass-card rounded-[24px] md:rounded-[32px] p-1 md:p-2 border-black/[0.03] shadow-2xl"
            >
              <div className="rounded-[20px] md:rounded-[24px] overflow-hidden bg-white border border-black/5">
                <div className="p-4 md:p-8 grid grid-cols-12 gap-4 md:gap-6 min-h-[300px] md:min-h-[500px]">
                  {/* Mock UI elements */}
                  <div className="hidden md:block col-span-3 space-y-4">
                    <div className="h-10 w-full bg-slate-50 rounded-xl flex items-center px-3 border border-slate-100">
                      <div className="w-4 h-4 rounded-full bg-teal-500 mr-2" />
                      <div className="h-2 w-16 bg-slate-200 rounded" />
                    </div>
                    <div className="space-y-2">
                      {["Dashboard", "Cases", "Invoices", "Expenses", "Reports"].map((label, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                          <div className="w-3 h-3 bg-slate-200 rounded" />
                          <div className="h-2 w-12 bg-slate-300 rounded" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-12 md:col-span-9 space-y-4 md:space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                      {[
                        { label: "Revenue", value: "₹24.8L", trend: "+12%" },
                        { label: "Expenses", value: "₹8.2L", trend: "-5%" },
                        { label: "Net Profit", value: "₹16.6L", trend: "+18%" }
                      ].map((stat, i) => (
                        <div key={i} className={`bg-slate-50 rounded-xl md:rounded-2xl border border-black/[0.02] p-3 md:p-4 relative overflow-hidden group ${i === 2 ? 'hidden md:block' : ''}`}>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">{stat.label}</p>
                          <div className="flex items-baseline gap-2">
                            <p className="text-xl font-black text-slate-800">{stat.value}</p>
                            <span className={`text-[8px] font-bold ${stat.trend.startsWith('+') ? 'text-teal-500' : 'text-rose-500'}`}>{stat.trend}</span>
                          </div>
                          <div className="absolute bottom-0 left-0 w-full h-1 bg-teal-500/10" />
                        </div>
                      ))}
                    </div>
                    <div className="h-40 md:h-64 bg-slate-50 rounded-xl md:rounded-[24px] border border-black/[0.02] p-4 md:p-6 relative">
                      <div className="absolute top-4 left-6">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cashflow Trajectory</p>
                        <p className="text-lg font-black text-slate-900 leading-none">Healthy Progression</p>
                      </div>
                      <div className="flex items-end gap-2 md:gap-3 h-full pt-12">
                        {[30, 50, 40, 80, 60, 90, 70, 110, 85, 100].map((h, i) => (
                          <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${h * 0.5}px` }}
                            className="flex-1 bg-gradient-to-t from-teal-500/10 to-teal-500 rounded-t-sm md:rounded-t-lg"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Floating Cards */}
            <div className="hidden lg:block">
              <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 -right-10 glass-card p-6 rounded-3xl border-teal-500/10 shadow-xl z-20"
              >
                <TrendingUp className="text-teal-600 mb-2" size={24} />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Growth</p>
                <p className="text-2xl font-black">+24.8%</p>
              </motion.div>

              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-10 -left-10 glass-card p-6 rounded-3xl border-black/5 shadow-xl z-20"
              >
                <Shield className="text-blue-500 mb-2" size={24} />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Risk</p>
                <p className="text-2xl font-black text-blue-500">Minimal</p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ============ FEATURES SECTION (Bento Grid) ============ */}
      <section id="features" className="py-20 md:py-32 px-6 md:px-8 relative bg-slate-50/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-3xl md:text-5xl font-black mb-4 md:mb-6 tracking-tighter text-slate-900">Liquid Intelligence.</h2>
            <p className="text-slate-500 font-medium px-4">Tools designed for the future of legal practice.</p>
          </div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6"
          >
            {/* Card 1: AI Cashflow Projection */}
            <motion.div variants={paperTurn} className="md:col-span-7 group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-[35px] md:rounded-[45px] blur opacity-0 group-hover:opacity-10 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative glass-card p-6 md:p-8 rounded-[30px] md:rounded-[40px] border-black/5 flex flex-col h-full bg-white/40">
                <div className="flex justify-between items-start mb-4 md:mb-6">
                  <div className="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center text-teal-600 border border-teal-500/20 shadow-inner">
                    <TrendingUp size={24} />
                  </div>
                  <div className="px-3 py-1 glass-card border-black/5 rounded-xl flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-teal-600">Simulating Forecasts</span>
                  </div>
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">AI Cashflow <br /> Projection</h3>
                <p className="text-slate-500 text-xs md:text-sm leading-relaxed max-w-sm mb-6 font-medium">Map your firm&apos;s financial future with 98% accuracy. Our AI models predict liquidity gaps before they happen.</p>

                <div className="mt-auto pt-4 border-t border-black/5 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="w-1 h-6 bg-teal-500/10 rounded-full overflow-hidden relative">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${20 + i * 15}%` }}
                          className="absolute bottom-0 left-0 w-full bg-teal-500"
                        />
                      </div>
                    ))}
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Projection</span>
                </div>
              </div>
            </motion.div>

            {/* Card 2: Real-time Expense Guard */}
            <motion.div variants={paperTurn} className="md:col-span-5 group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-rose-500 to-pink-500 rounded-[35px] md:rounded-[45px] blur opacity-0 group-hover:opacity-10 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative glass-card p-6 md:p-8 rounded-[30px] md:rounded-[40px] border-black/5 flex flex-col h-full bg-white/40">
                <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-600 border border-rose-500/20 shadow-inner mb-4 md:mb-6">
                  <Zap size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Real-time <br /> Expense Shield</h3>
                <p className="text-slate-500 text-xs md:text-sm leading-relaxed font-medium mb-6">Stop the leak. Instantly monitor every billable hour expense as it occurs across your firm.</p>

                <div className="mt-auto">
                  <div className="glass-card p-3 border-black/5 rounded-xl shadow-sm bg-white/60">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Burn Rate</span>
                      <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest">Alert</span>
                    </div>
                    <p className="text-lg font-black text-slate-800 tracking-tight">₹14,200 <span className="text-[9px] text-slate-400 font-bold">/HR</span></p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 3: Automated Tax Compliance */}
            <motion.div variants={paperTurn} className="md:col-span-5 group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-[35px] md:rounded-[45px] blur opacity-0 group-hover:opacity-10 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative glass-card p-6 md:p-8 rounded-[30px] md:rounded-[40px] border-black/5 flex flex-col h-full bg-white/40">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-500/20 shadow-inner mb-4 md:mb-6">
                  <Shield size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Automated <br /> Compliance</h3>
                <p className="text-slate-500 text-xs md:text-sm leading-relaxed font-medium mb-6">Audit-proof your firm. Automated GST matching and document verification for every transaction.</p>

                <div className="mt-auto flex items-center gap-2">
                  <div className="flex -space-x-1.5">
                    {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white shadow-sm" />)}
                  </div>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">+1.2k Verified Docs</span>
                </div>
              </div>
            </motion.div>

            {/* Card 4: Profit Margin Intelligence */}
            <motion.div variants={paperTurn} className="md:col-span-7 group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-[35px] md:rounded-[45px] blur opacity-0 group-hover:opacity-10 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative glass-card p-6 md:p-8 rounded-[30px] md:rounded-[40px] border-black/5 flex flex-col h-full overflow-hidden bg-white/40">
                <div className="flex justify-between items-start mb-4 md:mb-6">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600 border border-amber-500/20 shadow-inner">
                    <BarChart3 size={24} />
                  </div>
                  <div className="h-14 w-24 bg-amber-500/5 rounded-xl border border-amber-500/10 flex items-center justify-center">
                    <span className="text-lg font-black text-amber-600">42%</span>
                    <span className="text-[8px] font-black text-amber-600/50 uppercase ml-1">Avg</span>
                  </div>
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Profit Margin Analytics</h3>
                <p className="text-slate-500 text-xs md:text-sm leading-relaxed max-w-sm font-medium mb-6">Identify your most valuable clients. See exactly which cases are driving profit and which are stalling growth.</p>

                <div className="mt-auto grid grid-cols-2 gap-3">
                  <div className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Case Alpha</span>
                    <span className="text-[9px] font-black text-emerald-500">High</span>
                  </div>
                  <div className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Unit Beta</span>
                    <span className="text-[9px] font-black text-amber-500">Optimum</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============ CTA SECTION ============ */}
      <section id="about" className="py-8 md:py-16 px-6 md:px-8">
        <div className="max-w-3xl mx-auto group relative">
          {/* External Shadow/Glow */}
          <div className="absolute -inset-2 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 rounded-[32px] md:rounded-[45px] blur-2xl opacity-0 group-hover:opacity-100 transition duration-1000"></div>

          {/* Main Card */}
          <div className="relative bg-white rounded-[28px] md:rounded-[40px] p-6 md:p-10 text-center overflow-hidden border border-teal-100/50 shadow-[0_20px_50px_rgba(0,0,0,0.03)] group-hover:shadow-[0_20px_60px_rgba(20,184,166,0.1)] transition-all duration-700">
            {/* Multi-layered Oceanic Gradients */}
            <div className="absolute inset-0 bg-gradient-to-tr from-teal-50/80 via-emerald-50/40 to-blue-50/60 pointer-events-none" />
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.08),transparent_50%)] pointer-events-none" />
            {/* Soft Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Unique Design Element: Inner Gradient Border */}
            <div className="absolute inset-0 border-[6px] border-white/50 pointer-events-none rounded-[28px] md:rounded-[40px]" />

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative z-10"
            >


              <h2 className="text-2xl md:text-4xl font-black text-slate-900 mb-3 tracking-tighter leading-[1.1]">
                Scale your practice <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">to its peak potential.</span>
              </h2>

              <p className="text-sm md:text-base text-slate-500 mb-6 max-w-lg mx-auto font-medium leading-relaxed">
                Unlock the ultimate financial edge. Deploy real-time AI to protect your margins and accelerate your firm's growth.
              </p>

              <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                <button
                  onClick={() => setAuthOpen(true)}
                  className="w-full md:w-auto px-8 py-3.5 rounded-xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-teal-600 hover:scale-105 shadow-xl transition-all duration-300"
                >
                  Apply Now
                </button>

              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="py-12 md:py-20 px-6 md:px-8 border-t border-black/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 md:gap-10 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
          {/* Logo (Left) */}
          <div className="order-1">
            <Logo size={24} showText={true} textColor="#0f172a" />
          </div>

          {/* Copyright (Center) */}
          <p className="text-center order-3 md:order-2 flex-1 text-slate-900 font-bold uppercase tracking-[0.1em]" style={{ fontFamily: "var(--font-geist-sans)" }}>
            © 2026 SOLV PROD. All rights reserved.
          </p>

          {/* Social Icons (Right) */}
          <div className="flex gap-6 order-2 md:order-3">
            <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 border border-black/5 hover:bg-teal-50 hover:text-teal-600 hover:border-teal-500/20 transition-all">
              <Twitter size={14} />
            </a>
            <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 border border-black/5 hover:bg-teal-50 hover:text-teal-600 hover:border-teal-500/20 transition-all">
              <Linkedin size={14} />
            </a>
            <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 border border-black/5 hover:bg-teal-50 hover:text-teal-600 hover:border-teal-500/20 transition-all">
              <LifeBuoy size={14} />
            </a>
          </div>
        </div>
      </footer>

      {/* ============ AUTH MODAL ============ */}
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
