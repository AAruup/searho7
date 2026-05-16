import React from 'react';
import { Cpu } from 'lucide-react';
import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className, iconOnly = false }) => {
  return (
    <div className={cn("flex items-center gap-3 group select-none", className)}>
      <div className="relative">
        <div className="absolute -inset-2 bg-saffron-500/20 rounded-xl blur-xl group-hover:bg-saffron-500/40 transition-all duration-500" />
        <div className="relative w-11 h-11 rounded-xl bg-slate-950 border border-saffron-500/30 flex items-center justify-center shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-saffron-600/20 to-transparent" />
          <Cpu className="w-6 h-6 text-saffron-500 group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-saffron-500/50 shadow-[0_0_10px_rgba(242,86,7,0.5)]" />
        </div>
      </div>
      
      {!iconOnly && (
        <div className="flex flex-col">
          <span className="text-2xl font-black text-white italic tracking-tighter leading-none flex items-center">
            SEA<span className="text-saffron-500 block -mt-1 mx-0.5">.</span>RHO7
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
             <div className="w-1.5 h-1.5 rounded-full bg-saffron-500 animate-pulse" />
             <span className="text-[7px] font-mono text-slate-500 font-black uppercase tracking-[0.4em]">AI Problem Solver</span>
          </div>
        </div>
      )}
    </div>
  );
};
