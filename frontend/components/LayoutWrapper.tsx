"use client";
import React from "react";
import { NavSidebar, MobileNav } from "./NavSidebar";
import { motion } from "framer-motion";

export const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-[#F0F4F8] flex flex-col md:flex-row overflow-x-hidden">
      <NavSidebar />
      <MobileNav />
      
      <main className="flex-1 md:ml-32 min-h-screen p-6 md:p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          {children}
        </motion.div>
      </main>
      
      {/* Soft Decorative Blobs for the background */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-5%] right-[-5%] w-[30%] h-[50%] bg-teal-400/5 rounded-full blur-[140px] pointer-events-none z-0"></div>
    </div>
  );
};
