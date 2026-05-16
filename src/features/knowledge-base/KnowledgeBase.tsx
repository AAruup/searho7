import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  ChevronRight, 
  Tag, 
  Clock, 
  ArrowRight,
  Database,
  ExternalLink,
  Zap,
  Loader2,
  Star
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { summarizeContent } from '../../services/geminiService';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  lastUpdated: string;
}

export const KnowledgeBase: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeSummary, setActiveSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState<string | null>(null);
  const [summarizedArticleId, setSummarizedArticleId] = useState<string | null>(null);
  
  const handleSummarize = async (article: Article) => {
    if (isSummarizing) return;
    setIsSummarizing(article.id);
    setActiveSummary(null);
    setSummarizedArticleId(null);
    try {
      const summary = await summarizeContent(`Article Title: ${article.title}\n\nContent Excerpt: ${article.excerpt}`);
      setActiveSummary(summary || "Neural capture failed.");
      setSummarizedArticleId(article.id);
    } catch (error) {
      setActiveSummary("Uplink error during synthesis.");
    } finally {
      setIsSummarizing(null);
    }
  };
  
  const articles: Article[] = [
    { 
      id: '1', 
      title: 'Neural Sync Architecture', 
      excerpt: 'In-depth analysis of the underlying synchronization protocol between SEA.RHO7 kernels and distributed Express instances.',
      category: 'Core Node',
      tags: ['sync', 'architecture', 'vortex'],
      lastUpdated: '2H_AGO'
    },
    { 
      id: '2', 
      title: 'Premium Security Layers', 
      excerpt: 'Comprehensive guide to securing external endpoints via the API Hub using persistent quantum-level tokens.',
      category: 'Security Crypt',
      tags: ['api', 'security', 'quantum'],
      lastUpdated: '1D_AGO'
    },
    { 
      id: '3', 
      title: 'Imaging Matrix V5', 
      excerpt: 'Technical specifications for neural image studio filters and hardware-accelerated saffron rendering techniques.',
      category: 'Visual Logic',
      tags: ['canvas', 'imaging', 'saffron'],
      lastUpdated: '3D_AGO'
    },
    { 
      id: '4', 
      title: 'Command Orchestration', 
      excerpt: 'Designing high-efficiency premium project modules using Mission Control for distributed autonomous team management.',
      category: 'Mission Cmd',
      tags: ['workflow', 'kanban', 'tasks'],
      lastUpdated: '5D_AGO'
    }
  ];

  return (
    <div className="space-y-8 lg:space-y-12 pb-20">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6">
        <div>
          <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tighter uppercase italic premium-text-gradient">Neural Database</h2>
          <p className="text-slate-500 font-mono text-[10px] mt-1 uppercase tracking-[0.4em] font-black">Premium Centralized Protocol Knowledge Base</p>
        </div>
        <div className="flex gap-4">
           <div className="relative group flex-1 lg:flex-none">
              <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-saffron-400 transition-colors" />
              <input 
               type="text" 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               placeholder="Search neural repository..."
               className="bg-slate-900/40 border border-slate-800 rounded-[1.5rem] lg:rounded-[2rem] py-4 pl-14 pr-8 text-sm font-mono text-slate-300 focus:outline-none focus:border-saffron-500/50 w-full lg:min-w-[400px] shadow-2xl transition-all font-bold placeholder:text-slate-700 backdrop-blur-xl"
              />
           </div>
           <button className="p-4 border border-slate-800 rounded-2xl bg-slate-950 text-slate-600 hover:text-white hover:bg-slate-900 transition-all shadow-xl active:scale-95 shadow-saffron-600/5">
             <Filter className="w-6 h-6" />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 lg:gap-12">
        {/* Categories */}
        <div className="space-y-10 order-2 lg:order-1">
          <div>
            <h3 className="text-[10px] font-mono text-slate-600 uppercase tracking-[0.5em] mb-6 font-black border-b border-slate-900 pb-4 italic">Neural Groups</h3>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
              {['Signal Clusters', 'Core Ops', 'Neural Nodes', 'Creative Lab', 'Command Tower'].map((cat, i) => (
                <button 
                  key={cat}
                  className={cn(
                    "w-full flex items-center justify-between px-4 lg:px-6 py-4 rounded-xl lg:rounded-2xl text-[10px] lg:text-[11px] font-mono transition-all font-black tracking-widest uppercase border group",
                    i === 0 
                      ? "bg-saffron-600/10 text-white border-saffron-500/30 shadow-lg shadow-saffron-600/5" 
                      : "text-slate-500 border-transparent hover:text-white hover:bg-slate-900/60"
                  )}
                >
                  {cat}
                  <ChevronRight className={cn("w-4 h-4 transition-transform group-hover:translate-x-1 hidden lg:block", i === 0 ? "text-saffron-400" : "text-slate-800")} />
                </button>
              ))}
            </div>
          </div>

          <div className="p-8 lg:p-10 bg-slate-900/30 border border-slate-900 rounded-[2.5rem] relative overflow-hidden group shadow-2xl backdrop-blur-md">
             <div className="absolute inset-0 bg-saffron-600/5 group-hover:bg-saffron-600/10 transition-colors pointer-events-none" />
             <div className="relative z-10">
               <div className="flex items-center gap-4 mb-8 lg:mb-10">
                 <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 shadow-xl">
                   <Database className="w-5 h-5 text-saffron-400" />
                 </div>
                 <div className="flex flex-col">
                   <span className="text-[10px] font-mono font-black text-white uppercase tracking-[0.2em]">Neural Specs</span>
                   <span className="text-[8px] font-mono text-saffron-500 font-bold tracking-widest uppercase">PREMIUM_ACTIVE</span>
                 </div>
               </div>
               <div className="space-y-8">
                 <div className="space-y-3">
                   <div className="flex justify-between text-[11px] font-mono font-black">
                     <span className="text-slate-600 tracking-tighter uppercase">SYNTHESIS_CAP</span>
                     <span className="text-white">4.2 TB</span>
                   </div>
                   <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden p-[1px]">
                     <div className="h-full w-[85%] bg-saffron-500 shadow-[0_0_12px_rgba(255,116,18,0.5)] rounded-full transition-all duration-1000" />
                   </div>
                 </div>
                 <div className="space-y-3">
                   <div className="flex justify-between text-[11px] font-mono font-black">
                     <span className="text-slate-600 tracking-tighter uppercase">NEURAL_NODES</span>
                     <span className="text-white">1,248</span>
                   </div>
                   <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden p-[1px]">
                     <div className="h-full w-[55%] bg-orange-500 shadow-[0_0_12px_rgba(242,86,7,0.5)] rounded-full transition-all duration-1000" />
                   </div>
                 </div>
               </div>
             </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-6 lg:space-y-8 order-1 lg:order-2">
           {articles.map((article, i) => (
             <motion.div
               key={article.id}
               initial={{ opacity: 0, y: 40, scale: 0.95 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               transition={{ delay: i * 0.1, duration: 0.6 }}
               className="group p-8 lg:p-10 bg-slate-900/10 border border-slate-900 hover:border-saffron-500/20 hover:bg-slate-900/30 rounded-[2rem] lg:rounded-[2.5rem] transition-all cursor-pointer relative overflow-hidden shadow-2xl backdrop-blur-xl"
             >
               <div className="absolute inset-0 bg-gradient-to-br from-saffron-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
               
               <div className="relative z-10 flex flex-col md:flex-row gap-6 lg:gap-10">
                 <div className="flex-1 space-y-4 lg:space-y-6">
                   <div className="flex flex-wrap items-center gap-4 lg:gap-6">
                      <span className="px-4 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-[9px] font-mono text-saffron-400 uppercase tracking-[0.4em] font-black shadow-lg flex items-center gap-2">
                        <Star className="w-3 h-3 fill-saffron-500" />
                        {article.category}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-600 font-black uppercase tracking-widest group-hover:text-slate-400 transition-colors">
                        <Clock className="w-4 h-4 text-saffron-600" /> {article.lastUpdated}
                      </div>
                   </div>
                   <h3 className="text-3xl lg:text-4xl font-black text-white group-hover:text-saffron-400 transition-colors tracking-tighter uppercase italic">{article.title}</h3>
                   <p className="text-sm lg:text-base text-slate-500 leading-relaxed max-w-2xl font-bold group-hover:text-slate-400 transition-colors">{article.excerpt}</p>
                   
                   {activeSummary && summarizedArticleId === article.id && (
                     <motion.div 
                       initial={{ opacity: 0, height: 0 }}
                       animate={{ opacity: 1, height: 'auto' }}
                       className="p-6 bg-saffron-600/5 border border-saffron-500/20 rounded-2xl text-xs font-mono text-saffron-300 leading-loose italic mb-6 shadow-inner"
                     >
                       <div className="flex items-center gap-3 mb-3 text-saffron-500 font-black tracking-widest uppercase">
                         <Zap className="w-4 h-4 fill-saffron-500" /> Neural Synthesis Result
                       </div>
                       {activeSummary}
                     </motion.div>
                   )}

                   <div className="flex flex-wrap gap-4 lg:gap-5 pt-4">
                     <button 
                        onClick={(e) => { e.stopPropagation(); handleSummarize(article); }}
                        className="flex items-center gap-3 text-[10px] font-mono text-saffron-400 hover:text-white transition-all uppercase font-black tracking-[0.2em] bg-saffron-600/10 px-4 py-3 rounded-xl border border-saffron-500/20 hover:border-saffron-500 shadow-lg active:scale-95 disabled:opacity-50"
                        disabled={isSummarizing === article.id}
                     >
                       {isSummarizing === article.id ? (
                         <Loader2 className="w-3.5 h-3.5 animate-spin text-saffron-500" />
                       ) : (
                         <Zap className="w-3.5 h-3.5 fill-saffron-400" />
                       )}
                       {isSummarizing === article.id ? 'Synthesizing...' : 'Neural Capture'}
                     </button>
                     {article.tags.map(tag => (
                       <span key={tag} className="flex items-center gap-2 lg:gap-3 text-[10px] font-mono text-slate-600 group-hover:text-slate-300 transition-all uppercase font-black tracking-[0.2em] bg-slate-950/40 px-3 py-1.5 rounded-lg border border-slate-800/40">
                         <div className="w-1.5 lg:w-2 h-1.5 lg:h-2 rounded-full bg-slate-900 group-hover:bg-saffron-500 transition-colors shadow-[0_0_10px_rgba(255,116,18,0.3)]" /> {tag}
                       </span>
                     ))}
                   </div>
                 </div>
                 <div className="flex items-center justify-end sm:justify-start">
                    <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl lg:rounded-[2rem] border border-slate-800 bg-slate-950 flex items-center justify-center group-hover:bg-saffron-600 group-hover:border-saffron-500 group-hover:text-white group-hover:shadow-[0_15px_40px_rgba(242,86,7,0.4)] transition-all duration-500 group-hover:scale-110">
                      <ArrowRight className="w-8 h-8 lg:w-10 lg:h-10 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                 </div>
               </div>
               <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-saffron-600/5 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
             </motion.div>
           ))}

           <div className="pt-20 flex justify-center text-[10px] lg:text-[11px] font-mono text-slate-800 uppercase tracking-[0.8em] font-black select-none italic hover:text-saffron-900 transition-all opacity-40">
             End of classification stream // PREMIUM_SAFE
           </div>
        </div>
      </div>
    </div>
  );
};
