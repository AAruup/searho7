import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { Chat } from './features/chat/Chat';
import { APIHub } from './features/api-hub/APIHub';
import { ImageEditor } from './features/image-editor/ImageEditor';
import { KnowledgeBase } from './features/knowledge-base/KnowledgeBase';
import { LyricAnimation } from './features/lyric-animation/LyricAnimation';
import { ProjectHub } from './features/project-hub/ProjectHub';
import { SystemMonitor } from './features/system-monitor/SystemMonitor';
import { WordEditor } from './features/word-editor/WordEditor';
import { Settings } from './features/settings/Settings';
import { GreyMatter } from './features/grey-matter/GreyMatter';
import { Academy } from './features/academy/Academy';
import { AgentWorkbench } from './features/agent-workbench/AgentWorkbench';
import { AppFeature } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './context/AuthContext';
import { Bot, LogIn, Cpu, ShieldCheck, UserRound } from 'lucide-react';

export default function App() {
  const [activeFeature, setActiveFeature] = useState<AppFeature>(() => {
    if (typeof window === 'undefined') return AppFeature.DASHBOARD;

    const hashFeature = window.location.hash.replace('#', '').toUpperCase();
    if (hashFeature && Object.values(AppFeature).includes(hashFeature as AppFeature)) {
      return hashFeature as AppFeature;
    }

    if (window.location.pathname.toLowerCase().includes('open-agent-workbench')) {
      return AppFeature.AGENT_WORKBENCH;
    }

    return AppFeature.DASHBOARD;
  });
  const { user, signIn, signInAsGuest, startLocalSession } = useAuth();

  const renderFeature = () => {
    switch (activeFeature) {
      case AppFeature.DASHBOARD:
        return <Dashboard onNavigate={setActiveFeature} />;
      case AppFeature.CHAT:
        return <Chat />;
      case AppFeature.API_HUB:
        return <APIHub />;
      case AppFeature.IMAGE_EDITOR:
        return <ImageEditor />;
      case AppFeature.KNOWLEDGE_BASE:
        return <KnowledgeBase />;
      case AppFeature.LYRIC_ANIMATION:
        return <LyricAnimation />;
      case AppFeature.PROJECT_HUB:
        return <ProjectHub />;
      case AppFeature.SYSTEM_MONITOR:
        return <SystemMonitor />;
      case AppFeature.WORD_EDITOR:
        return <WordEditor />;
      case AppFeature.SETTINGS:
        return <Settings />;
      case AppFeature.GREY_MATTER:
        return <GreyMatter />;
      case AppFeature.ACADEMY:
        return <Academy />;
      case AppFeature.AGENT_WORKBENCH:
        return <AgentWorkbench />;
      default:
        return <Dashboard onNavigate={setActiveFeature} />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-vision-blue-950 flex items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="absolute inset-0 technical-grid opacity-10" />
        <div className="scanline" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md glass-panel p-10 md:p-12 rounded-lg border border-vision-blue-800 text-center space-y-10"
        >
          <div className="flex justify-center">
            <div className="p-5 bg-vision-blue-900 rounded-lg border border-saffron-500/30 shadow-[0_0_50px_rgba(37,99,235,0.18)] relative group">
              <div className="absolute inset-0 bg-saffron-600/10 rounded-lg blur-xl group-hover:bg-saffron-600/20 transition-all" />
              <Cpu className="w-12 h-12 text-saffron-500 relative z-10" />
            </div>
          </div>
          
          <div>
            <h1 className="text-6xl font-black tracking-tighter text-white italic">SEA.RHO7</h1>
            <p className="text-vision-blue-200 font-mono text-[10px] mt-3 uppercase tracking-[0.28em] font-black">Choose how to open the workspace</p>
          </div>

          <div className="space-y-4 pt-4">
             <button 
              onClick={signIn}
              className="w-full flex items-center justify-center gap-4 py-5 bg-gradient-to-r from-vision-blue-700 to-saffron-600 text-white font-black rounded-lg hover:from-vision-blue-600 hover:to-saffron-500 transition-all group shadow-[0_10px_40px_rgba(37,99,235,0.26)] hover:-translate-y-1 active:translate-y-0 text-xs tracking-widest"
             >
                <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                SIGN IN WITH GOOGLE
             </button>
             <button 
              onClick={signInAsGuest}
              className="w-full flex items-center justify-center gap-4 py-5 bg-vision-blue-800 text-white font-black rounded-lg hover:bg-vision-blue-700 transition-all group border border-vision-blue-600 hover:border-saffron-400 active:translate-y-0 text-xs tracking-widest shadow-[0_10px_30px_rgba(15,63,152,0.2)]"
             >
                <UserRound className="w-5 h-5 text-saffron-300 group-hover:scale-110 transition-transform" />
                CONTINUE AS GUEST
             </button>
             <button 
              onClick={startLocalSession}
              className="w-full flex items-center justify-center gap-4 py-5 bg-slate-950 text-slate-200 font-black rounded-lg hover:bg-vision-blue-900 transition-all group border border-vision-blue-800 hover:border-saffron-500/50 active:translate-y-0 text-xs tracking-widest"
             >
                <Bot className="w-5 h-5 text-saffron-400 group-hover:scale-110 transition-transform" />
                OPEN LOCAL WORKSPACE
             </button>
             <div className="flex items-center justify-center gap-4">
               <div className="h-px flex-1 bg-vision-blue-800" />
               <span className="text-[10px] font-mono text-vision-blue-300/70 uppercase tracking-widest whitespace-nowrap">Local mode works offline</span>
               <div className="h-px flex-1 bg-vision-blue-800" />
             </div>
             <p className="text-[9px] font-mono text-vision-blue-300/50 uppercase tracking-[0.25em] font-medium">
               Blue and saffron agent workspace
             </p>
          </div>

          <div className="pt-8 border-t border-vision-blue-800/60 flex items-center justify-center gap-3 text-vision-blue-300/70">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500/50" />
              <span className="text-[9px] font-mono uppercase tracking-[0.2em] font-bold">Local Safe Mode</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-saffron-500" />
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] font-bold">No API key needed</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-vision-blue-950 text-slate-300 font-sans flex flex-col lg:flex-row overflow-hidden selection:bg-saffron-500 selection:text-white">
      <Navigation 
        activeFeature={activeFeature} 
        onFeatureChange={setActiveFeature} 
      />
      
      <main className="flex-1 overflow-y-auto bg-[color:var(--bg)] relative custom-scrollbar pt-20 lg:pt-0">
        <div className="absolute inset-0 technical-grid opacity-10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 lg:py-12 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFeature}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            >
              {renderFeature()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Status Bar - Hidden on small mobile */}
      <div className="fixed bottom-6 right-8 z-50 hidden sm:flex items-center gap-6 px-6 py-3 rounded-lg bg-vision-blue-950/85 border border-vision-blue-800 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-3 text-[10px] font-mono font-bold tracking-widest text-vision-blue-200 uppercase">
          <div className="w-2 h-2 rounded-full bg-saffron-500 animate-pulse shadow-[0_0_8px_rgba(255,116,18,0.5)]" />
          Local Agent Ready
        </div>
        <div className="w-px h-4 bg-vision-blue-800" />
        <div className="text-[10px] font-mono font-bold text-saffron-400 uppercase tracking-[0.2em]">
          BLUE_SAFFRON_UI
        </div>
      </div>
    </div>
  );
}
