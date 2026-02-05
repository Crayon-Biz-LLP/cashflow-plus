"use client";

import Link from "next/link";
import {
  ArrowRight, Check, ShieldAlert, Zap, FileText, PieChart,
  Repeat, BarChart4, Globe, ChevronRight, BrainCircuit,
  LayoutDashboard, CreditCard, ArrowLeftRight, Briefcase,
  Rocket, Store, TrendingUp, History, X, AlertTriangle,
  MessageCircle, Clock, Moon, Sun, Laptop
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

// --- CONFIGURATION ---
const REGION_DATA = {
  IN: {
    label: 'India (₹)',
    currency: '₹',
    balance: "28,45,920.00",
    receivables: "₹80 Lakhs",
    burn: "₹12.4L / mo",
    tools: "Tally, Zoho Books",
    aud_solo: "₹20L - ₹1Cr",
    aud_smb: "₹1Cr+",
    login: "Google",
    footer: "Made in India"
  },
  US: {
    label: 'USA ($)',
    currency: '$',
    balance: "2,845,920.00",
    receivables: "$500k",
    burn: "$12.4k / mo",
    tools: "QuickBooks, Xero",
    aud_solo: "$100k - $500k",
    aud_smb: "$1M+",
    login: "SSO",
    footer: "Made in SF"
  }
};

// --- COMPONENTS ---

const SpotlightCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const divRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    divRef.current.style.setProperty("--x", `${x}px`);
    divRef.current.style.setProperty("--y", `${y}px`);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      // FIX: Removed default 'bg-zinc-900/50' to prevent muddy look in light mode
      className={`spotlight-card group relative overflow-hidden rounded-3xl border transition-all duration-300 ${className}`}
    >
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
};

const ParticleCanvas = ({ isDark }: { isDark: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let particles: any[] = [];
    let animationFrameId: number;

    const config = {
      particleCount: window.innerWidth < 768 ? 40 : 80,
      mouseRadius: 180,
      baseColor: isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)",
      highlightColor: "rgba(249, 115, 22, 0.6)",
      lineColor: "rgba(249, 115, 22, 0.15)",
    };

    const mouse = { x: -1000, y: -1000 };

    class Particle {
      x: number; y: number; vx: number; vy: number; size: number; baseAlpha: number; currentAlpha: number;
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.size = Math.random() * 1.5;
        this.baseAlpha = Math.random() * 0.3 + 0.1;
        this.currentAlpha = this.baseAlpha;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < config.mouseRadius) {
          this.currentAlpha = Math.min(this.baseAlpha + 0.5, 1);
          ctx!.beginPath();
          ctx!.strokeStyle = config.lineColor;
          ctx!.lineWidth = 0.5;
          ctx!.moveTo(this.x, this.y);
          ctx!.lineTo(mouse.x, mouse.y);
          ctx!.stroke();
          ctx!.fillStyle = config.highlightColor;
        } else {
          this.currentAlpha = this.baseAlpha;
          ctx!.fillStyle = config.baseColor;
        }
      }
      draw() {
        ctx!.globalAlpha = this.currentAlpha;
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < config.particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      if (mouse.x > 0) {
        const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 400);
        gradient.addColorStop(0, "rgba(249, 115, 22, 0.05)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      init();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    init();
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDark]);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none" />;
};

// --- MAIN PAGE ---

