"use client";

import { useState, useEffect } from "react";
import { HiOutlineFire } from "react-icons/hi2";

interface CountdownTimerProps {
  endTime: string;
  className?: string;
}

export default function CountdownTimer({ endTime, className = "" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, expired: false });

  useEffect(() => {
    const calculateTime = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        expired: false,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  if (timeLeft.expired) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm ${className}`}>
        <HiOutlineFire size={16} />
        Deal Expired
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-1.5 px-3 py-2 bg-orange-500/10 border border-orange-500/20 rounded-xl">
        <HiOutlineFire size={16} className="text-orange-400" />
        <span className="text-xs text-orange-400 font-medium">Deal ends in:</span>
      </div>
      <div className="flex items-center gap-1">
        <TimeBlock value={timeLeft.hours} label="HRS" />
        <span className="text-orange-400 font-bold">:</span>
        <TimeBlock value={timeLeft.minutes} label="MIN" />
        <span className="text-orange-400 font-bold">:</span>
        <TimeBlock value={timeLeft.seconds} label="SEC" />
      </div>
    </div>
  );
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-10 h-10 bg-gradient-to-b from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
        <span className="text-slate-900 font-bold text-sm">{String(value).padStart(2, "0")}</span>
      </div>
      <span className="text-[9px] text-slate-500 mt-0.5">{label}</span>
    </div>
  );
}
