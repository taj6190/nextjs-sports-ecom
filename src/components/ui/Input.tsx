"use client";

import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && (
          <label 
            htmlFor={id} 
            className="block text-[11px] font-black uppercase tracking-widest text-slate-500"
          >
            {label}
          </label>
        )}
        <div className="relative group">
          <input
            ref={ref}
            id={id}
            className={cn(
              "w-full px-5 py-4 bg-white border border-slate-200 text-[#111] text-[14px] font-bold placeholder:text-slate-300 placeholder:font-medium",
              "focus:outline-none focus:border-black focus:ring-0",
              "transition-all duration-300",
              error && "border-red-500 focus:border-red-500",
              className
            )}
            {...props}
          />
          <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-black transition-all duration-500 group-focus-within:w-full" />
        </div>
        {error && (
          <p className="text-[10px] font-bold uppercase tracking-wider text-red-500 animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
