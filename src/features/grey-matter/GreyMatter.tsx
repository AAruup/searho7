import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  Search, 
  Lightbulb, 
  Users, 
  Send, 
  MessageCircle, 
  Star, 
  ArrowUpRight, 
  Plus, 
  Globe, 
  Cpu, 
  Share2, 
  BookOpen, 
  Zap, 
  CheckCircle2, 
  MessageSquare,
  Trophy,
  Activity,
  Clock,
  MoreVertical,
  User
} from 'lucide-react';
import { StudentNode, GreyMatterProject, NeuralDoubt } from '../../types';
import { cn } from '../../lib/utils';

export const GreyMatter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'PROJECTS' | 'DOUBTS' | 'STUDENTS' | 'MESSAGES'>('PROJECTS');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentNode | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [gmMessages, setGmMessages] = useState<{id: string, text: string, senderId: string, timestamp: string}[]>([
    { id: 'm1', text: 'Hey Alex, checked out your Neural Vision Bridge. Insane performance!', senderId: '2', timestamp: '5M_AGO' },
    { id: 'm2', text: 'Thanks Suki! Still optimizing the vertex pipeline though.', senderId: '1', timestamp: '2M_AGO' }
  ]);

  const students: StudentNode[] = [
    { uid: '1', name: 'Alex Rivera', expertise: ['Quantum UI', 'Neural Net'], location: 'Berlin, DE', rank: 'ELITE', projects: 12, doubtsCleared: 45 },
    { uid: '2', name: 'Suki Tanaka', expertise: ['React Core', 'Motion'], location: 'Tokyo, JP', rank: 'PRODIGY', projects: 8, doubtsCleared: 112 },
    { uid: '3', name: 'Zaid Ahmed', expertise: ['Rust', 'Vortex Backend'], location: 'Dubai, UAE', rank: 'SYNAPSE', projects: 15, doubtsCleared: 34 },
  ];

  const projects: GreyMatterProject[] = [
    { 
      id: 'p1', 
      authorId: '1', 
      authorName: 'Alex Rivera', 
      title: 'Neural Vision Bridge', 
      description: 'A cross-protocol image processing engine that bypasses standard latency bottlenecks for real-time analysis.',
      tags: ['IIT-JEE', 'Physics', 'AI'],
      likes: 245,
      comments: 56,
      featured: true,
      category: 'IIT'
    },
    { 
      id: 'p2', 
      authorId: '2', 
      authorName: 'Suki Tanaka', 
      title: 'Lattice Motion Engine', 
      description: 'A new approach to 3D rendering in browsers using lattice-based transformation matrices for medical visualization.',
      tags: ['Medical', 'Bio-Tech', '3D'],
      likes: 189,
      comments: 32,
      featured: false,
      category: 'Medical'
    },
    { 
      id: 'p3', 
      authorId: '4', 
      authorName: 'Rohan Sharma', 
      title: 'Smart School Management', 
      description: 'An AI-driven platform for automating attendance and resource allocation in high schools.',
      tags: ['School', 'Automation', 'Python'],
      likes: 120,
      comments: 15,
      featured: false,
      category: 'School'
    }
  ];

  const categories = ['ALL', 'SCHOOL', 'IIT', 'MEDICAL', 'PARA-MEDICAL'];
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const filteredProjects = projects.filter(p => 
    (selectedCategory === 'ALL' || p.category?.toUpperCase() === selectedCategory) &&
    (p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const doubts: NeuralDoubt[] = [
    { 
      id: 'd1', 
      authorId: 'u4', 
      authorName: 'Leo Chen', 
      question: 'How to handle vertex overflow in WebGL?', 
      context: 'I am seeing significant artifacts when pushing more than 1M vertices in a single draw call...',
      status: 'PENDING',
      timestamp: '10M_AGO'
    },
    { 
      id: 'd2', 
      authorId: 'u5', 
      authorName: 'Elena Volkov', 
      question: 'Express vs Fastify for high-load AI streaming?', 
      context: 'Building a real-time speech-to-text bridge. Need advice on the most stable socket layer.',
      status: 'RESOLVED',
      timestamp: '2H_AGO'
    }
  ];

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-saffron-600/10 border border-saffron-500/30 text-saffron-500 text-[9px] font-mono font-black uppercase tracking-[0.4em] shadow-xl">
            <Brain className="w-3.5 h-3.5 fill-current" /> Neural Connectivity Stream
          </div>
          <h2 className="text-5xl lg:text-7xl font-black text-white tracking-tighter uppercase italic premium-text-gradient">
            Grey Matter
          </h2>
          <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.5em] font-black">Autonomous Student Network // GLOBAL_BRAIN_V1</p>
        </div>

        <div className="flex gap-4 p-1.5 bg-slate-900/60 border border-slate-900 rounded-[2rem] backdrop-blur-xl">
          {['PROJECTS', 'DOUBTS', 'STUDENTS', 'MESSAGES'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={cn(
                "px-8 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === tab 
                  ? "bg-saffron-600 text-white shadow-xl shadow-saffron-600/30" 
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Sidebar - Network Stats */}
        <div className="lg:col-span-3 space-y-8">
           <div className="p-8 bg-slate-950/40 border border-slate-900 rounded-[2.5rem] space-y-10 group shadow-2xl relative overflow-hidden backdrop-blur-md">
             <div className="absolute top-0 right-0 p-4 opacity-10">
               <Activity className="w-12 h-12 text-saffron-500" />
             </div>
             
             <div className="space-y-6">
                <h3 className="text-[10px] font-mono text-slate-600 uppercase tracking-[0.5em] font-black italic">Network Pulse</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Active Synapses</span>
                      <span className="text-lg font-mono text-white font-black">4,281</span>
                    </div>
                    <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '85%' }}
                        className="h-full bg-saffron-500 shadow-[0_0_10px_rgba(255,116,18,0.5)]"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Knowledge Mass</span>
                      <span className="text-lg font-mono text-white font-black">1.2 PB</span>
                    </div>
                    <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '62%' }}
                        className="h-full bg-orange-500 shadow-[0_0_10px_rgba(242,86,7,0.5)]"
                      />
                    </div>
                  </div>
                </div>
             </div>

             <div className="pt-6 border-t border-slate-900">
               <button className="w-full flex items-center justify-between text-[10px] font-mono text-saffron-500 font-black uppercase tracking-widest group">
                 <span>Recruit Brilliants</span>
                 <Share2 className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
               </button>
             </div>
           </div>

           <div className="p-8 bg-saffron-600 rounded-[2.5rem] shadow-[0_20px_50px_rgba(242,86,7,0.2)] text-white space-y-6 relative overflow-hidden group">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 blur-[60px] rounded-full group-hover:bg-white/20 transition-all duration-700" />
              <div className="relative z-10">
                <Star className="w-8 h-8 fill-white mb-6" />
                <h4 className="text-xl font-black uppercase italic leading-none mb-2">Neural Tier</h4>
                <p className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-80">Sync Level: PREMIUM_GOLD</p>
                <div className="mt-8">
                  <button className="px-6 py-3 bg-white text-saffron-600 rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-xl hover:-translate-y-0.5 transition-transform">
                    View Rankings
                  </button>
                </div>
              </div>
           </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-9 space-y-8">
          <div className="flex flex-col gap-6">
            <div className="relative group">
              <Search className="w-5 h-5 absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-saffron-500 transition-colors" />
              <input 
                type="text" 
                placeholder={`Search ${activeTab.toLowerCase()} in neural network...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/40 border border-slate-900 rounded-3xl py-6 pl-16 pr-8 text-sm font-mono text-white focus:outline-none focus:border-saffron-500/50 shadow-2xl transition-all font-bold placeholder:text-slate-800 backdrop-blur-md"
              />
            </div>

            {activeTab === 'PROJECTS' && (
              <div className="flex flex-wrap gap-3">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border",
                      selectedCategory === cat
                        ? "bg-saffron-600 border-saffron-500 text-white shadow-lg shadow-saffron-600/20"
                        : "bg-slate-900/40 border-slate-800 text-slate-500 hover:text-slate-300"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {activeTab === 'PROJECTS' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredProjects.map(project => (
                    <div key={project.id} className="group p-8 bg-slate-900/20 border border-slate-900 hover:border-saffron-500/30 rounded-[2.5rem] transition-all cursor-pointer relative overflow-hidden shadow-2xl backdrop-blur-sm">
                      <div className="absolute top-0 right-0 p-8">
                        <ArrowUpRight className="w-6 h-6 text-slate-800 group-hover:text-saffron-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                      </div>
                      <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-6">
                           <div className="w-10 h-10 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center shadow-lg group-hover:border-saffron-500/20 transition-colors">
                              <Cpu className="w-5 h-5 text-saffron-400" />
                           </div>
                           <div className="flex flex-col">
                             <span className="text-[9px] font-mono text-slate-600 font-bold uppercase tracking-widest">{project.authorName}</span>
                             <span className="text-[8px] font-mono text-saffron-600 font-black tracking-[0.2em] uppercase">NEURAL_ID_{project.authorId}</span>
                           </div>
                        </div>
                        <h3 className="text-2xl font-black text-white mb-4 uppercase italic tracking-tight">{project.title}</h3>
                        <p className="text-sm text-slate-400 leading-relaxed font-bold mb-8 flex-1 group-hover:text-slate-300 transition-colors">{project.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-8">
                           {project.tags.map(tag => (
                             <span key={tag} className="px-3 py-1 bg-slate-950 rounded-lg border border-slate-800 text-[8px] font-mono text-slate-600 font-black uppercase tracking-widest">{tag}</span>
                           ))}
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-slate-800/40">
                          <div className="flex gap-6">
                            <span className="flex items-center gap-2 text-[10px] font-mono text-slate-600 font-black"><Star className="w-3.5 h-3.5 fill-saffron-500 text-saffron-500" /> {project.likes}</span>
                            <span className="flex items-center gap-2 text-[10px] font-mono text-slate-600 font-black"><MessageSquare className="w-3.5 h-3.5" /> {project.comments}</span>
                          </div>
                          <div className="w-2 h-2 rounded-full bg-saffron-500 animate-pulse" />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button className="group relative rounded-[2.5rem] border-2 border-dashed border-slate-900 hover:border-saffron-500/40 transition-all flex flex-col items-center justify-center p-12 space-y-4">
                    <div className="w-16 h-16 rounded-[2rem] bg-slate-900/50 flex items-center justify-center group-hover:bg-saffron-600 transition-colors duration-500">
                      <Plus className="w-8 h-8 text-slate-600 group-hover:text-white transition-all transform group-hover:rotate-90" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-600 font-black uppercase tracking-[0.5em] group-hover:text-saffron-500 transition-colors">Propagate New Project</span>
                  </button>
                </div>
              )}

              {activeTab === 'DOUBTS' && (
                <div className="space-y-6">
                  {doubts.map(doubt => (
                    <div key={doubt.id} className="group p-8 bg-slate-900/10 border border-slate-900 hover:border-saffron-500/20 rounded-[2rem] transition-all flex flex-col md:flex-row gap-8 shadow-xl backdrop-blur-sm">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "px-3 py-1 rounded-full border text-[9px] font-black tracking-widest uppercase",
                            doubt.status === 'RESOLVED' ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" : "bg-saffron-500/10 border-saffron-500/30 text-saffron-500"
                          )}>
                            {doubt.status}
                          </div>
                          <span className="text-[10px] font-mono text-slate-700 font-bold uppercase tracking-widest flex items-center gap-2">
                             <Clock className="w-3 h-3" /> {doubt.timestamp}
                          </span>
                        </div>
                        <h4 className="text-xl font-black text-white italic tracking-tight">{doubt.question}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-bold">{doubt.context}</p>
                        <div className="flex items-center gap-4">
                           <span className="text-[9px] font-mono text-slate-600 font-black uppercase tracking-[0.3em] italic">SIGNAL_FROM: {doubt.authorName}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <button className="px-8 py-4 bg-saffron-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-saffron-500 transition-all shadow-xl shadow-saffron-900/20 active:scale-95 flex items-center gap-3">
                          <Zap className="w-4 h-4 fill-white" /> Offer Synthesis
                        </button>
                        <button className="p-4 border border-slate-800 rounded-2xl text-slate-600 hover:text-white hover:bg-slate-900 transition-all">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'STUDENTS' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {students.map(student => (
                    <div key={student.uid} className="group p-8 bg-slate-900/30 border border-slate-900 hover:border-saffron-500/30 rounded-[2.5rem] transition-all text-center space-y-6 relative overflow-hidden shadow-2xl backdrop-blur-md">
                       <div className="relative inline-block">
                         <div className="w-20 h-20 rounded-[2rem] bg-slate-950 border-2 border-slate-900 flex items-center justify-center group-hover:border-saffron-500 transition-colors mx-auto shadow-2xl overflow-hidden relative">
                           <User className="w-10 h-10 text-slate-700 group-hover:text-saffron-500 transition-colors" />
                         </div>
                         <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-saffron-600 border-4 border-slate-950 shadow-xl flex items-center justify-center">
                           <Zap className="w-2.5 h-2.5 text-white fill-white" />
                         </div>
                       </div>
                       
                       <div className="space-y-1">
                         <h4 className="text-lg font-black text-white italic tracking-tight">{student.name}</h4>
                         <p className="text-[9px] font-mono text-saffron-500 font-black uppercase tracking-[0.2em]">{student.rank} PROXY</p>
                         <p className="text-[9px] font-mono text-slate-700 uppercase font-black">{student.location}</p>
                       </div>

                       <div className="flex flex-wrap justify-center gap-2">
                         {student.expertise.map(skill => (
                           <span key={skill} className="px-2 py-1 bg-slate-950 rounded-lg text-[8px] font-mono text-slate-500 font-bold border border-slate-900">{skill}</span>
                         ))}
                       </div>

                       <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-900 pb-6 pt-6">
                          <div className="text-center">
                            <p className="text-sm font-mono text-white font-black">{student.projects}</p>
                            <p className="text-[8px] font-mono text-slate-600 font-bold uppercase tracking-widest">Nodes</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-mono text-white font-black">{student.doubtsCleared}</p>
                            <p className="text-[8px] font-mono text-slate-600 font-bold uppercase tracking-widest">Clears</p>
                          </div>
                       </div>

                       <button className="w-full py-4 bg-slate-950 text-slate-400 group-hover:bg-saffron-600 group-hover:text-white transition-all font-black text-[9px] uppercase tracking-[0.4em] rounded-[1.5rem] border border-slate-900 group-hover:border-saffron-500 shadow-xl active:scale-95">
                         Neural Link
                       </button>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'MESSAGES' && (
                <div className="h-[600px] bg-slate-900/10 border border-slate-900 rounded-[2.5rem] overflow-hidden flex shadow-2xl backdrop-blur-xl">
                  {/* Chat Sidebar */}
                  <div className="w-80 border-r border-slate-800 bg-slate-950/40 flex flex-col">
                    <div className="p-6 border-b border-slate-800">
                      <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em] font-black italic">Synced Proxies</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {students.map(student => (
                        <button 
                          key={student.uid}
                          onClick={() => setSelectedStudent(student)}
                          className={cn(
                            "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group",
                            selectedStudent?.uid === student.uid 
                              ? "bg-saffron-600/10 border-saffron-500/30 shadow-lg" 
                              : "border-transparent hover:bg-slate-800/40"
                          )}
                        >
                          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center relative shadow-md">
                            <Users className="w-5 h-5 text-slate-600 group-hover:text-saffron-500" />
                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-saffron-500 border-4 border-slate-950 shadow-lg" />
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className="text-[11px] font-black text-white uppercase italic truncate">Proxy_{student.name.split(' ')[0]}</span>
                            <span className="text-[8px] font-mono text-saffron-600 font-bold uppercase tracking-widest">Active Link</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chat Area */}
                  <div className="flex-1 flex flex-col relative">
                    {selectedStudent ? (
                      <>
                        <header className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/20 backdrop-blur-md">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-saffron-600 shadow-xl shadow-saffron-600/20 rounded-xl">
                              <Brain className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-black text-white italic uppercase tracking-tighter">Linking with {selectedStudent.name}</h3>
                              <p className="text-[8px] font-mono text-slate-600 uppercase tracking-[0.4em] font-black">Neural Tunnel V1</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-slate-600">
                             <Globe className="w-4 h-4" />
                             <Activity className="w-4 h-4 text-saffron-500" />
                          </div>
                        </header>

                        <div className="flex-1 overflow-y-auto p-8 space-y-6 flex flex-col">
                          {gmMessages.map((msg) => {
                            const isMe = msg.senderId === 'me';
                            return (
                              <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn(
                                  "max-w-[80%] p-4 rounded-2xl text-[11px] font-bold border backdrop-blur-sm",
                                  isMe 
                                    ? "ml-auto bg-saffron-600 border-saffron-500 text-white rounded-tr-none" 
                                    : "bg-slate-900/60 border-slate-800 text-slate-300 rounded-tl-none"
                                )}
                              >
                                {msg.text}
                                <div className="mt-2 text-[8px] opacity-40 font-mono text-right">{msg.timestamp}</div>
                              </motion.div>
                            );
                          })}
                        </div>

                        <div className="p-6 bg-slate-950/60 border-t border-slate-800 backdrop-blur-xl">
                          <form 
                            onSubmit={(e) => {
                              e.preventDefault();
                              if (!messageInput.trim()) return;
                              setGmMessages([...gmMessages, {
                                id: Date.now().toString(),
                                text: messageInput,
                                senderId: 'me',
                                timestamp: 'NOW'
                              }]);
                              setMessageInput('');
                            }}
                            className="relative"
                          >
                            <input 
                              type="text" 
                              value={messageInput}
                              onChange={(e) => setMessageInput(e.target.value)}
                              placeholder="Propagate neural signal..."
                              className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-6 pr-16 text-[11px] font-mono text-white focus:outline-none focus:border-saffron-500/50 shadow-2xl transition-all font-bold placeholder:text-slate-800"
                            />
                            <button 
                              type="submit"
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-saffron-600 text-white rounded-xl shadow-lg hover:bg-saffron-500 transition-all active:scale-95"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </form>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center space-y-6 opacity-20 grayscale grayscale animate-pulse">
                        <Users className="w-16 h-16 text-saffron-500" />
                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.5em] font-black">Select a Proxy to Initialise Link</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
