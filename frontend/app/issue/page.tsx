"use client";

import { useState } from "react";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { motion, AnimatePresence } from "framer-motion";
import { FilePlus, ShieldCheck, Download, User, BookOpen, Calendar, Hash, ArrowRight, CheckCircle2, Clock, ArrowUpCircle } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAdmin } from "@/context/AdminContext";

export default function IssuePage() {
  const [studentName, setStudentName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [fileHash, setFileHash] = useState("");

  const [loading, setLoading] = useState(false);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { isAdmin, callApi } = useAdmin();

  const extractMetadata = (filename: string) => {
    // Clean extension
    const name = filename.replace(/\.[^/.]+$/, "");
    
    // Heuristic: Split by common delimiters
    const parts = name.split(/[_\-\s]+/).filter(p => !["sertifikat", "cert", "certificate", "final"].includes(p.toLowerCase()));
    
    if (parts.length >= 2) {
      // Guess First part as Name, Second as Course
      setStudentName(parts[0].charAt(0).toUpperCase() + parts[0].slice(1));
      setCourseName(parts.slice(1).join(" "));
    } else if (parts.length === 1) {
      setStudentName(parts[0]);
    }
  };

  const calculateHash = async (file: File) => {
    setLoading(true); // Scanning effect
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    
    setTimeout(() => {
        setFileHash(hashHex);
        extractMetadata(file.name);
        setLoading(false);
    }, 800);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const endpoint = isAdmin ? "/api/generate" : "/api/submit-for-approval";
      // Ensure the payload matches backend expectations
      const payload = isAdmin ? {
        serial_number: serialNumber || `DG-${Date.now().toString().slice(-4)}`,
        student_name: studentName,
        course_name: courseName,
        issue_date: issueDate,
      } : {
        file_hash: fileHash,
        student_name: studentName,
        course_name: courseName,
        issue_date: issueDate,
      };

      const res = await callApi(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        if (isAdmin) {
          setQrImage(data.qr_image_base64);
          setSignature(data.signature);
        } else {
          setSuccess(true);
          setStudentName(""); setCourseName(""); setIssueDate(""); setFileHash("");
        }
      } else {
        alert(data.error || "Gagal memproses pengajuan.");
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
                <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-tight">
                    {isAdmin ? "Secure Issue Portal" : "Submit for Verification"}
                </h1>
                <p className="text-slate-500 font-medium italic">
                    {isAdmin ? '"Crypt your certificate" — Sematkan segel keamanan digital.' : "Kirim sertifikat Anda untuk divalidasi oleh Admin."}
                </p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            <div className="lg:col-span-12 xl:col-span-7">
                <div className="clay-card p-10 bg-white space-y-8">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-6">
                        <FilePlus className="text-blue-500 w-6 h-6" />
                        <h3 className="font-bold text-xl text-slate-800 tracking-tight">Data Sertifikat</h3>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {!isAdmin && (
                            <div className="space-y-4 col-span-1 md:col-span-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Upload Draft Sertifikat</label>
                                <motion.div 
                                    whileHover={{ scale: 1.01 }}
                                    className={cn(
                                        "p-8 clay-card bg-white border-4 border-dashed border-slate-100 flex flex-col items-center justify-center text-center space-y-4 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group",
                                        fileHash ? "border-blue-400 bg-blue-50" : ""
                                    )}
                                    onClick={() => document.getElementById("file-upload")?.click()}
                                >
                                    <input 
                                        id="file-upload"
                                        type="file" 
                                        className="hidden" 
                                        onChange={(e) => e.target.files?.[0] && calculateHash(e.target.files[0])} 
                                    />
                                    <div className={cn(
                                        "w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all",
                                        fileHash ? "bg-blue-500 text-white" : "bg-blue-50 text-blue-500 group-hover:bg-blue-500 group-hover:text-white"
                                    )}>
                                        <ArrowUpCircle className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800">{fileHash ? "Sertifikat Terdeteksi" : "Klik atau Tarik File Disini"}</p>
                                        <p className="text-[10px] text-slate-400 font-medium">{fileHash ? `HASH divalidasi: ${fileHash.slice(0, 20)}...` : "File Anda akan dipindai untuk ekstraksi data otomatis."}</p>
                                    </div>
                                </motion.div>
                            </div>
                        )}

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

                        {isAdmin && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Serial Number (Opsional)</label>
                                <div className="relative">
                                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                    <input value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} type="text" className="w-full clay-input p-4 pl-12 text-slate-700 font-bold" placeholder="DIGSI-001" />
                                </div>
                            </div>
                        )}

                        <motion.button 
                            whileTap={{ scale: 0.95 }}
                            disabled={loading || (!isAdmin && !fileHash)} 
                            type="submit" 
                            className="w-full clay-button py-5 !bg-blue-600 text-white font-black uppercase tracking-widest active:scale-95 transition-all md:col-span-2 flex items-center justify-center gap-4 mt-4 disabled:opacity-50"
                        >
                            {loading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" /> : (
                                <>
                                    {isAdmin ? "Generate DigSi Seal" : "Kirim ke Admin"}
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
                    ) : success ? (
                        <motion.div 
                            key="success"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="clay-card p-10 bg-white flex flex-col items-center text-center space-y-6"
                        >
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Berhasil Terkirim!</h3>
                            <p className="text-sm text-slate-400 font-medium">Sertifikat Anda telah dikirim ke antrean verifikasi Admin.</p>
                            <div className="p-8 clay-card bg-blue-50 border-4 border-white">
                                <Clock className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Menunggu Validasi Admin</p>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="clay-card p-12 bg-slate-50/50 border-4 border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-6 min-h-[400px]">
                            <div className="w-20 h-20 bg-slate-200/50 rounded-full flex items-center justify-center">
                                <BookOpen className="text-slate-300 w-10 h-10" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-300 text-xl tracking-tight">Hasil Preview</h4>
                                <p className="text-xs text-slate-300 font-medium max-w-[200px] mt-2">Isi form di sebelah kiri untuk mengirim sertifikat Anda ke sistem.</p>
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