export default function LandingPage() {
  const [region, setRegion] = useState<"IN" | "US">("IN");
  const [activeTab, setActiveTab] = useState<"solos" | "startups" | "smbs">("solos");
  const [isDark, setIsDark] = useState(true);

  // 3D Tilt Logic
  const heroSectionRef = useRef<HTMLElement>(null);
  const heroCardRef = useRef<HTMLDivElement>(null);

  // --- THEME PERSISTENCE ---
  useEffect(() => {
    // 1. Check for saved theme
    const savedTheme = localStorage.getItem("cashflow_theme");
    if (savedTheme) {
      setIsDark(savedTheme === "dark");
    } else {
      localStorage.setItem("cashflow_theme", "dark");
    }

    // 2. Region Logic
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz.includes("New_York") || tz.includes("Los_Angeles") || tz.includes("America")) {
      setRegion("US");
    } else {
      setRegion("IN");
    }

    // 3. Tilt Logic
    const section = heroSectionRef.current;
    const card = heroCardRef.current;
    if (!section || !card) return;

    const handleMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -3;
      const rotateY = ((x - centerX) / centerX) * 3;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const handleLeave = () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
    };

    section.addEventListener("mousemove", handleMove);
    section.addEventListener("mouseleave", handleLeave);
    return () => {
      section.removeEventListener("mousemove", handleMove);
      section.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem("cashflow_theme", newTheme ? "dark" : "light");
  };

  const data = REGION_DATA[region];

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans ${isDark ? 'dark bg-[#020202] text-zinc-300 selection:bg-orange-500/30 selection:text-orange-100' : 'bg-white text-zinc-600 selection:bg-orange-200 selection:text-orange-900'}`}>

      {/* CUSTOM CSS */}
      <style jsx global>{`
        .shine-button { position: relative; overflow: hidden; }
        .shine-button::before {
          content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent);
          transform: skewX(-20deg); transition: 0.5s;
        }
        .shine-button:hover::before { left: 200%; transition: 0.7s ease-in-out; }

        /* Dark Mode Spotlight */
        .dark .spotlight-card::before {
            content: ""; position: absolute; inset: -1px; border-radius: inherit; padding: 1px;
            background: radial-gradient(600px circle at var(--x, 0px) var(--y, 0px), rgba(249, 115, 22, 0.4), transparent 40%);
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; opacity: 0; transition: opacity 0.3s; z-index: 20;
        }
        .dark .spotlight-card::after {
            content: ""; position: absolute; inset: 0; border-radius: inherit;
            background: radial-gradient(600px circle at var(--x, 0px) var(--y, 0px), rgba(249, 115, 22, 0.05), transparent 40%);
            pointer-events: none; opacity: 0; transition: opacity 0.3s; z-index: 10;
        }
        
        /* Light Mode Spotlight (Clean) */
        .spotlight-card::before {
            content: ""; position: absolute; inset: -1px; border-radius: inherit; padding: 1px;
            background: radial-gradient(600px circle at var(--x, 0px) var(--y, 0px), rgba(249, 115, 22, 0.2), transparent 40%);
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; opacity: 0; transition: opacity 0.3s; z-index: 20;
        }
        .spotlight-card::after {
            content: ""; position: absolute; inset: 0; border-radius: inherit;
            background: radial-gradient(600px circle at var(--x, 0px) var(--y, 0px), rgba(249, 115, 22, 0.02), transparent 40%);
            pointer-events: none; opacity: 0; transition: opacity 0.3s; z-index: 10;
        }
        .spotlight-card:hover::before, .spotlight-card:hover::after { opacity: 1; }
      `}</style>

      {/* BACKGROUNDS */}
      {isDark ? (
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none bg-[#020202]">
          <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] blur-[120px] rounded-[100%] opacity-20 animate-pulse bg-orange-600/10"></div>
          <div className="absolute top-[10%] left-[20%] w-[400px] h-[400px] blur-[90px] rounded-full opacity-10 bg-amber-600/10"></div>
        </div>
      ) : (
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none bg-white">
          <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] blur-[120px] rounded-[100%] opacity-40 animate-pulse bg-orange-200/40"></div>
          <div className="absolute top-[10%] left-[20%] w-[400px] h-[400px] blur-[90px] rounded-full opacity-30 bg-amber-100"></div>
        </div>
      )}

      <div
        className="fixed inset-0 pointer-events-none -z-20 opacity-30"
        style={{
          backgroundImage: `linear-gradient(to right, ${isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)'} 1px, transparent 1px), linear-gradient(to bottom, ${isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)'} 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          maskImage: 'linear-gradient(to bottom, black 10%, transparent 90%)'
        }}
      />
      <ParticleCanvas isDark={isDark} />

      {/* NAVBAR */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl transition-all hover:-translate-y-1">
        <div className={`relative flex items-center justify-between px-2 py-2 rounded-full border backdrop-blur-xl shadow-xl ring-1 transition-colors ${isDark
          ? 'bg-black/50 border-white/5 ring-white/5'
          : 'bg-white/70 border-zinc-200 ring-black/5 shadow-zinc-200/50'
          }`}>
          <div className="flex items-center pl-4 gap-3 cursor-pointer">
            <div className="w-8 h-8 bg-gradient-to-tr from-orange-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
              <BrainCircuit className="text-white w-5 h-5" />
            </div>
            <span className={`text-sm font-bold tracking-tight ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>CashFlow<span className="text-orange-500">+</span></span>
          </div>

          <div className={`hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2 rounded-full p-1 border ${isDark ? 'bg-white/5 border-white/5' : 'bg-zinc-100 border-zinc-200'}`}>
            {['IN', 'US'].map((key) => (
              <button
                key={key}
                onClick={() => setRegion(key as "IN" | "US")}
                className={`px-3 py-1 text-[10px] font-medium rounded-full transition-all ${region === key
                  ? "text-orange-600 bg-orange-100 dark:bg-orange-500/10 dark:text-orange-400 font-bold"
                  : isDark ? "text-zinc-500 hover:text-white" : "text-zinc-500 hover:text-zinc-900"
                  }`}
              >
                {REGION_DATA[key as "IN" | "US"].label}
              </button>
            ))}
          </div>

          <div className="flex items-center pr-1 gap-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-colors ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-black hover:bg-zinc-100'}`}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <Link href="/login">
              <span className={`hidden sm:block text-xs font-medium px-3 transition-colors cursor-pointer ${isDark ? 'text-zinc-500 hover:text-white' : 'text-zinc-500 hover:text-black'}`}>Log In</span>
            </Link>
            <Link href="/login">
              <button className={`relative group overflow-hidden rounded-full p-[1px] ${isDark ? '' : 'shadow-md'}`}>
                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#fdba74_0%,#f97316_50%,#fdba74_100%)] opacity-70 group-hover:opacity-100 transition-opacity"></span>
                <span className={`inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full px-4 py-1.5 text-xs font-medium backdrop-blur-3xl transition-colors ${isDark ? 'bg-zinc-950 text-white hover:bg-zinc-900' : 'bg-white text-zinc-900 hover:bg-zinc-50'}`}>
                  Try Demo
                </span>
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main ref={heroSectionRef} className="pt-40 pb-20 relative px-6 overflow-visible">
        <div className="max-w-7xl mx-auto text-center relative z-10">

          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border backdrop-blur-md mb-8 transition-all cursor-pointer group shadow-lg ${isDark
            ? 'border-orange-500/10 bg-orange-500/5 hover:border-orange-500/50 shadow-orange-500/10'
            : 'border-orange-200 bg-orange-50 hover:border-orange-300 shadow-orange-500/5'
            }`}>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-orange-500"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-500">The #1 Killer of SMBs</span>
          </div>

          <h1 className={`text-5xl md:text-7xl lg:text-8xl font-medium tracking-tighter mb-6 leading-[1.1] ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            Profitable on Paper. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500">Bankrupt on Tuesday.</span>
          </h1>

          <p className={`text-lg md:text-xl font-light max-w-2xl mx-auto mb-10 leading-relaxed ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>
            You have <span className={`font-medium ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>{data.receivables}</span> in invoices, but payroll is tomorrow. <br />Accounting tools look backward. <span className="text-orange-500 font-medium">CashFlow+</span> looks forward.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24">
            <Link href="/login">
              <button className={`shine-button h-12 px-8 rounded-full text-sm font-semibold transition-all flex items-center gap-2 shadow-xl ${isDark
                ? 'bg-white text-black hover:bg-zinc-200 shadow-white/5'
                : 'bg-zinc-900 text-white hover:bg-black shadow-zinc-900/10'
                }`}>
                Calculate Runway
                <ArrowRight size={16} />
              </button>
            </Link>
            <div className={`flex items-center gap-4 text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
              <span className="flex items-center gap-1"><Check size={12} className="text-orange-500" /> No Credit Card</span>
              <span className="flex items-center gap-1"><Check size={12} className="text-orange-500" /> 7-Day Free Trial</span>
            </div>
          </div>

          {/* 3D TILT DASHBOARD */}
          <div className="perspective-[1200px] relative w-full max-w-5xl mx-auto">
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[40%] bg-orange-500/10 blur-[100px] rounded-full -z-10 ${isDark ? '' : 'opacity-50'}`}></div>

            <div ref={heroCardRef} className={`w-full rounded-xl border shadow-2xl overflow-hidden relative group transition-transform duration-100 ease-out ${isDark
              ? 'bg-[#0a0a0a] border-white/10'
              : 'bg-white border-zinc-200 shadow-zinc-200/50'
              }`} style={{ transformStyle: 'preserve-3d' }}>
              {/* Top Bar */}
              <div className={`h-10 border-b flex items-center px-4 justify-between relative z-20 ${isDark ? 'bg-[#0a0a0a] border-white/5' : 'bg-zinc-50 border-zinc-200'}`}>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500/20 border border-orange-500/30"></div>
                  <div className={`w-3 h-3 rounded-full border ${isDark ? 'bg-zinc-800 border-white/5' : 'bg-zinc-300 border-black/5'}`}></div>
                  <div className={`w-3 h-3 rounded-full border ${isDark ? 'bg-zinc-800 border-white/5' : 'bg-zinc-300 border-black/5'}`}></div>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">cashflow-engine.v1.tsx</div>
                <div className="w-10"></div>
              </div>

              <div className={`flex h-[500px] md:h-[600px] relative ${isDark ? 'bg-black' : 'bg-white'}`}>
                {/* Sidebar */}
                <div className={`w-16 md:w-56 border-r p-3 flex flex-col gap-1 relative z-10 ${isDark ? 'border-white/5 bg-[#09090b]' : 'border-zinc-100 bg-zinc-50/50'
                  }`}>
                  <div className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-4 cursor-default border ${isDark
                    ? 'bg-orange-500/10 text-orange-400 border-orange-500/10'
                    : 'bg-orange-50 text-orange-600 border-orange-200'
                    }`}>
                    <LayoutDashboard size={16} />
                    <span className="text-xs font-medium hidden md:block">Forecast</span>
                  </div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider px-3 mb-2 mt-2 text-zinc-500 hidden md:block">Modules</div>
                  <div className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isDark ? 'text-zinc-500 hover:bg-white/5 hover:text-white' : 'text-zinc-600 hover:bg-zinc-200/50 hover:text-black'
                    }`}>
                    <FileText size={16} />
                    <span className="text-xs font-medium hidden md:block">Invoices</span>
                  </div>
                  <div className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isDark ? 'text-zinc-500 hover:bg-white/5 hover:text-white' : 'text-zinc-600 hover:bg-zinc-200/50 hover:text-black'
                    }`}>
                    <CreditCard size={16} />
                    <span className="text-xs font-medium hidden md:block">Expenses</span>
                  </div>
                </div>

                {/* Content */}
                <div className={`flex-1 p-8 relative overflow-hidden ${isDark ? 'bg-[#050505]' : 'bg-white'}`}>
                  <div className={`absolute inset-0 bg-[size:24px_24px] ${isDark
                    ? 'bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)]'
                    : 'bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)]'
                    }`}></div>

                  {/* ALERT OVERLAY */}
                  <div className="absolute top-6 right-6 z-30 animate-pulse">
                    <div className={`flex items-center gap-3 p-3 rounded-xl border backdrop-blur-md shadow-2xl ${isDark
                      ? 'bg-black/90 border-red-500/30'
                      : 'bg-white/90 border-red-200 shadow-red-500/10'
                      }`}>
                      <div className="h-8 w-8 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
                        <ShieldAlert size={18} />
                      </div>
                      <div className="text-left">
                        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">AI Alert</div>
                        <div className={`text-xs font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Cash Crunch Detected</div>
                        <div className="text-[10px] font-bold text-red-500">In 14 Days</div>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 mt-4">
                    <h2 className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Projected Runway</h2>
                    <div className={`text-4xl font-medium mb-8 flex items-end gap-3 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                      {data.currency}{data.balance}
                    </div>

                    {/* Graph Bars */}
                    <div className={`h-64 w-full flex items-end gap-2 px-2 pb-0 opacity-80 border-b ${isDark ? 'border-white/5' : 'border-zinc-100'}`}>
                      {[30, 45, 35, 60, 50, 75, 65, 80, 40, 55].map((h, i) => (
                        <div key={i} className={`w-full rounded-t-sm transition-all duration-300 hover:opacity-100 ${i === 5
                          ? 'bg-orange-500 h-[75%]'
                          : isDark ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-zinc-200 hover:bg-zinc-300'
                          }`} style={{ height: i === 5 ? '75%' : `${h}%` }}></div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className={`p-3 rounded-xl border ${isDark ? 'bg-white/[0.01] border-white/5' : 'bg-zinc-50 border-zinc-200'}`}>
                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Burn Rate</div>
                        <div className={`text-lg font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>{data.burn}</div>
                      </div>
                      <div className={`p-3 rounded-xl border ${isDark ? 'bg-white/[0.01] border-white/5' : 'bg-zinc-50 border-zinc-200'}`}>
                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Receivables</div>
                        <div className={`text-lg font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>{data.receivables}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* AUDIENCE TABS */}
      <section className={`py-24 border-t relative ${isDark ? 'bg-zinc-950 border-white/5' : 'bg-zinc-50 border-zinc-200'}`}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-medium mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Who is CashFlow+ built for?</h2>
            <p className="text-zinc-500 font-light">If you don't have a full-time CFO, you need this.</p>
          </div>

          <div className="flex justify-center gap-2 mb-12">
            {(['solos', 'startups', 'smbs'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all border capitalize ${activeTab === tab
                  ? "bg-orange-500/10 text-orange-500 border-orange-500/20"
                  : isDark ? "bg-transparent text-zinc-500 border-transparent hover:text-zinc-300" : "bg-white text-zinc-500 border-transparent hover:bg-zinc-100"
                  }`}
              >
                {tab === 'solos' ? 'Solopreneurs' : tab === 'smbs' ? 'SMBs' : tab}
              </button>
            ))}
          </div>

          <div className={`border rounded-3xl p-8 md:p-12 relative overflow-hidden min-h-[400px] ${isDark ? 'bg-black border-white/10' : 'bg-white border-zinc-200 shadow-xl shadow-zinc-200/50'
            }`}>
            <div className={`absolute top-0 right-0 w-64 h-64 blur-3xl rounded-full ${isDark ? 'bg-orange-500/5' : 'bg-orange-500/10'}`}></div>

            <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
              <div>
                {activeTab === 'solos' && (
                  <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                    <h3 className={`text-2xl font-medium mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>The "One-Man Army"</h3>
                    <p className={`text-xs font-mono mb-6 uppercase tracking-wider border px-2 py-1 inline-block rounded ${isDark ? 'text-orange-400 border-orange-500/20 bg-orange-500/5' : 'text-orange-600 border-orange-200 bg-orange-50'
                      }`}>Revenue: {data.aud_solo}</p>
                    <p className="text-zinc-500 leading-relaxed mb-6 font-light">You are the CEO, Sales Team, and Accountant. You don't have time for Excel. You need to answer one question instantly: "Can I afford to buy this laptop?"</p>
                  </div>
                )}
                {activeTab === 'startups' && (
                  <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                    <h3 className={`text-2xl font-medium mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>The "Burn Rate" Founders</h3>
                    <p className={`text-xs font-mono mb-6 uppercase tracking-wider border px-2 py-1 inline-block rounded ${isDark ? 'text-orange-400 border-orange-500/20 bg-orange-500/5' : 'text-orange-600 border-orange-200 bg-orange-50'
                      }`}>Stage: Pre-Seed to Series A</p>
                    <p className="text-zinc-500 leading-relaxed mb-6 font-light">You live and die by your runway. You need to report to investors without spending 4 hours on spreadsheets. Survival is your only metric.</p>
                  </div>
                )}
                {activeTab === 'smbs' && (
                  <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                    <h3 className={`text-2xl font-medium mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>The "Cash Gap" Victims</h3>
                    <p className={`text-xs font-mono mb-6 uppercase tracking-wider border px-2 py-1 inline-block rounded ${isDark ? 'text-orange-400 border-orange-500/20 bg-orange-500/5' : 'text-orange-600 border-orange-200 bg-orange-50'
                      }`}>Revenue: {data.aud_smb}</p>
                    <p className="text-zinc-500 leading-relaxed mb-6 font-light">High revenue on paper, but slow-paying clients. You need to manage the deadly gap between Invoice Sent and Cash Received.</p>
                  </div>
                )}
                <ul className="space-y-3 text-sm text-zinc-500">
                  <li className="flex items-center gap-2"><Check size={14} className="text-orange-500" /> Instant Expense Categorization</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-orange-500" /> Automated Forecasting</li>
                </ul>
              </div>
              <div className={`relative h-64 border rounded-2xl flex items-center justify-center ${isDark ? 'border-white/5 bg-zinc-900/30' : 'border-zinc-100 bg-zinc-50'
                }`}>
                {activeTab === 'solos' && <Briefcase size={80} className="text-orange-500/20" />}
                {activeTab === 'startups' && <Rocket size={80} className="text-orange-500/20" />}
                {activeTab === 'smbs' && <Store size={80} className="text-orange-500/20" />}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE GRID (ARSENAL) */}
      <section className={`py-32 px-6 relative ${isDark ? 'bg-[#050505]' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <div className={`inline-block px-4 py-1.5 border font-medium rounded-full text-[10px] uppercase tracking-wide mb-6 ${isDark ? 'bg-zinc-900 border-white/10 text-zinc-400' : 'bg-zinc-100 border-zinc-200 text-zinc-500'
              }`}>
              The Arsenal
            </div>
            <h2 className={`text-3xl md:text-5xl font-medium tracking-tighter mb-6 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Your Fractional <span className="text-orange-500">AI CFO</span>.</h2>
            <p className="text-xl text-zinc-500 font-light max-w-2xl mx-auto">
              We don't replace your accountant. We empower you with tools built for speed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* 1. CASH CRUNCH (HERO CARD) */}
            <SpotlightCard className={`md:col-span-2 group p-10 flex flex-col justify-between relative overflow-hidden ${isDark
              ? 'bg-gradient-to-br from-orange-900/20 to-zinc-900 border-orange-500/30'
              : 'bg-white border-orange-200 shadow-xl shadow-orange-500/5'
              }`}>
              <div className={`absolute top-0 right-0 w-64 h-64 blur-[80px] rounded-full ${isDark ? 'bg-orange-500/10' : 'bg-orange-200/40'}`}></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white">
                    <AlertTriangle size={32} />
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold border ${isDark ? 'bg-black/50 border-orange-500/30 text-orange-200' : 'bg-white border-orange-200 text-orange-600'
                    }`}>
                    USP
                  </div>
                </div>
                <h3 className={`text-3xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Cash Crunch Warning</h3>
                <p className={`text-lg leading-relaxed max-w-md ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                  Know your 'Death Date' 60 days in advance. Our AI analyzes burn rate vs committed expenses to predict exactly when you run out of cash.
                </p>
              </div>

              {/* Visualizer */}
              <div className={`mt-8 flex items-center gap-4 p-4 rounded-xl border ${isDark ? 'bg-black/40 border-white/5' : 'bg-zinc-50 border-zinc-200'
                }`}>
                <Clock size={20} className="text-orange-500" />
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>Runway Left</span>
                    <span className="text-orange-500 font-bold">14 Days</span>
                  </div>
                  <div className={`h-2 w-full rounded-full overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
                    <div className="h-full bg-orange-500 w-[20%] animate-pulse"></div>
                  </div>
                </div>
              </div>
            </SpotlightCard>

            {/* 2. ACTIONABLE ITEMS (SIDEKICK) */}
            <SpotlightCard className={`md:col-span-1 p-8 flex flex-col relative ${isDark
              ? 'bg-zinc-900 border-white/10 hover:border-orange-500/30'
              : 'bg-white border-zinc-200 hover:border-orange-300 shadow-lg shadow-zinc-200/50'
              }`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${isDark ? 'bg-zinc-800 text-yellow-500' : 'bg-orange-50 text-orange-600'
                }`}>
                <Zap size={24} />
              </div>
              <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Actionable Items</h3>
              <p className={`text-sm leading-relaxed mb-6 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Don't just see data. Get tasks. "WhatsApp Client X" or "Delay Vendor Y".
              </p>

              {/* Simulated List */}
              <div className="mt-auto space-y-3">
                <div className={`flex items-center gap-3 p-3 rounded-lg border ${isDark ? 'bg-black/40 border-white/5' : 'bg-zinc-50 border-zinc-100'
                  }`}>
                  <div className="h-4 w-4 rounded-full border border-green-500 flex items-center justify-center">
                    <Check size={10} className="text-green-500" />
                  </div>
                  <span className={`text-xs ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>Call Client Alpha</span>
                </div>
                <div className={`flex items-center gap-3 p-3 rounded-lg border ${isDark ? 'bg-black/40 border-white/5' : 'bg-zinc-50 border-zinc-100'
                  }`}>
                  <div className="h-4 w-4 rounded-full border border-zinc-500"></div>
                  <span className={`text-xs ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>Delay AWS Bill</span>
                </div>
              </div>
            </SpotlightCard>

            {/* 3. STANDARD FEATURES GRID */}
            {[
              { icon: <FileText size={24} />, title: 'Smart Invoicing', desc: 'Generate invoices that auto-sync. Track viewed status.' },
              { icon: <PieChart size={24} />, title: 'Expense Tracker', desc: 'Identify money leaks immediately. Flags anomalous spending.' },
              { icon: <Repeat size={24} />, title: 'Recurring Bills', desc: 'Never miss a SaaS renewal. Auto-projected into future.' },
              { icon: <BarChart4 size={24} />, title: 'Reports & Dashboard', desc: 'Download investor-ready PDFs. Visualize Net Burn.' },
            ].map((f, i) => (
              <SpotlightCard key={i} className={`p-8 transition-colors ${isDark
                ? 'bg-zinc-900/50 border-white/10 hover:border-white/20'
                : 'bg-white border-zinc-200 hover:border-zinc-300 shadow-sm'
                }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 transition-colors ${isDark ? 'bg-white/5 text-zinc-400 group-hover:text-white' : 'bg-zinc-100 text-zinc-600 group-hover:text-black'
                  }`}>
                  {f.icon}
                </div>
                <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{f.title}</h3>
                <p className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>{f.desc}</p>
              </SpotlightCard>
            ))}

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className={`absolute inset-0 ${isDark ? 'bg-black' : 'bg-zinc-50'}`}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/10 blur-[120px] rounded-full mix-blend-screen"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h2 className={`text-5xl md:text-6xl font-medium tracking-tighter mb-6 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Ready to upgrade?</h2>
          <p className="text-lg mb-10 max-w-lg mx-auto font-light text-zinc-500">Join 50+ founders managing their finance with the precision of code.</p>
          <div className="flex justify-center gap-4">
            <Link href="/login">
              <button className={`shine-button px-8 py-4 rounded-full text-sm font-semibold transition-colors ${isDark
                ? 'bg-white text-black hover:bg-zinc-200'
                : 'bg-black text-white hover:bg-zinc-800 shadow-xl'
                }`}>
                Start 7-Day Free Trial
              </button>
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-zinc-500 font-medium">
            <span className="flex items-center gap-2"><Check size={16} className="text-orange-500" /> Instant {data.login} Login</span>
            <span className="flex items-center gap-2"><Check size={16} className="text-orange-500" /> Replaces {data.tools}</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={`py-12 text-center border-t ${isDark ? 'bg-black border-white/5 text-zinc-600' : 'bg-white border-zinc-200 text-zinc-400'}`}>
        <p className="text-xs">© 2026 CashFlow+. {data.footer} for the World.</p>
      </footer>

    </div>
  );
}