"use client";

import Image from "next/image";

interface LogoProps {
  size?: "small" | "medium" | "large";
  className?: string;
}

const sizeClasses = {
  small: "h-8 w-8",
  medium: "h-12 w-12",
  large: "h-16 w-16"
};

export default function Logo({ size = "medium", className = "" }: LogoProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Image
        src="/images/logo Pengurus.jpg"
        alt="Logo Pengurus"
        width={size === "small" ? 32 : size === "medium" ? 48 : 64}
        height={size === "small" ? 32 : size === "medium" ? 48 : 64}
        className={`${sizeClasses[size]} rounded-lg object-contain`}
        priority
      />
    </div>
  );
}
