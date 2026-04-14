import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Shield, Search, Settings, Home, Fingerprint, FilePlus, Info, Lock, Unlock, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdmin } from "@/context/AdminContext";
import { motion, AnimatePresence } from "framer-motion";

const NavItem = ({ href, icon: Icon, label, active }: { href: string; icon: any; label: string; active: boolean }) => (
  <Link 
    href={href}
    className={cn(
      "flex flex-col items-center justify-center p-4 rounded-3xl transition-all duration-300 group",
      active 
        ? "bg-blue-500 text-white shadow-[inset_4px_4px_8px_rgba(255,255,255,0.3),4px_4px_12px_rgba(59,130,246,0.4)]" 
        : "text-slate-400 hover:bg-slate-50 hover:text-blue-500 clay-button"
    )}
  >
    <Icon className={cn("w-6 h-6", active ? "scale-110" : "group-hover:scale-110")} />
    <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">{label}</span>
  </Link>
);

export const NavSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, username, logout } = useAdmin();

  const handleAuth = async () => {
    if (isAdmin) {
      if (confirm("Logout dari akun Admin?")) logout();
    } else {
      router.push("/auth");
    }
  };

  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4 p-3 clay-card bg-white/80 backdrop-blur-xl hidden md:flex min-w-[80px]">
      <div className="p-4 mb-4 border-b border-slate-100 flex justify-center">
        <div className="w-10 h-10 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
          <Fingerprint className="text-white w-6 h-6" />
        </div>
      </div>
      
      <div className="flex flex-col gap-4 flex-1">
        <NavItem href="/" icon={Home} label="Home" active={pathname === "/"} />
        <NavItem href="/verify" icon={Search} label="Verify" active={pathname === "/verify"} />
        
        <AnimatePresence>
          {isAdmin ? (
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-4"
            >
              <NavItem href="/issue" icon={FilePlus} label="Issue" active={pathname === "/issue"} />
              <NavItem href="/admin" icon={Settings} label="Admin" active={pathname === "/admin"} />
            </motion.div>
          ) : username && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }}
            >
              <NavItem href="/issue" icon={FilePlus} label="Submit" active={pathname === "/issue"} />
            </motion.div>
          )}
        </AnimatePresence>

        <NavItem href="/about" icon={Info} label="About" active={pathname === "/about"} />
      </div>

      <div className="pt-4 border-t border-slate-100 mt-2 flex flex-col items-center gap-2">
        {isAdmin && (
           <div className="flex flex-col items-center mb-2">
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center mb-1">
                <User className="w-4 h-4 text-slate-400" />
              </div>
              <span className="text-[7px] font-black text-slate-400 truncate max-w-[60px]">{username}</span>
           </div>
        )}
        <button 
          onClick={handleAuth}
          className={cn(
            "w-full p-4 rounded-3xl transition-all duration-300 flex flex-col items-center justify-center group gap-1",
            isAdmin ? "bg-red-50 text-red-500 hover:bg-red-500 hover:text-white" : "text-slate-400 hover:bg-blue-50 hover:text-blue-500 clay-button"
          )}
        >
          {isAdmin ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
          <span className="text-[8px] font-black uppercase tracking-tighter">
            {isAdmin ? "Logout" : "Login"}
          </span>
        </button>
      </div>
    </div>
  );
};

export const MobileNav = () => {
    const pathname = usePathname();
    const router = useRouter();
    const { isAdmin, logout } = useAdmin();

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex gap-4 p-3 clay-card bg-white/80 backdrop-blur-xl md:hidden w-[90%] justify-around items-center">
            <NavItem href="/" icon={Home} label="Home" active={pathname === "/"} />
            <NavItem href="/verify" icon={Search} label="Verify" active={pathname === "/verify"} />
            
            {isAdmin && (
                <>
                    <NavItem href="/issue" icon={FilePlus} label="Issue" active={pathname === "/issue"} />
                    <NavItem href="/admin" icon={Settings} label="Admin" active={pathname === "/admin"} />
                </>
            )}

            <NavItem href="/about" icon={Info} label="About" active={pathname === "/about"} />
            
            <button 
                onClick={async () => {
                    if (isAdmin) {
                        if (confirm("Logout?")) logout();
                    } else {
                        router.push("/auth");
                    }
                }}
                className={cn(
                    "p-3 rounded-2xl transition-all",
                    isAdmin ? "text-red-500 bg-red-50" : "text-slate-400 bg-slate-50"
                )}
            >
                {isAdmin ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </button>
        </div>
    )
}
