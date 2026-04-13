"use client";

import { useState, useRef, useEffect } from "react";
import jsQR from "jsqr";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, CheckCircle2, AlertTriangle, Fingerprint, Lock, Search, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { API_BASE_URL } from "@/lib/api";

interface VerificationResult {
  signature_valid: boolean;
  message: string;
  error?: string;
  reason?: string;
  metadata?: any;
}

export default function VerificationPage() {
  const [serialNumber, setSerialNumber] = useState("");
  const [signature, setSignature] = useState("");
  const [studentName, setStudentName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [issueDate, setIssueDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [useCamera, setUseCamera] = useState(false);
  const [qrDetected, setQrDetected] = useState<boolean | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("pdfjs-dist").then((pdfjs) => {
        if (!pdfjs.GlobalWorkerOptions.workerSrc) {
          pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
        }
      });
    }
  }, []);

  // Camera handling logic
  useEffect(() => {
    let animationFrameId: number;
    const startCamera = async () => {
      if (useCamera && navigator.mediaDevices) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
            streamRef.current = stream;
            scanCameraFrame();
          }
        } catch (e) {
          alert("Gagal mengakses kamera.");
          setUseCamera(false);
        }
      }
    };

    const stopCamera = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };

    const scanCameraFrame = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });
          if (code && autofillFields(code.data)) {
            setUseCamera(false);
            stopCamera();
            return;
          }
        }
      }
      if (useCamera) animationFrameId = requestAnimationFrame(scanCameraFrame);
    };

    if (useCamera) startCamera();
    else stopCamera();
    return () => stopCamera();
  }, [useCamera]);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setResult(null);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    try {
      const res = await fetch(`${API_BASE_URL}/api/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serial_number: serialNumber,
          signature: signature,
          student_name: studentName,
          course_name: courseName,
          issue_date: issueDate,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ signature_valid: false, message: "Koneksi ke server gagal." });
    } finally {
      setLoading(false);
    }
  };

  const autofillFields = (codeData: string) => {
    try {
      if (codeData.startsWith("http://") || codeData.startsWith("https://")) {
         setQrDetected(true);
         setResult({ signature_valid: false, message: "QR Code terdeteksi sebagai Link Eksternal.", error: "Ini adalah sertifikat dari sistem luar (misal: UGM/Kemenkes)." });
         return false; 
      }
      const data = JSON.parse(codeData);
      if (data.serial_number && data.signature) {
        setSerialNumber(data.serial_number);
        setStudentName(data.student_name);
        setCourseName(data.course_name);
        setIssueDate(data.issue_date);
        setSignature(data.signature);
        setQrDetected(true);
        return true;
      }
    } catch (e) { /* ignored */ }
    return false;
  };

  const applyBinarization = (imageData: ImageData, threshold: number) => {
    const d = imageData.data;
    for (let i = 0; i < d.length; i += 4) {
      const avg = (d[i] + d[i + 1] + d[i + 2]) / 3;
      const v = avg >= threshold ? 255 : 0;
      d[i] = d[i + 1] = d[i + 2] = v;
    }
    return imageData;
  };

  const verifyFileHash = async (file: File) => {
    setLoading(true);
    setResult(null);
    setQrDetected(false);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      const res = await fetch(`${API_BASE_URL}/api/verify-hash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_hash: hashHex }),
      });
      const data = await res.json();
      if (data.signature_valid && data.metadata) {
        setStudentName(data.metadata.student_name);
        setCourseName(data.metadata.course_name);
        setIssueDate(data.metadata.issue_date);
        setSerialNumber("VERIFIED BY FILE HASH");
        setSignature(hashHex);
      }
      setResult(data);
    } catch (err) {
      setResult({ signature_valid: false, message: "Network Error" });
    } finally {
      setLoading(false);
    }
  };

  const processImage = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: file.type });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = async () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const passes = [
        { name: "Original", filter: "none" },
        { name: "Contrast Extreme", filter: "grayscale(100%) contrast(400%)" },
        { name: "Binarized", filter: "grayscale(100%)", threshold: 140 }
      ];
      for (const pass of passes) {
        ctx.filter = pass.filter;
        ctx.drawImage(img, 0, 0);
        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        if (pass.threshold) imageData = applyBinarization(imageData, pass.threshold);
        const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "attemptBoth" });
        if (code && autofillFields(code.data)) return;
      }
      await verifyFileHash(file);
    };
    img.src = url;
  };

  const processPdf = async (file: File) => {
    try {
      const pdfjsLib = await import("pdfjs-dist");
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(new Uint8Array(arrayBuffer)).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: ctx, viewport: viewport } as any).promise;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "attemptBoth" });
      if (code && autofillFields(code.data)) return;
      await verifyFileHash(file);
    } catch (error) {
      alert("Gagal membaca PDF.");
    }
  };

  const handleFileDrop = (file: File) => {
    if (file.type === "application/pdf") processPdf(file);
    else if (file.type.startsWith("image/")) processImage(file);
  };

  return (
    <LayoutWrapper>
      <div className="flex flex-col items-center space-y-10">
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight">Portal Verifikasi</h1>
          <p className="text-slate-500 font-medium">Pastikan sertifikat Anda sah dan asli secara kriptografi.</p>
        </div>

        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Side: Upload & Camera */}
          <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div 
              whileHover={{ y: -5, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "p-10 clay-card bg-white flex flex-col items-center justify-center cursor-pointer text-center space-y-4 border-4 border-transparent transition-all",
                dragActive ? "border-blue-400 bg-blue-50" : ""
              )}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files[0]) handleFileDrop(e.dataTransfer.files[0]); }}
            >
              <input ref={fileInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileDrop(e.target.files[0])} />
              <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-2">
                <Upload className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Upload Dokumen</h3>
              <p className="text-xs text-slate-400">Tarik berkas sertifikat Anda ke sini atau klik untuk memilih file.</p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5, scale: 1.01 }}
              className="clay-card bg-white overflow-hidden relative min-h-[250px] flex flex-col items-center justify-center text-center space-y-4"
            >
              {useCamera ? (
                <div className="w-full h-full relative">
                   <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                   <div className="absolute inset-0 border-4 border-blue-500/40 m-8 rounded-3xl pointer-events-none"></div>
                   <button onClick={() => setUseCamera(false)} className="absolute top-4 right-4 clay-button text-[10px] px-4 py-2 text-red-500 font-bold uppercase">Tutup</button>
                </div>
              ) : (
                <div onClick={() => setUseCamera(true)} className="flex flex-col items-center cursor-pointer">
                   <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mb-2">
                    <Camera className="w-10 h-10 text-purple-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Scan via Kamera</h3>
                  <p className="text-xs text-slate-400">Gunakan kamera untuk memindai QR Code secara langsung.</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Form and Results Section */}
          <div className="lg:col-span-7 clay-card bg-white p-10 space-y-8">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-6">
                <Fingerprint className="text-blue-500" />
                <h3 className="font-bold text-xl text-slate-800">Detil Verifikasi</h3>
            </div>

            <form onSubmit={handleVerify} className="space-y-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Serial Number</label>
                 <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} type="text" className="w-full clay-input p-4 pl-12 text-slate-700 font-mono text-sm" placeholder="DIGSI-XXXX" />
                 </div>
               </div>
               
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">RSA Signature</label>
                 <div className="relative">
                    <Lock className="absolute left-4 top-4 w-4 h-4 text-slate-300" />
                    <textarea value={signature} onChange={(e) => setSignature(e.target.value)} rows={3} className="w-full clay-input p-4 pl-12 text-slate-500 font-mono text-[10px] resize-none" placeholder="Masukkan Signature" />
                 </div>
               </div>

               <motion.button 
                  whileTap={{ scale: 0.95 }}
                  disabled={loading} 
                  type="submit" 
                  className="w-full clay-button py-5 text-blue-600 !bg-white font-black uppercase tracking-widest flex items-center justify-center gap-4 active:scale-95 transition-all"
               >
                  {loading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600/20 border-t-blue-600" /> : "Verifikasi Sekarang"}
               </motion.button>
            </form>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6">
            <AnimatePresence mode="wait">
              {result && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={cn(
                    "clay-card p-10 flex flex-col items-center text-center space-y-6 relative overflow-hidden",
                    result.signature_valid ? "bg-emerald-50" : "bg-red-50"
                  )}
                >
                  <div className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center shadow-lg transform rotate-[-10deg]",
                    result.signature_valid ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                  )}>
                    {result.signature_valid ? <CheckCircle2 className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
                  </div>
                  <div className="space-y-2">
                    <h3 className={cn("text-2xl font-black uppercase tracking-tight", result.signature_valid ? "text-emerald-600" : "text-red-600")}>
                        {result.signature_valid ? "Sah & Valid" : "Dokumen Palsu"}
                    </h3>
                    <p className="text-slate-600 font-medium text-sm leading-relaxed">
                        {result.message}
                        {!result.signature_valid && qrDetected === false && <span className="block mt-2 text-[10px] opacity-70">Log: QR_DECODE_ERR | HASH_MISS</span>}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="clay-card bg-white p-8 bg-blue-50/50 space-y-4">
               <h4 className="font-bold text-slate-800 flex items-center gap-2">
                 <FileText className="w-4 h-4 text-blue-500" />
                 Panduan Cepat
               </h4>
               <ul className="text-[10px] text-slate-500 space-y-3 font-medium">
                 <li className="flex gap-2"><span>1.</span><span>Gunakan QR Code di sertifikat untuk deteksi otomatis.</span></li>
                 <li className="flex gap-2"><span>2.</span><span>Kamera paling optimal dalam kondisi cahaya terang.</span></li>
                 <li className="flex gap-2"><span>3.</span><span>Verifikasi file hash digunakan sebagai validasi sekunder.</span></li>
               </ul>
            </div>
          </div>

        </div>
      </div>
    </LayoutWrapper>
  );
}
