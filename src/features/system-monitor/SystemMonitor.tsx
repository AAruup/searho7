import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { 
  Monitor, 
  Activity, 
  Zap, 
  Database, 
  Cpu, 
  Disc, 
  Wifi, 
  AlertTriangle 
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const SystemMonitor: React.FC = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const initialData = Array.from({ length: 20 }, (_, i) => ({
      time: i,
      cpu: Math.floor(Math.random() * 30) + 20,
      memory: Math.floor(Math.random() * 20) + 60,
      network: Math.floor(Math.random() * 50) + 10,
    }));
    setData(initialData);

    const interval = setInterval(() => {
      setData(prev => {
        const nextTime = (prev[prev.length - 1]?.time || 0) + 1;
        const newData = [
          ...prev.slice(1),
          {
            time: nextTime,
            cpu: Math.floor(Math.random() * 30) + 20,
            memory: Math.floor(Math.random() * 20) + 60,
            network: Math.floor(Math.random() * 50) + 10,
          }
        ];
        return newData;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: 'CPU Cluster Load', value: `${data[data.length - 1]?.cpu || 0}%`, icon: Cpu, color: 'text-indigo-500' },
    { label: 'Memory Allocation', value: `${data[data.length - 1]?.memory || 0}%`, icon: Database, color: 'text-blue-500' },
    { label: 'Network Throughput', value: `${data[data.length - 1]?.network || 0}Mbps`, icon: Wifi, color: 'text-emerald-500' },
    { label: 'Storage IOPS', value: '4.2k', icon: Disc, color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight uppercase italic">Neural Oversight</h2>
          <p className="text-slate-500 font-mono text-[10px] mt-1 uppercase tracking-[0.4em] font-black">Mother AI Direct Kernel Stream</p>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono text-saffron-500 bg-saffron-500/5 px-5 py-2 rounded-2xl border border-saffron-500/20 shadow-2xl font-black italic">
          <div className="w-2 h-2 rounded-full bg-saffron-500 animate-pulse shadow-[0_0_10px_rgba(255,116,18,0.5)]" />
          CORE_SYNC_OPTIMAL // CEO_AUTHORIZED
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat) => (
          <div key={stat.label} className="p-10 bg-slate-900/10 border border-slate-900 rounded-[2.5rem] group hover:border-saffron-500/30 transition-all shadow-2xl backdrop-blur-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-saffron-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="flex justify-between items-center mb-8">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 shadow-xl">
                <stat.icon className={cn("w-6 h-6", stat.color.replace('indigo', 'saffron').replace('blue', 'amber'))} />
              </div>
              <Activity className="w-5 h-5 text-slate-800 group-hover:text-saffron-400 transition-colors" />
            </div>
            <p className="text-4xl font-black font-mono text-white tracking-tight italic">{stat.value}</p>
            <p className="text-[10px] font-mono text-slate-600 uppercase tracking-[0.3em] mt-3 font-black">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-10 bg-slate-900/10 border border-slate-900 rounded-[3rem] space-y-10 shadow-2xl backdrop-blur-xl">
          <div className="flex justify-between items-center px-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 shadow-xl">
                <Activity className="w-6 h-6 text-saffron-400" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-lg font-black text-white tracking-tighter uppercase italic">Neural Synthesized Throughput</h3>
                <p className="text-[8px] font-mono text-saffron-600 font-bold uppercase tracking-widest">REAL_TIME_NODE_STREAMS</p>
              </div>
            </div>
            <div className="flex gap-8">
               <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 font-black uppercase tracking-widest">
                 <div className="w-3 h-3 rounded-full bg-saffron-500 shadow-[0_0_15px_rgba(255,116,18,0.5)]" /> CPU_LOAD
               </div>
               <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 font-black uppercase tracking-widest">
                 <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]" /> MEM_ALLOC
               </div>
            </div>
          </div>
          
          <div className="h-80 mt-6 px-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff7412" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ff7412" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#0f172a" />
                <XAxis dataKey="time" hide />
                <YAxis domain={[0, 100]} hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '24px', fontSize: '10px', fontFamily: 'JetBrains Mono', padding: '16px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                  labelStyle={{ display: 'none' }}
                />
                <Area type="monotone" dataKey="cpu" stroke="#ff7412" fillOpacity={1} fill="url(#colorCpu)" strokeWidth={4} isAnimationActive={false} />
                <Area type="monotone" dataKey="memory" stroke="#f59e0b" fillOpacity={1} fill="url(#colorMem)" strokeWidth={4} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-10 bg-slate-900/10 border border-slate-900 rounded-[3rem] shadow-2xl backdrop-blur-xl flex flex-col gap-10">
          <div className="flex items-center gap-4 px-2">
             <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 shadow-xl">
               <Zap className="w-6 h-6 text-emerald-500" />
             </div>
             <div className="flex flex-col">
               <h3 className="text-lg font-black text-white tracking-tighter uppercase italic">Global IO Matrix</h3>
               <p className="text-[8px] font-mono text-emerald-600 font-bold uppercase tracking-widest">EXTERNAL_PROXY_NODES</p>
             </div>
          </div>
          
          <div className="flex-1 h-56 px-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.slice(-10)}>
                <Bar dataKey="network" fill="#10b981" radius={[8, 8, 0, 0]} isAnimationActive={false} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-6 pt-10 border-t border-slate-950 px-2">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-600 font-black uppercase tracking-[0.2em] italic">
                <span>Packet Leakage</span>
                <span className="text-white bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-900">0.0001%</span>
              </div>
              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden p-[1px] shadow-inner">
                <div className="h-full w-full bg-emerald-500/10" />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-600 font-black uppercase tracking-[0.2em] italic">
                <span>Core Sync Error Node</span>
                <span className="text-emerald-500 font-black">NOMINAL_SYNC</span>
              </div>
              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden p-[1px] shadow-inner">
                 <div className="h-full w-[5%] bg-saffron-600 shadow-[0_0_15px_rgba(255,116,18,0.5)] rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 rounded-[2rem] bg-slate-950/40 border border-slate-900 relative overflow-hidden group shadow-2xl backdrop-blur-3xl">
        <div className="absolute top-0 left-0 w-2 h-full bg-saffron-600/20 group-hover:bg-saffron-600 transition-all duration-500" />
        <div className="flex items-center gap-6 relative z-10">
          <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl group-hover:border-saffron-500/30 transition-colors">
            <AlertTriangle className="w-5 h-5 text-saffron-500" />
          </div>
          <p className="text-[11px] font-mono text-slate-500 uppercase tracking-[0.3em] font-black leading-relaxed italic group-hover:text-slate-400 transition-colors">
            <span className="text-saffron-500 mr-4 font-black">MOTHER_AI_LOGS:</span>
            Kernel synchronization finalized. All distributed clusters reported stable at {new Date().toLocaleTimeString().toUpperCase()}. 
            Autonomous CEO oversight enabled. All node activities are being logged and synthesized for Mother AI analysis. Master Core: SEA-RHO7-STABLE.
          </p>
        </div>
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-saffron-600/[0.03] blur-[100px] pointer-events-none rounded-full" />
      </div>
    </div>
  );
};
