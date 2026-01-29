"use client";

import Link from "next/link";
// FIX: Added 'Zap' to the imports below
import { ArrowRight, Check, X, ShieldAlert, TrendingUp, DollarSign, Activity, ChevronRight, BrainCircuit, Globe, Zap } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import { useRef, useMemo, useState, useEffect } from "react";

// --- 1. INTELLIGENT 3D BACKGROUND (Reacts to Mouse) ---
function IntelligentStream(props: any) {
  // FIX: Added null to useRef
  const ref = useRef<any>(null);

  // Generate a "Neural Network" style cloud
  const particles = useMemo(() => {
    const count = 4000;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 12;
      const y = (Math.random() - 0.5) * 8;
      const z = (Math.random() - 0.5) * 4;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      // Gentle Flow
      ref.current.rotation.y += 0.001;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;

      // Mouse Interaction (Subtle Parallax)
      const x = state.pointer.x * 0.2;
      const y = state.pointer.y * 0.2;
      ref.current.rotation.x += (y - ref.current.rotation.x) * 0.05;
      ref.current.rotation.y += (x - ref.current.rotation.y) * 0.05;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={particles} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color="#2563eb" // Deep Electric Blue
          opacity={0.6}
          size={0.012}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
}

// --- ANIMATION CONFIG ---
// Typed as any to avoid strict TypeScript variant errors
const fadeInUp: any = {
  hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

const staggerContainer: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

export default function LandingPage() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 100]);
  const y2 = useTransform(scrollY, [0, 500], [0, -80]);

  // --- REGION INTELLIGENCE ---
  const [region, setRegion] = useState<"IN" | "US">("IN");

  useEffect(() => {
    // Simple client-side check for timezone to guess region
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz.includes("New_York") || tz.includes("Los_Angeles") || tz.includes("Chicago") || tz.includes("America")) {
      setRegion("US");
    } else {
      setRegion("IN"); // Default to India/ROW
    }
  }, []);

  // Dynamic Content based on Region
  const currency = region === "IN" ? "₹" : "$";
  const accountingTool = region === "IN" ? "Tally / Zoho" : "QuickBooks / Xero";
  const compliance = region === "IN" ? "GST" : "IRS Tax";
  const payrollCost = region === "IN" ? "₹5 Lakh" : "$50k";
  const receivableAmt = region === "IN" ? "₹50 Lakhs" : "$500k";

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden selection:bg-blue-500/30">

      {/* 1. LIQUID GLASS BACKGROUND */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-white to-white pointer-events-none" />

      {/* 2. 3D INTELLIGENT LAYER */}
      <div className="fixed inset-0 z-0 opacity-60 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 3] }}>
          <IntelligentStream />
        </Canvas>
      </div>

      {/* CONTENT LAYER */}
      <div className="relative z-10">

        {/* NAVBAR */}
        <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto sticky top-0 z-50 transition-all">
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm" />

          <div className="relative font-bold text-2xl tracking-tight flex items-center gap-2 text-slate-900">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30">
              <BrainCircuit size={20} />
            </div>
            CashFlow+
          </div>

          <div className="relative flex items-center gap-4">
            {/* Region Toggle (Manual Override) */}
            <button
              onClick={() => setRegion(region === "IN" ? "US" : "IN")}
              className="hidden md:flex items-center gap-2 text-xs font-bold px-3 py-1 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
            >
              <Globe size={12} /> {region === "IN" ? "India (IN)" : "USA (US)"}
            </button>

            <Link href="/dashboard">
              <button className="px-5 py-2.5 text-base font-medium text-slate-600 hover:text-blue-600 transition-colors">Log In</button>
            </Link>
            <Link href="/login"> {/* Changed from /dashboard */}
              <button className="px-5 py-2 text-sm font-bold bg-white text-slate-950 rounded-full hover:bg-blue-50 transition-all shadow-lg shadow-white/10">
                Try Demo
              </button>
            </Link>
          </div>
        </nav>

        {/* === SECTION 1: THE HERO (AI POSITIONING) === */}
        <section className="pt-24 pb-32 px-6 text-center max-w-6xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>

            {/* AI Pill */}
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 border border-blue-100 text-blue-700 text-sm font-bold uppercase tracking-wide mb-8 backdrop-blur-md shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              AI Cash Intelligence Engine
            </motion.div>

            {/* The Hook */}
            <motion.h1 variants={fadeInUp} className="text-6xl md:text-8xl font-extrabold tracking-tight text-slate-900 mb-8 leading-[1.1]">
              Profitable on Paper. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 animate-gradient">
                Bankrupt on Tuesday.
              </span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-2xl text-slate-500 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              Your accounting software looks backward. <br />
              <span className="font-semibold text-slate-900">Our AI looks forward.</span> <br />
              Predict your cash crunch before it happens and get instant actions to fix it.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-24">
              <Link href="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="h-16 px-10 text-xl font-bold text-white bg-blue-600 rounded-full shadow-2xl hover:shadow-blue-500/40 transition-all flex items-center gap-3 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full hover:translate-y-0 transition-transform duration-300 rounded-full" />
                  Activate AI Co-Pilot <ArrowRight className="w-6 h-6" />
                </motion.button>
              </Link>
              <p className="text-slate-400 font-medium text-sm flex items-center gap-2">
                <Check size={14} className="text-green-500" /> Auto-syncs with {accountingTool}
              </p>
            </motion.div>

            {/* 3D GLASS DASHBOARD */}
            <motion.div
              style={{ y: y1, rotateX: 5 }}
              className="relative mx-auto rounded-2xl p-2 bg-gradient-to-b from-white/60 to-white/10 backdrop-blur-md border border-white/40 shadow-2xl max-w-5xl"
            >
              <div className="rounded-xl overflow-hidden shadow-inner border border-slate-200/50">
                <img
                  src="/dashboard-preview.jpg"
                  alt="Dashboard"
                  className="w-full h-auto"
                />
              </div>

              {/* Floating Intelligence Widget */}
              <motion.div
                style={{ y: y2 }}
                className="absolute -right-6 -top-12 bg-white/90 backdrop-blur-xl p-6 rounded-2xl border border-white/50 shadow-[0_20px_50px_rgba(0,0,0,0.1)] hidden md:block"
              >
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-500/30">
                    <Activity size={28} />
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">AI Prediction</div>
                    <div className="text-lg font-bold text-slate-900 leading-none">Cash Crunch</div>
                    <div className="text-sm font-bold text-red-500 mt-1">Detected in 14 Days</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

          </motion.div>
        </section>

        {/* === SECTION 2: THE PROBLEM (Storytelling) === */}
        <section className="py-32 bg-white relative border-t border-slate-100">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-bold text-slate-900 mb-6">The "Profit Trap"</h2>
                <p className="text-xl text-slate-600 mb-6 leading-relaxed">
                  You have {receivableAmt} in Receivables. You feel rich.
                  <br />
                  But payroll is {payrollCost} on Friday, and the bank account says zero.
                </p>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <h3 className="font-bold text-slate-900 mb-2">Why existing tools fail:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-slate-600">
                      <X className="text-red-500 shrink-0" size={20} />
                      {accountingTool} is a historian, not a futurist.
                    </li>
                    <li className="flex items-center gap-3 text-slate-600">
                      <X className="text-red-500 shrink-0" size={20} />
                      Spreadsheets are manual, static, and fragile.
                    </li>
                  </ul>
                </div>
              </motion.div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-purple-100 rounded-full blur-[80px] opacity-60"></div>
                <div className="relative bg-white/60 backdrop-blur-xl border border-white/50 p-8 rounded-3xl shadow-xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                      <BrainCircuit size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">CashFlow+ Intelligence</h4>
                      <p className="text-sm text-slate-500">Processing live data...</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-2 bg-slate-100 rounded-full w-full overflow-hidden">
                      <motion.div
                        initial={{ width: "0%" }}
                        whileInView={{ width: "70%" }}
                        transition={{ duration: 1.5 }}
                        className="h-full bg-blue-500"
                      />
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-slate-500">Analyzing Invoices</span>
                      <span className="text-blue-600">Complete</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full w-full overflow-hidden">
                      <motion.div
                        initial={{ width: "0%" }}
                        whileInView={{ width: "45%" }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        className="h-full bg-purple-500"
                      />
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-slate-500">Predicting Burn Rate</span>
                      <span className="text-purple-600">Processing...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* === SECTION 3: THE SOLUTION (Glass Cards) === */}
        <section className="py-32 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-slate-900 mb-6">Intelligence, not just Reports</h2>
            <p className="text-xl text-slate-500 max-w-3xl mx-auto">
              We don't just show you data. We tell you what to do with it.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "The Death Date",
                desc: "AI analyzes your burn rate to predict the exact date you run out of cash.",
                icon: <ShieldAlert className="w-8 h-8 text-white" />,
                gradient: "from-red-500 to-orange-500"
              },
              {
                title: "Action Engine",
                desc: "Generates one-click actions: 'WhatsApp Client X', 'Delay Vendor Y'.",
                icon: <Zap className="w-8 h-8 text-white" />,
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                title: "Safe Sandbox",
                desc: "Simulate hiring decisions without breaking your actual books.",
                icon: <Activity className="w-8 h-8 text-white" />,
                gradient: "from-emerald-500 to-teal-500"
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="group p-8 bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl shadow-lg hover:shadow-2xl transition-all relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${item.gradient} opacity-10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:opacity-20 transition-opacity`} />

                <div className={`h-16 w-16 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900">{item.title}</h3>
                <p className="text-lg text-slate-600 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* === SECTION 4: CTA === */}
        <section className="py-32 bg-slate-900 text-white text-center px-6 relative overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-30">
            <Canvas camera={{ position: [0, 0, 5] }}>
              <IntelligentStream />
            </Canvas>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold mb-8">Ready to upgrade your CFO?</h2>
            <p className="text-blue-200 text-2xl mb-12 font-light">
              Join 50+ Founders using AI to survive the crunch.
            </p>

            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="h-20 px-12 text-2xl font-bold text-slate-900 bg-white rounded-full shadow-[0_0_50px_rgba(255,255,255,0.3)] hover:shadow-[0_0_80px_rgba(255,255,255,0.5)] transition-all flex items-center gap-3 mx-auto"
              >
                Start 7-Day Free Trial <ChevronRight size={28} />
              </motion.button>
            </Link>

            <div className="mt-10 flex flex-wrap justify-center gap-8 text-lg text-slate-400 font-medium">
              <span className="flex items-center gap-2"><Check className="text-green-400" size={20} /> Instant {region === "IN" ? "Google" : "SSO"} Login</span>
              <span className="flex items-center gap-2"><Check className="text-green-400" size={20} /> Works with {accountingTool}</span>
            </div>
          </div>
        </section>

        <footer className="py-12 text-center text-slate-400 bg-slate-950 border-t border-slate-800">
          <p className="text-lg">© 2026 CashFlow+. {region === "IN" ? "Made in India" : "Made in SF"} for the World.</p>
        </footer>

      </div>
    </div>
  );
}