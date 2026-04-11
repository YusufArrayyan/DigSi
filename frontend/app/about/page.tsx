"use client";

import { LayoutWrapper } from "@/components/LayoutWrapper";
import { motion } from "framer-motion";
import { Globe, Shield, Code, Zap, Fingerprint, Heart, ArrowRight } from "lucide-react";

const GithubIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="white">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
    </svg>
);

const TechCard = ({ icon: Icon, name }: { icon: any; name: string }) => (
    <div className="clay-card bg-white p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
            <Icon className="w-5 h-5" />
        </div>
        <span className="font-bold text-slate-700 text-sm tracking-tight">{name}</span>
    </div>
);

export default function AboutPage() {
    return (
        <LayoutWrapper>
            <div className="max-w-4xl mx-auto space-y-16 py-8">
                
                {/* Vision Section */}
                <div className="text-center space-y-6">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-blue-200"
                    >
                        <Shield className="text-white w-10 h-10" />
                    </motion.div>
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight">The Story of DigSi</h1>
                        <p className="text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
                            Membangun ekosistem digital yang didasari oleh kepercayaan mutlak. DigSi lahir dari kebutuhan akan sistem verifikasi yang tak terbantahkan di era informasi yang cair.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                    
                    {/* Developer Card */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Developer Behind This</h3>
                        <motion.div 
                            whileHover={{ y: -10 }}
                            className="clay-card bg-white p-10 space-y-8 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
                            
                            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                                <div className="w-24 h-24 rounded-[2.5rem] bg-slate-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-xl">
                                    <Fingerprint className="w-12 h-12 text-blue-500" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Yusuf Arrayyan</h2>
                                    <p className="text-blue-500 font-bold text-sm">Fullstack Developer & Security Enthusiast</p>
                                </div>
                                <p className="text-slate-500 text-sm font-medium leading-relaxed italic">
                                    "Menyatukan kekuatan kriptografi militer dengan estetika modern untuk menciptakan pengalaman digital yang aman dan memukau."
                                </p>
                                                               <div className="flex gap-4 w-full pt-4">
                                    <a 
                                        href="https://github.com/YusufArrayyan" 
                                        target="_blank" 
                                        className="flex-1 clay-button !bg-slate-900 !text-white py-4 flex items-center justify-center gap-3 font-black text-xs transition-transform active:scale-95 shadow-xl"
                                    >
                                        <GithubIcon className="w-5 h-5" />
                                        GITHUB
                                    </a>
                                    <a 
                                        href="https://linkedin.com/in/yusuf-arrayyan/" 
                                        target="_blank" 
                                        className="flex-1 clay-button bg-white text-blue-600 py-4 flex items-center justify-center gap-3 font-black text-xs transition-transform active:scale-95"
                                    >
                                        <LinkedinIcon className="w-5 h-5 shadow-sm" />
                                        LINKEDIN
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Tech Stack & Features */}
                    <div className="space-y-8">
                        <div className="space-y-6">
                            <h3 className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Engineered With</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <TechCard icon={Zap} name="Next.js 15" />
                                <TechCard icon={Code} name="Go Fiber" />
                                <TechCard icon={Shield} name="RSA-2048" />
                                <TechCard icon={Globe} name="Tailwind v4" />
                            </div>
                        </div>

                        <div className="clay-card !bg-blue-600 p-8 !text-white space-y-4 shadow-xl">
                            <div className="flex items-center gap-3">
                                <Heart className="!text-white fill-white w-5 h-5" />
                                <h4 className="font-black tracking-tight uppercase text-xs">Open for Collaboration</h4>
                            </div>
                            <p className="text-[11px] !text-blue-50 font-bold leading-relaxed">
                                DigSi adalah proyek open-source yang terus berkembang. Jika Anda tertarik untuk berkontribusi atau memiliki ide untuk meningkatkan keamanan sistem, jangan ragu untuk menghubungi melalui kanal sosial di samping.
                            </p>
                            <button className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group !text-white/80 hover:!text-white transition-colors">
                                Learn More 
                                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Quote */}
                <div className="text-center pt-8 border-t border-slate-100">
                    <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.3em]">
                        DigSi &copy; 2026 | Built with absolute precision
                    </p>
                </div>

            </div>
        </LayoutWrapper>
    );
}
