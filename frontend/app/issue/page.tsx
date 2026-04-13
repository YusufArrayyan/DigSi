"use client";

import { useState } from "react";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { motion, AnimatePresence } from "framer-motion";
import { FilePlus, ShieldCheck, Download, User, BookOpen, Calendar, Hash, ArrowRight, CheckCircle2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAdmin } from "@/context/AdminContext";

export default function IssuePage() {
  const [studentName, setStudentName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [serialNumber, setSerialNumber] = useState("");

  const [loading, setLoading] = useState(false);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const { callApi } = useAdmin();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setQrImage(null);

    try {
      const res = await callApi(`${API_BASE_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serial_number: serialNumber || `DG-${Date.now().toString().slice(-4)}`,
          student_name: studentName,
          course_name: courseName,
          issue_date: issueDate,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setQrImage(data.qr_image_base64);
        setSignature(data.signature);
      } else {
        alert("Gagal menerbitkan sertifikat.");
      }
    } catch (err) {
      alert("Network Error: Hubungkan ke server backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutWrapper>
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end gap-6 text-center md:text-left">
            <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-20 h-20 clay-button !bg-blue-600 flex items-center justify-center mx-auto md:mx-0 shrink-0"
            >
                <ShieldCheck className="text-white w-10 h-10" />
            </motion.div>
            <div className="pb-2">
                <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-tight">Secure Issue Portal</h1>
                <p className="text-slate-500 font-medium italic">"Crypt your certificate" — Sematkan segel keamanan digital pada dokumen Anda.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Form Section */}
            <div className="lg:col-span-12 xl:col-span-7">
                <div className="clay-card p-10 bg-white space-y-8">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-6">
                        <FilePlus className="text-blue-500 w-6 h-6" />
                        <h3 className="font-bold text-xl text-slate-800 tracking-tight">Data Sertifikat Digital</h3>
                    </div>

                    <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 col-span-1 md:col-span-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Nama Mahasiswa / Penerima</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                <input required value={studentName} onChange={(e) => setStudentName(e.target.value)} type="text" className="w-full clay-input p-4 pl-12 text-slate-700 font-bold" placeholder="Contoh: Yusuf Arrayyan" />
                            </div>
                        </div>

                        <div className="space-y-2 col-span-1 md:col-span-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Nama Program / Kursus</label>
                            <div className="relative">
                                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                <input required value={courseName} onChange={(e) => setCourseName(e.target.value)} type="text" className="w-full clay-input p-4 pl-12 text-slate-700 font-bold" placeholder="Contoh: Kriptografi Lanjut" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Tanggal Terbit</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                <input required value={issueDate} onChange={(e) => setIssueDate(e.target.value)} type="date" className="w-full clay-input p-4 pl-12 text-slate-700 font-bold" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Serial Number (Opsional)</label>
                            <div className="relative">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                <input value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} type="text" className="w-full clay-input p-4 pl-12 text-slate-700 font-bold" placeholder="DIGSI-001" />
                            </div>
                        </div>

                        <motion.button 
                            whileTap={{ scale: 0.95 }}
                            disabled={loading} 
                            type="submit" 
                            className="w-full clay-button py-5 !bg-blue-600 text-white font-black uppercase tracking-widest active:scale-95 transition-all md:col-span-2 flex items-center justify-center gap-4 mt-4 disabled:opacity-50"
                        >
                            {loading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" /> : (
                                <>
                                    Generate DigSi Seal
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </motion.button>
                    </form>
                </div>
            </div>

            {/* Results Section */}
            <div className="lg:col-span-12 xl:col-span-5 space-y-8">
                <AnimatePresence mode="wait">
                    {qrImage ? (
                        <motion.div 
                            key="seal"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="clay-card p-10 bg-white flex flex-col items-center text-center space-y-6"
                        >
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">DigSi Seal Ready!</h3>
                            <p className="text-xs text-slate-400 font-medium">Tempelkan segel QR ini pada sertifikat fisik atau digital Anda.</p>
                            
                            <div className="p-4 clay-card bg-slate-50 border-8 border-white shadow-xl relative group">
                                <img src={`data:image/png;base64,${qrImage}`} alt="DigSi Seal" className="w-48 h-48 grayscale hover:grayscale-0 transition-all duration-500" />
                                <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors pointer-events-none rounded-2xl"></div>
                            </div>
                            
                            <div className="w-full space-y-3">
                                <motion.a 
                                    whileTap={{ scale: 0.95 }}
                                    href={`data:image/png;base64,${qrImage}`} 
                                    download={`DigSi-Seal-${serialNumber || 'Cert'}.png`}
                                    className="w-full clay-button py-4 !bg-blue-500 text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 active:scale-95 transition-all"
                                >
                                    <Download className="w-4 h-4" />
                                    Unduh QR Seal
                                </motion.a>
                                <p className="text-[10px] text-slate-300 font-mono break-all line-clamp-2">Sign: {signature}</p>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="clay-card p-12 bg-slate-50/50 border-4 border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-6 min-h-[400px]">
                            <div className="w-20 h-20 bg-slate-200/50 rounded-full flex items-center justify-center">
                                <BookOpen className="text-slate-300 w-10 h-10" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-300 text-xl tracking-tight">Hasil Preview</h4>
                                <p className="text-xs text-slate-300 font-medium max-w-[200px] mt-2">Isi form di sebelah kiri untuk melihat preview segel kriptografi Anda.</p>
                            </div>
                        </div>
                    )}
                </AnimatePresence>

                <div className="clay-card p-8 bg-blue-50/50 space-y-4">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2 text-sm italic">
                        Security Notice:
                    </h4>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                        Setiap "DigSi Seal" yang diterbitkan mengandung **Digital Signature RSA-2048**. Perubahan sekecil apapun pada Nama, Kursus, atau Tanggal akan membatalkan validitas tanda tangan saat diverifikasi di kemudian hari.
                    </p>
                </div>
            </div>

        </div>
      </div>
    </LayoutWrapper>
  );
}
