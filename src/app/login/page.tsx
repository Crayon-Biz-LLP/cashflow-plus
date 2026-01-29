"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2, Lock } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);
        // SIMULATE API CALL
        setTimeout(() => {
            localStorage.setItem("user_email", email); // CAPTURE LEAD
            localStorage.setItem("is_logged_in", "true");
            router.push("/dashboard");
        }, 1500);
    };

    const handleGoogleLogin = () => {
        setIsGoogleLoading(true);
        setTimeout(() => {
            localStorage.setItem("user_email", "demo-google-user@gmail.com");
            localStorage.setItem("is_logged_in", "true");
            router.push("/dashboard");
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 text-slate-900 font-sans">

            <Link href="/" className="absolute top-8 left-8 text-slate-500 hover:text-slate-900 flex items-center gap-2 transition-colors">
                <ArrowLeft size={16} /> Back to Home
            </Link>

            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold mx-auto mb-4 shadow-lg shadow-blue-200">
                        C
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Welcome to CashFlow+</h1>
                    <p className="text-slate-500 mt-2">Sign in to predict your runway.</p>
                </div>

                {/* GOOGLE BUTTON */}
                <button
                    onClick={handleGoogleLogin}
                    disabled={isGoogleLoading}
                    className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 p-3 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition-all mb-6 relative"
                >
                    {isGoogleLoading ? (
                        <Loader2 className="animate-spin text-slate-400" />
                    ) : (
                        <>
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                            <span>Continue with Google</span>
                        </>
                    )}
                </button>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-slate-400">Or continue with email</span>
                    </div>
                </div>

                {/* EMAIL FORM */}
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Work Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="founder@company.com"
                            className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-slate-900 text-white p-3 rounded-lg font-bold hover:bg-slate-800 transition-all flex justify-center items-center gap-2"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : "Sign In"}
                    </button>
                </form>

                <p className="text-center text-xs text-slate-400 mt-6 flex items-center justify-center gap-1">
                    <Lock size={12} /> Secure 256-bit Encryption
                </p>
            </div>

            <div className="mt-8 text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                    <CheckCircle2 size={16} className="text-green-500" /> No credit card required
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                    <CheckCircle2 size={16} className="text-green-500" /> 7-Day Free Trial included
                </div>
            </div>

        </div>
    );
}