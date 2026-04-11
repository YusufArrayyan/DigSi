"use client";

import React from "react";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { motion } from "framer-motion";
import { ShieldCheck, Zap, Lock, Globe, ArrowRight, Fingerprint, Activity, Database } from "lucide-react";
import Link from "next/link";

const FeatureCard = ({ icon: Icon, title, desc, color }: { icon: any; title: string; desc: string; color: string }) => (
  <motion.div 
    whileHover={{ y: -8, scale: 1.02 }}
    className="clay-card bg-white p-10 flex flex-col items-center text-center space-y-4"
  >
    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-2 shadow-lg ${color}`}>
        <Icon className="text-white w-8 h-8" />
    </div>
    <h3 className="text-xl font-bold text-slate-800">{title}</h3>
    <p className="text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
  </motion.div>
);

const StatCard = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
    <div className="clay-card bg-white p-6 flex items-center gap-6">
        <div className="w-12 h-12 bg-white clay-button rounded-2xl flex items-center justify-center">
            <Icon className="text-blue-500 w-6 h-6" />
        </div>
        <div className="text-left">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</p>
            <p className="text-2xl font-black text-slate-700">{value}</p>
        </div>
    </div>
)

export default function DashboardPage() {
  const [stats, setStats] = React.useState({
    total_certificates: 0,
    today_verifications: 0,
    network_status: "Connecting..."
  });

  React.useEffect(() => {
    fetch("http://127.0.0.1:8080/api/stats")
      .then(res => res.json())
      .then(data => {
        setStats(data);
      })
      .catch(() => {
        setStats(prev => ({ ...prev, network_status: "Offline" }));
      });
  }, []);

  return (
    <LayoutWrapper>
      <div className="space-y-16 py-8">
        
        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:text-left text-center">
          <div className="flex-1 space-y-8">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="inline-flex items-center gap-2 px-6 py-2 bg-blue-50 text-blue-600 rounded-full font-bold text-xs shadow-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              Sertifikasi Digital Terpercaya v2.0
            </motion.div>
            <h1 className="text-5xl lg:text-7xl font-black text-slate-800 tracking-tight leading-[1.1]">
                Keamanan <br/>
                <span className="text-blue-500">Kriptografi</span> <br/>
                Dalam Genggaman.
            </h1>
            <p className="text-lg text-slate-500 font-medium max-w-xl">
                Verifikasi keaslian dokumen Anda menggunakan teknologi RSA-2048 dan Digital Signature. Mudah, Cepat, dan Tak Terbantahkan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Link href="/verify">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} className="clay-button px-10 py-5 !bg-blue-500 text-white font-black uppercase tracking-widest text-sm flex items-center gap-2 hover:bg-blue-600 cursor-pointer">
                  Mulai Verifikasi
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              </Link>
              <Link href="/admin">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} className="clay-button px-10 py-5 bg-white text-slate-600 font-black uppercase tracking-widest text-sm cursor-pointer">
                  Admin Panel
                </motion.div>
              </Link>
            </div>
          </div>

          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex-1 relative"
          >
             <div className="w-full aspect-square clay-card bg-white p-12 flex items-center justify-center transform rotate-3">
                <Fingerprint className="w-48 h-48 text-blue-500 opacity-20 absolute" />
                <div className="relative z-10 p-8 clay-card bg-blue-50/50 shadow-2xl">
                   <Lock className="w-24 h-24 text-blue-500" />
                </div>
             </div>
             {/* Decorative small card */}
             <div className="absolute -bottom-10 -left-10 clay-card p-6 bg-blue-100 transform -rotate-6 hidden md:block">
                <CheckCircle2 className="text-blue-500 w-12 h-12" />
             </div>
          </motion.div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatCard icon={Database} label="Total Sertifikat" value={stats.total_certificates.toLocaleString()} />
            <StatCard icon={Activity} label="Verifikasi Simulasi" value={stats.today_verifications.toString()} />
            <StatCard icon={Globe} label="Jaringan Nodes" value={stats.network_status} />
        </div>

        {/* Features Grid */}
        <div className="space-y-12">
           <div className="text-center">
              <h2 className="text-3xl font-black text-slate-800 italic">Mengapa DigSi?</h2>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={Zap} 
                color="bg-amber-400" 
                title="Super Cepat" 
                desc="Validasi tanda tangan digital kurang dari 1 detik menggunakan akselerasi perangkat keras." 
              />
              <FeatureCard 
                icon={ShieldCheck} 
                color="bg-blue-500" 
                title="Kriptografi Militer" 
                desc="Enkripsi RSA-2048 memastikan dokumen Anda tidak bisa dipalsukan oleh siapapun." 
              />
              <FeatureCard 
                icon={Fingerprint} 
                color="bg-purple-500" 
                title="Hash Integritas" 
                desc="Cukup upload file untuk mengetahui apakah ada perubahan meski hanya 1 byte." 
              />
           </div>
        </div>

        {/* Info Footer Callout */}
        <div className="clay-card p-12 bg-white text-center space-y-6">
            <h3 className="text-2xl font-bold text-slate-800">Siap Mengamankan Dokumen Anda?</h3>
            <p className="text-slate-500 max-w-2xl mx-auto">Bergabunglah dengan ribuan mahasiswa dan instansi yang telah menggunakan DigSi untuk menjamin keabsahan sertifikat digital mereka.</p>
            <Link href="/issue">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block clay-button px-12 py-5 !bg-slate-900 text-white font-black uppercase tracking-widest text-sm cursor-pointer mt-4">
                  Daftar Sekarang
              </motion.div>
            </Link>
        </div>

      </div>
    </LayoutWrapper>
  );
}

const CheckCircle2 = ({ className }: { className: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
)
