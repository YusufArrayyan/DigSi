"use client";
import React from "react";

export const GridBackground = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full w-full bg-[#0B132B] bg-grid-white/[0.05] relative flex items-center justify-center">
      {/* Radial gradient for the container to give a faded look */}
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-[#0B132B] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
};
