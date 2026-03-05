"use client";

import { useState, useEffect, useRef } from "react";
// FIX: Use real NextAuth signIn
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2, Lock, BrainCircuit, Moon, Sun } from "lucide-react";

// --- REUSED PARTICLE CANVAS ---
const ParticleCanvas = ({ isDark }: { isDark: boolean }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    // ... (Keep the exact same particle logic from previous step to save space) ...
    // If you need the full particle code again, copy it from the previous turn's Login Page.
    // For brevity, assuming ParticleCanvas logic is here.
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);
        let particles: any[] = [];
        let animationFrameId: number;
        const config = { particleCount: 60, mouseRadius: 150, baseColor: isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)", highlightColor: "rgba(249, 115, 22, 0.6)", lineColor: "rgba(249, 115, 22, 0.15)" };
        const mouse = { x: -1000, y: -1000 };
        class Particle {
            x: number; y: number; vx: number; vy: number; size: number; baseAlpha: number; currentAlpha: number;
            constructor() { this.x = Math.random() * width; this.y = Math.random() * height; this.vx = (Math.random() - 0.5) * 0.3; this.vy = (Math.random() - 0.5) * 0.3; this.size = Math.random() * 1.5; this.baseAlpha = Math.random() * 0.3 + 0.1; this.currentAlpha = this.baseAlpha; }
            update() { this.x += this.vx; this.y += this.vy; if (this.x < 0 || this.x > width) this.vx *= -1; if (this.y < 0 || this.y > height) this.vy *= -1; const dx = mouse.x - this.x; const dy = mouse.y - this.y; const distance = Math.sqrt(dx * dx + dy * dy); if (distance < config.mouseRadius) { this.currentAlpha = Math.min(this.baseAlpha + 0.5, 1); ctx!.beginPath(); ctx!.strokeStyle = config.lineColor; ctx!.lineWidth = 0.5; ctx!.moveTo(this.x, this.y); ctx!.lineTo(mouse.x, mouse.y); ctx!.stroke(); ctx!.fillStyle = config.highlightColor; } else { this.currentAlpha = this.baseAlpha; ctx!.fillStyle = config.baseColor; } }
            draw() { ctx!.globalAlpha = this.currentAlpha; ctx!.beginPath(); ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx!.fill(); }
        }
        const init = () => { particles = []; for (let i = 0; i < config.particleCount; i++) { particles.push(new Particle()); } };
        const animate = () => { ctx.clearRect(0, 0, width, height); particles.forEach((p) => { p.update(); p.draw(); }); animationFrameId = requestAnimationFrame(animate); };
        const handleResize = () => { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; init(); };
        const handleMouseMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
        window.addEventListener("resize", handleResize); window.addEventListener("mousemove", handleMouseMove); init(); animate();
        return () => { window.removeEventListener("resize", handleResize); window.removeEventListener("mousemove", handleMouseMove); cancelAnimationFrame(animationFrameId); };
    }, [isDark]);
    return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none" />;
};

export default function LoginPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [email, setEmail] = useState("");
    const [isDark, setIsDark] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem("cashflow_theme");
        if (savedTheme) setIsDark(savedTheme === "dark");

        // Auto-redirect if already logged in
        if (status === "authenticated") {
            router.push("/dashboard");
        }
    }, [status, router]);

    const toggleTheme = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        localStorage.setItem("cashflow_theme", newTheme ? "dark" : "light");
    };

    const handleGoogleLogin = () => {
        // REAL GOOGLE LOGIN
        signIn("google", { callbackUrl: "/dashboard" });
    };

    const handleEmailLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Note: Email/Password requires a database adapter usually. 
        // For now, we simulate email login or you can add CredentialsProvider later.
        // We will simulate it for now to match the "Google is primary" request.
        setTimeout(() => {
            alert("For the Beta, please use 'Continue with Google'.");
            setIsLoading(false);
        }, 1000);
    };

    return (
        <div className={`min-h-screen flex flex-col justify-center items-center p-6 font-sans transition-colors duration-300 relative overflow-hidden ${isDark ? 'bg-[#020202] text-zinc-300' : 'bg-zinc-50 text-zinc-600'}`}>

            <ParticleCanvas isDark={isDark} />

            <div className={`fixed inset-0 pointer-events-none ${isDark ? '' : 'opacity-50'}`}>
                <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-orange-500/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] bg-amber-500/10 blur-[100px] rounded-full"></div>
            </div>

            <div className="absolute top-6 right-6 z-50">
                <button onClick={toggleTheme} className={`p-2 rounded-full transition-colors ${isDark ? 'text-zinc-400 hover:text-white bg-white/5' : 'text-zinc-500 hover:text-black bg-zinc-200'}`}>
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>

            <Link href="/" className={`absolute top-8 left-8 flex items-center gap-2 transition-colors z-50 ${isDark ? 'text-zinc-500 hover:text-white' : 'text-zinc-500 hover:text-black'}`}>
                <ArrowLeft size={16} /> Back
            </Link>

            <div className={`max-w-md w-full p-8 rounded-3xl shadow-2xl border relative z-10 backdrop-blur-xl ${isDark ? 'bg-[#09090b]/80 border-white/10' : 'bg-white/80 border-zinc-200'}`}>

                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-gradient-to-tr from-orange-500 to-amber-600 rounded-xl flex items-center justify-center text-white font-bold mx-auto mb-4 shadow-lg shadow-orange-500/20">
                        <BrainCircuit size={24} />
                    </div>
                    <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Welcome to CashFlow+</h1>
                    <p className="text-zinc-500 mt-2 text-sm">Sign in to access your financial co-pilot.</p>
                </div>

                {/* GOOGLE BUTTON */}
                <button
                    onClick={handleGoogleLogin}
                    className={`w-full flex items-center justify-center gap-3 p-3 rounded-xl font-medium transition-all mb-6 relative border ${isDark
                            ? 'bg-white text-black hover:bg-zinc-200 border-transparent'
                            : 'bg-white text-black border-zinc-200 hover:bg-zinc-50'
                        }`}
                >
                    {status === "loading" ? (
                        <Loader2 className="animate-spin text-zinc-400" />
                    ) : (
                        <>
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                            <span>Continue with Google</span>
                        </>
                    )}
                </button>

                <div className="relative mb-6">
                    <div className={`absolute inset-0 flex items-center ${isDark ? 'opacity-20' : 'opacity-10'}`}>
                        <div className={`w-full border-t ${isDark ? 'border-white' : 'border-black'}`}></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase tracking-widest">
                        <span className={`px-2 ${isDark ? 'bg-[#09090b] text-zinc-500' : 'bg-white text-zinc-400'}`}>Or continue with email</span>
                    </div>
                </div>

                {/* EMAIL FORM */}
                <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div>
                        <label className={`block text-xs font-medium mb-1.5 ml-1 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Work Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="founder@company.com"
                            className={`w-full p-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/50 transition-all border ${isDark
                                    ? 'bg-black/50 border-white/10 text-white placeholder-zinc-600'
                                    : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400'
                                }`}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white p-3 rounded-xl font-bold hover:shadow-[0_0_20px_-5px_rgba(249,115,22,0.4)] transition-all flex justify-center items-center gap-2"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : "Sign In"}
                    </button>
                </form>

                <p className={`text-center text-[10px] mt-6 flex items-center justify-center gap-1 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                    <Lock size={10} /> Secure 256-bit Encryption
                </p>
            </div>
        </div>
    );
}