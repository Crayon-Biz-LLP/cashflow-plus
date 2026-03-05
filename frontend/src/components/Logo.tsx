"use client";

import React from "react";

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textColor?: string;
}

export default function Logo({
  size = 36,
  className = "",
  showText = true,
  textColor = "#111827",
}: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src="/logo.png"
        alt="CashFlow Logo"
        style={{ height: size, width: 'auto' }}
        className="object-contain"
      />
      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className="text-[1.15rem] font-bold tracking-tight"
            style={{ color: textColor, fontFamily: "var(--font-geist-sans)" }}
          >
            SOLV PROD
          </span>
        </div>
      )}
    </div>
  );
}
