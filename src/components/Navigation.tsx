import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Globe, 
  Image as ImageIcon, 
  Library, 
  Music, 
  Layout, 
  Monitor, 
  FileEdit,
  Cpu,
  Brain,
  GraduationCap,
  LogOut,
  Settings as SettingsIcon,
  Menu,
  X,
  Bot
} from 'lucide-react';
import { AppFeature } from '../types';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';

interface NavigationProps {
  activeFeature: AppFeature;
  onFeatureChange: (feature: AppFeature) => void;
}

const navItems = [
  { id: AppFeature.DASHBOARD, name: 'Home', icon: Cpu, category: 'Core' },
  { id: AppFeature.AGENT_WORKBENCH, name: 'Agent Workbench', icon: Bot, category: 'Core' },
  { id: AppFeature.CHAT, name: 'AI Chat', icon: MessageSquare, category: 'Comm' },
  { id: AppFeature.GREY_MATTER, name: 'Student Network', icon: Brain, category: 'Social' },
  { id: AppFeature.ACADEMY, name: 'Academy', icon: GraduationCap, category: 'Social' },
  { id: AppFeature.IMAGE_EDITOR, name: 'Image Studio', icon: ImageIcon, category: 'Creative' },
  { id: AppFeature.LYRIC_ANIMATION, name: 'Lyrics Studio', icon: Music, category: 'Creative' },
  { id: AppFeature.WORD_EDITOR, name: 'Word Editor', icon: FileEdit, category: 'Creative' },
  { id: AppFeature.KNOWLEDGE_BASE, name: 'Knowledge Base', icon: Library, category: 'Data' },
  { id: AppFeature.PROJECT_HUB, name: 'Projects', icon: Layout, category: 'Dev' },
  { id: AppFeature.API_HUB, name: 'API Tools', icon: Globe, category: 'Dev' },
  { id: AppFeature.SYSTEM_MONITOR, name: 'System Monitor', icon: Monitor, category: 'System' },
];

export const Navigation: React.FC<NavigationProps> = ({ activeFeature, onFeatureChange }) => {
  const { signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = (feature: AppFeature) => {
    onFeatureChange(feature);
    setIsOpen(false);
  };

  const NavContent = () => (
    <>
      <div className="mb-10 px-2">
        <Logo />
      </div>

      <div className="flex-1 space-y-10">
        {['Core', 'Social', 'Comm', 'Dev', 'Creative', 'Data', 'System'].map((cat, catIdx) => (
          <motion.div 
            key={cat} 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + catIdx * 0.05 }}
            className="space-y-3"
          >
            <h2 className="text-[10px] font-mono text-vision-blue-300/50 uppercase tracking-[0.28em] mb-4 px-3 font-black">{cat}</h2>
            <div className="space-y-1.5 focus-within:ring-0">
              {navItems.filter(item => item.category === cat).map((item, itemIdx) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + (catIdx * 0.1) + (itemIdx * 0.05) }}
                  onClick={() => handleNavClick(item.id)}
                  className={cn(
                    "w-full flex items-center space-x-4 px-4 py-3.5 text-[11px] font-bold transition-all rounded-lg group uppercase tracking-widest border outline-none",
                    activeFeature === item.id 
                      ? "bg-gradient-to-r from-vision-blue-700 to-saffron-600 text-white border-saffron-400/70 shadow-[0_10px_30px_rgba(37,99,235,0.24)] scale-[1.01]" 
                      : "text-vision-blue-100/55 border-transparent hover:bg-vision-blue-950/50 hover:text-white hover:border-vision-blue-800/60"
                  )}
                >
                  <item.icon className={cn(
                    "w-4 h-4 transition-all duration-300",
                    activeFeature === item.id ? "text-white scale-110" : "text-vision-blue-300/45 group-hover:text-saffron-400"
                  )} />
                  <span>{item.name}</span>
                  {activeFeature === item.id && (
                    <motion.div 
                      layoutId="active-nav-indicator"
                      className="ml-auto w-2 h-2 rounded-full bg-white shadow-[0_0_10px_#fff]" 
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 flex flex-col gap-4">
        <button 
          onClick={() => handleNavClick(AppFeature.SETTINGS)}
          className={cn(
            "w-full flex items-center space-x-3 px-6 py-4 text-[10px] font-black uppercase tracking-[0.25em] transition-all rounded-lg border",
            activeFeature === AppFeature.SETTINGS
              ? "bg-gradient-to-r from-vision-blue-700 to-saffron-600 text-white border-saffron-500 shadow-xl"
              : "text-vision-blue-100/55 border-vision-blue-950 hover:text-white hover:bg-vision-blue-950/50"
          )}
        >
          <SettingsIcon className="w-4 h-4" />
          <span>Settings</span>
        </button>

        <button 
          onClick={() => signOut()}
          className="w-full flex items-center justify-center space-x-3 px-6 py-4 text-[10px] font-black uppercase tracking-[0.25em] text-rose-500/70 hover:text-rose-500 hover:bg-rose-500/5 transition-all rounded-lg border border-transparent hover:border-rose-500/20"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-vision-blue-950/90 backdrop-blur-xl border-b border-vision-blue-900 z-50 px-6 flex items-center justify-between shadow-2xl">
        <Logo />
        <button 
          onClick={() => setIsOpen(true)}
          className="p-3 rounded-lg bg-slate-950 border border-vision-blue-800 text-vision-blue-100 active:scale-95 transition-transform"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <nav className="hidden lg:flex w-80 bg-vision-blue-950 border-r border-vision-blue-900 p-8 flex-col shrink-0 overflow-y-auto custom-scrollbar shadow-2xl relative z-10">
        <NavContent />
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[60] lg:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.8 }}
              className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-vision-blue-950 z-[70] lg:hidden p-8 flex flex-col overflow-y-auto custom-scrollbar shadow-[30px_0_60px_rgba(0,0,0,0.5)] border-r border-vision-blue-900"
            >
              <div className="flex justify-between items-center mb-10 pb-6 border-b border-vision-blue-900">
                <div className="flex items-center gap-3">
                  <Cpu className="w-5 h-5 text-saffron-500" />
                  <span className="text-xs font-mono text-vision-blue-200 uppercase tracking-widest font-black italic">Menu</span>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-3 rounded-lg bg-slate-950 border border-vision-blue-800 text-vision-blue-100 active:rotate-90 transition-transform duration-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1">
                <NavContent />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
