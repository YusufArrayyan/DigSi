"use client";

import { useState, useEffect, useRef } from "react";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, FilePlus, Calendar, ShieldCheck, Database, ArrowUpCircle, Info, Inbox, Check, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdmin } from "@/context/AdminContext";

interface Submission {
    id: string;
    file_hash: string;
    student_name: string;
    course_name: string;
    issue_date: string;
}

export default function AdminPage() {
  const [studentName, setStudentName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [fileHash, setFileHash] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ message: string; success: boolean } | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  
  const { callApi } = useAdmin();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
        const res = await callApi("http://127.0.0.1:8080/api/pending-submissions");
        const data = await res.json();
        setSubmissions(data.submissions || []);
    } catch (e) {
        console.error("Failed to fetch submissions");
    }
  };

  const calculateHash = async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      setFileHash(hashHex);
      setStatus({ message: `Hash hitung: ${hashHex.substring(0, 15)}...`, success: true });
    } catch (e) {
      setStatus({ message: "Gagal membaca file.", success: false });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileHash) return;
    setLoading(true);
    try {
      const res = await callApi("http://127.0.0.1:8080/api/register-hash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_hash: fileHash, student_name: studentName, course_name: courseName, issue_date: issueDate }),
      });
      if (res.ok) {
        setStatus({ message: "Sertifikat Berhasil Di-Registrasi!", success: true });
        setStudentName(""); setCourseName(""); setIssueDate(""); setFileHash("");
      }
    } finally { setLoading(false); }
  };

  const handleApprove = async (id: string) => {
      try {
          const res = await callApi("http://127.0.0.1:8080/api/approve-hash", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id }),
          });
          if (res.ok) {
              setSubmissions(prev => prev.filter(s => s.id !== id));
          }
      } catch (e) { alert("Gagal menyetujui."); }
  };

  return (
    <LayoutWrapper>
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end gap-6 text-center md:text-left">
            <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-20 h-20 clay-button !bg-blue-600 flex items-center justify-center mx-auto md:mx-0 shrink-0"
            >
                <ShieldCheck className="text-white w-10 h-10" />
            </motion.div>
            <div className="pb-2">
                <h1 className="text-4xl font-black text-slate-800 tracking-tight">Admin Control Hub</h1>
                <p className="text-slate-500 font-medium">Registrasi Hash & Verifikasi Pengajuan Komunitas.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
            
            {/* Left Column: Registration */}
            <div className="xl:col-span-7 space-y-8">
                <div className="clay-card p-10 bg-white space-y-8">
                   <div className="flex items-center gap-3 border-b border-slate-100 pb-6">
                        <FilePlus className="text-blue-500 w-6 h-6" />
                        <h3 className="font-bold text-xl text-slate-800 tracking-tight">Direct Hash Registration</h3>
                    </div>

                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                            "p-10 clay-card bg-white border-4 border-dashed border-slate-100 cursor-pointer flex flex-col items-center justify-center text-center space-y-4 hover:border-blue-400 hover:bg-blue-50 transition-all group",
                            fileHash ? "border-blue-400 bg-blue-50" : ""
                        )}
                    >
                        <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && calculateHash(e.target.files[0])} />
                        <div className={cn(
                            "w-16 h-16 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform",
                            fileHash ? "bg-blue-500 text-white" : "bg-blue-500 text-white"
                        )}>
                            {fileHash ? <Check className="w-8 h-8" /> : <ArrowUpCircle className="w-8 h-8" />}
                        </div>
                        <div>
                            <p className="font-bold text-slate-800 text-lg">{fileHash ? "Metrik File Tervalidasi" : "Pilih Sertifikat Final"}</p>
                            <p className="text-xs text-slate-400 font-medium">{fileHash ? `SHA-256: ${fileHash.substring(0,32)}...` : "Unggah file untuk didaftarkan ke ledger terpercaya."}</p>
                        </div>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Penerima</label>
                                <div className="relative">
                                    <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                    <input required value={studentName} onChange={(e) => setStudentName(e.target.value)} type="text" className="w-full clay-input p-4 pl-12 text-slate-700 font-bold" placeholder="Nama Mahasiswa" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Tanggal</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                    <input required value={issueDate} onChange={(e) => setIssueDate(e.target.value)} type="date" className="w-full clay-input p-4 pl-12 text-slate-700 font-bold text-sm" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Nama Program</label>
                            <div className="relative">
                                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                <input required value={courseName} onChange={(e) => setCourseName(e.target.value)} type="text" className="w-full clay-input p-4 pl-12 text-slate-700 font-bold" placeholder="Contoh: Digital Signature 101" />
                            </div>
                        </div>

                        <AnimatePresence>
                            {status && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn("p-4 rounded-3xl text-sm font-bold flex gap-3 items-center", status.success ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600")}>
                                    <Info className="w-5 h-5" />
                                    {status.message}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.button 
                            whileTap={{ scale: 0.95 }}
                            disabled={loading || !fileHash} 
                            type="submit" 
                            className="w-full clay-button py-5 !bg-blue-600 text-white font-black uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50"
                        >
                            {loading ? "Menyimpan ke Ledger..." : "Daftarkan Sertifikat"}
                        </motion.button>
                    </form>
                </div>
            </div>

            {/* Right Column: Verification Inbox */}
            <div className="xl:col-span-5 space-y-8">
                <div className="clay-card p-10 bg-white space-y-8 min-h-[500px]">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                        <div className="flex items-center gap-3">
                            <Inbox className="text-purple-500 w-6 h-6" />
                            <h3 className="font-bold text-xl text-slate-800 tracking-tight">Verification Inbox</h3>
                        </div>
                        <span className="bg-purple-100 text-purple-600 text-[10px] font-black px-3 py-1 rounded-full">{submissions.length} BARU</span>
                    </div>

                    <div className="space-y-4">
                        <AnimatePresence>
                            {submissions.length === 0 ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center text-center py-20 space-y-4 bg-slate-50/50 rounded-[2rem] border-4 border-white">
                                    <Clock className="w-12 h-12 text-slate-200" />
                                    <p className="text-slate-300 font-bold text-sm tracking-tight">Antrean Verifikasi Kosong</p>
                                </motion.div>
                            ) : (
                                submissions.map((sub) => (
                                    <motion.div 
                                        key={sub.id} 
                                        layout
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="clay-card p-5 bg-slate-50 border-2 border-white space-y-4"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-black text-slate-700 text-sm tracking-tight">{sub.student_name}</h4>
                                                <p className="text-[10px] text-slate-400 font-bold">{sub.course_name}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] text-slate-300 font-mono">{sub.issue_date}</p>
                                            </div>
                                        </div>
                                        <div className="bg-white/50 p-2 rounded-xl text-[8px] font-mono text-slate-400 truncate">
                                            HASH: {sub.file_hash}
                                        </div>
                                        <div className="flex gap-2">
                                            <motion.button 
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleApprove(sub.id)}
                                                className="flex-1 clay-button py-2 bg-blue-50 text-blue-600 font-black text-[9px] uppercase tracking-widest hover:!bg-blue-600 hover:!text-white transition-all"
                                            >
                                                VERIFIKASI
                                            </motion.button>
                                            <button className="flex-none clay-button p-2 text-red-300 hover:text-red-500 transition-colors">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="pt-4 border-t border-slate-50">
                        <div className="bg-blue-50/50 p-6 rounded-3xl flex gap-4 items-center">
                            <ShieldCheck className="text-blue-500 w-8 h-8 shrink-0" />
                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                                Tugas Admin adalah memvalidasi hash dokumen eksternal untuk dimasukkan kedalam Ledger Terpercaya DigSi.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </LayoutWrapper>
  );
}
