import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  FileText, 
  Save, 
  Eye, 
  Code, 
  Bold, 
  Italic, 
  List, 
  Link, 
  Maximize2,
  Settings,
  Share2,
  Zap,
  Loader2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { summarizeContent, generateTextStream, flashModel } from '../../services/geminiService';

export const WordEditor: React.FC = () => {
  const [content, setContent] = useState('# SEA.RHO7 Protocol Document\n\nInitialize your technical markdown content here...\n\n- Real-time neural preview\n- Auto-save to distributed cluster nodes\n- Hardware-accelerated formatting');
  const [viewMode, setViewMode] = useState<'editor' | 'preview' | 'split'>('split');
  const [isSummarizing, setIsSummarizing] = useState(false);

  const handleSummarize = async () => {
    if (isSummarizing || !content.trim()) return;
    setIsSummarizing(true);
    
    // Add spacer and header for summary
    setContent(prev => `${prev}\n\n---\n## Neural Synthesis Summary (STREMIANG...)\n\n`);
    
    try {
      const prompt = `Please summarize the following content objectively and concisely:\n\n${content}`;
      const stream = await generateTextStream(prompt, flashModel);
      
      let fullSummary = "";
      for await (const chunk of stream) {
        const text = chunk.text;
        fullSummary += text || '';
        setContent(prev => {
          const parts = prev.split('## Neural Synthesis Summary (STREMIANG...)');
          return `${parts[0]}## Neural Synthesis Summary\n\n${fullSummary}`;
        });
      }
    } catch (error) {
      console.error("Neural Synthesis failed:", error);
      setContent(prev => `${prev}\nERROR: NEURAL_SYNTHESIS_ABORTED`);
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="h-[calc(100vh-14rem)] flex flex-col gap-10">
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-10">
          <div className="p-6 bg-slate-950 rounded-[2rem] border border-slate-900 shadow-2xl shadow-indigo-600/10">
            <FileText className="w-8 h-8 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-4xl font-bold text-white tracking-tight uppercase italic">Technical Word Studio</h2>
            <div className="flex items-center gap-4 mt-2 px-0.5">
              <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.4em] font-black">Node Index // UNTITLED_RAW_01.md</p>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
              <p className="text-emerald-500 font-mono text-[10px] uppercase tracking-[0.4em] font-black animate-pulse italic">Uplink Active</p>
            </div>
          </div>
        </div>
        <div className="flex gap-5">
          <button className="px-8 py-4 bg-slate-950 border border-slate-900 text-slate-600 rounded-2xl hover:text-white hover:border-slate-700 transition-all font-black text-[10px] uppercase tracking-[0.3em] shadow-xl">
            <Share2 className="w-5 h-5" /> Share
          </button>
          <button className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-500 flex items-center gap-3 transition-all shadow-[0_15px_40px_rgba(79,70,229,0.3)] hover:-translate-y-1 active:translate-y-0 text-[10px] uppercase tracking-[0.2em] italic">
            <Save className="w-5 h-5 shadow-2xl" /> Persist Node
          </button>
        </div>
      </div>

      <div className="flex-1 bg-slate-900/10 rounded-[3rem] overflow-hidden flex flex-col border border-slate-900 shadow-2xl backdrop-blur-xl relative">
         <div className="absolute inset-0 technical-grid opacity-5 pointer-events-none" />
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-950 bg-slate-950/60 flex justify-between items-center px-10 relative z-10 backdrop-blur-3xl">
          <div className="flex items-center gap-3">
            {[Bold, Italic, List, Link, Code].map((Icon, i) => (
              <button key={i} className="p-3 text-slate-700 hover:text-indigo-400 hover:bg-slate-900/80 rounded-xl transition-all group border border-transparent hover:border-slate-800 shadow-inner">
                <Icon className="w-5 h-5 group-hover:scale-110" />
              </button>
            ))}
          </div>

          <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-900 shadow-inner">
            {[
              { id: 'editor', icon: Code, label: 'SOURCE' },
              { id: 'preview', icon: Eye, label: 'MATRIX' },
              { id: 'split', icon: Maximize2, label: 'PARITY' }
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setViewMode(btn.id as any)}
                className={cn(
                  "px-6 py-2.5 flex items-center gap-3 rounded-xl text-[10px] font-mono transition-all font-black tracking-widest uppercase italic",
                  viewMode === btn.id 
                    ? "bg-indigo-600/10 text-indigo-400 shadow-2xl border border-indigo-500/20" 
                    : "text-slate-700 hover:text-slate-400"
                )}
              >
                <btn.icon className="w-4 h-4" /> {btn.label}
              </button>
            ))}
            <div className="w-[1px] bg-slate-900 mx-2 self-stretch" />
            <button
               onClick={handleSummarize}
               disabled={isSummarizing}
               className="px-6 py-2.5 flex items-center gap-3 rounded-xl text-[10px] font-mono transition-all font-black tracking-widest uppercase italic text-indigo-400 hover:text-white hover:bg-slate-900/60 disabled:opacity-50"
            >
               {isSummarizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 shadow-[0_0_10px_rgba(79,70,229,0.5)]" />}
               {isSummarizing ? 'SYNTHESIZING' : 'NEURAL_SUM'}
            </button>
          </div>

          <div className="flex items-center gap-10">
             <div className="flex flex-col items-end">
               <span className="text-[9px] font-mono text-slate-600 uppercase font-black tracking-[0.3em]">Payload Integrity</span>
               <span className="text-[10px] font-mono text-indigo-400 font-black uppercase">Token_Cnt: {content.split(' ').length.toString().padStart(4, '0')}</span>
             </div>
             <div className="p-2 border border-slate-900 rounded-xl bg-slate-950/50 hover:border-indigo-600/30 transition-colors cursor-pointer group">
               <Settings className="w-5 h-5 text-slate-700 group-hover:text-white group-hover:rotate-90 transition-all duration-500" />
             </div>
          </div>
        </div>

        {/* Editor Wrapper */}
        <div className="flex-1 flex overflow-hidden bg-slate-950/20 backdrop-blur-sm relative z-10">
          {(viewMode === 'editor' || viewMode === 'split') && (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={cn(
                "flex-1 bg-transparent p-14 focus:outline-none font-mono text-base leading-relaxed text-slate-400 resize-none selection:bg-indigo-600/20 selection:text-white custom-scrollbar font-medium",
                viewMode === 'split' ? "border-r border-slate-900/60" : ""
              )}
              spellCheck={false}
            />
          )}

          {(viewMode === 'preview' || viewMode === 'split') && (
            <div className="flex-1 p-14 overflow-y-auto bg-slate-950/10 markdown-body custom-scrollbar">
              <div className="max-w-none prose prose-invert prose-indigo prose-lg uppercase-headings:tracking-widest selection:bg-indigo-600/20">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
