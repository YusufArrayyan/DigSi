"use client";
import React from "react";
import { cn } from "@/lib/utils";

export const DotBackground = ({ 
  children,
  className 
}: { 
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("min-h-screen w-full bg-[#030712] relative flex flex-col items-center justify-center overflow-x-hidden", className)}>
      {/* Radial gradient background simulation for the "Shader" feel */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[0%] right-[-5%] w-[30%] h-[50%] bg-purple-600/10 rounded-full blur-[140px]"></div>
      </div>
      
      {/* The Dot Pattern */}
      <div className="absolute inset-0 z-0 h-full w-full bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_90%)]"></div>
      
      <div className="relative z-10 w-full flex flex-col items-center">
        {children}
      </div>
    </div>
  );
};

export const Spotlight = ({ className }: { className?: string }) => {
  return (
    <div className={cn("pointer-events-none absolute -top-40 left-0 h-[1000px] w-full flex justify-center", className)}>
       <div className="h-full w-full bg-blue-500/5 blur-[120px] rounded-full translate-y-[-50%]"></div>
    </div>
  );
};
