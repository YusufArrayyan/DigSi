"use client";

import { useState } from "react";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { motion, AnimatePresence } from "framer-motion";
import { useAdmin } from "@/context/AdminContext";
import { Shield, User, Lock, ArrowRight, Fingerprint, Mail, Key } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const { login, register } = useAdmin();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (isLogin) {
            const success = await login(username, password);
            if (success) {
                router.push("/");
            } else {
                setError("Ouch! Username atau password salah.");
            }
        } else {
            const res = await register(username, password);
            if (res.success) {
                alert("Registrasi Berhasil! Silakan login sekarang.");
                setIsLogin(true);
            } else {
                setError(res.error || "Gagal membuat akun.");
            }
        }
        setLoading(false);
    };

    return (
        <LayoutWrapper>
            <div className="min-h-[80vh] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="w-full max-w-md"
                >
                    {/* Header Icon */}
                    <div className="flex justify-center mb-8">
                        <motion.div 
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 1 }}
                            className="w-20 h-20 bg-blue-500 rounded-[2rem] flex items-center justify-center shadow-xl shadow-blue-200"
                        >
                            <Shield className="text-white w-10 h-10" />
                        </motion.div>
                    </div>

                    <div className="clay-card bg-white p-8 md:p-12 space-y-8">
                        <div className="text-center space-y-2">
                            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                                {isLogin ? "Welcome Back" : "Join the Identity"}
                            </h1>
                            <p className="text-slate-400 font-medium text-sm">
                                {isLogin ? "Masuk ke dashboard administrasi DigSi" : "Daftar sebagai administrator sistem"}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                {/* Username Input */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Username</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <input 
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="yusuf_arrayyan"
                                            className="w-full clay-input py-4 pl-12 pr-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-200"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Password Input */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Password</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <input 
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full clay-input py-4 pl-12 pr-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-200"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="bg-red-50 text-red-500 p-4 rounded-2xl text-xs font-bold text-center border border-red-100"
                                    >
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button 
                                type="submit"
                                disabled={loading}
                                className={cn(
                                    "w-full clay-button py-4 flex items-center justify-center gap-3 !text-white font-black uppercase tracking-widest text-xs transition-all shadow-xl",
                                    loading ? "!bg-slate-300 pointer-events-none" : "!bg-blue-600 hover:!bg-blue-700 shadow-blue-100"
                                )}
                            >
                                {loading ? "Memproses..." : isLogin ? "Login Now" : "Create Account"}
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>

                        <div className="text-center">
                            <button 
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-[11px] font-black uppercase text-slate-400 tracking-widest hover:text-blue-500 transition-colors"
                            >
                                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                            </button>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <p className="text-center mt-8 text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">
                        DigSi &copy; Secure Identity Protocol
                    </p>
                </motion.div>
            </div>
        </LayoutWrapper>
    );
}
