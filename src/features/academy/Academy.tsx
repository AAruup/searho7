import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
  Video, 
  Users, 
  BookOpen, 
  Star, 
  Search, 
  MessageSquare,
  Cpu,
  Bot,
  Code,
  Rocket,
  CirclePlay,
  Languages,
  Plus,
  Send,
  Loader2,
  VideoOff,
  Mic,
  MicOff,
  X,
  Phone,
  MonitorPlay,
  IdCard,
  School,
  Wallet,
  Globe,
  Zap,
  CheckCircle2,
  Camera,
  ShieldCheck
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { askSeaRho7 } from '../../services/assistantGateway';
import ReactMarkdown from 'react-markdown';
import { UserProfile } from '../../types';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../lib/firestoreUtils';

// Enhanced Types for Social Aspect
interface AcademyStudent extends UserProfile {
  isOnline?: boolean;
  projectsCount?: number;
  connections?: number;
}

const SUBJECTS = [
  { id: 'coding', name: 'Coding', icon: Code, color: 'bg-vision-blue-500', description: 'Master Web, App, and AI development.' },
  { id: 'robotics', name: 'Robotics', icon: Cpu, color: 'bg-vision-blue-600', description: 'Build and program intelligent machines.' },
  { id: 'space', name: 'Space Science', icon: Rocket, color: 'bg-saffron-500', description: 'Explore the universe and astrophysics.' },
  { id: 'design', name: 'UI/UX Design', icon: Star, color: 'bg-saffron-400', description: 'Learn visual storytelling and product design.' },
];

export const Academy: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'DISCOVER' | 'PROJECTS' | 'COMMUNITY' | 'LEARN' | 'TEACH'>('DISCOVER');
  const [showProfileSetup, setShowProfileSetup] = useState(!user?.schoolName && !user?.collegeName);
  
  // Real-time Data State
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [peers, setPeers] = useState<AcademyStudent[]>([]);
  const [teachers, setTeachers] = useState<UserProfile[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [activeRoom, setActiveRoom] = useState<{ id: string; name: string } | null>({ id: 'global', name: 'Academy Global Chat' });
  const chatEndRef = useRef<HTMLDivElement>(null);

  // AI Logic Constants (local state if needed)
  const [activeAiSubject, setActiveAiSubject] = useState<any | null>(null);
  const [aiQuery, setAiQuery] = useState('');
  const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [isAiStreaming, setIsAiStreaming] = useState(false);

  // Profile Setup State
  const [school, setSchool] = useState(user?.schoolName || '');
  const [college, setCollege] = useState(user?.collegeName || '');
  const [teacherSubject, setTeacherSubject] = useState(user?.teacherSubject || '');
  const [teacherFee, setTeacherFee] = useState(user?.teacherFee || 0);
  const [hasIdCard, setHasIdCard] = useState(!!user?.idCardURL);

  // Sync Messages
  useEffect(() => {
    if (activeTab === 'COMMUNITY' && activeRoom) {
      const q = query(
        collection(db, 'messages'), 
        where('roomId', '==', activeRoom.id),
        orderBy('createdAt', 'asc'), 
        limit(50)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMessages(msgs);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }, (error) => handleFirestoreError(error, OperationType.LIST, 'messages'));
      return () => unsubscribe();
    }
  }, [activeTab, activeRoom]);

  // Sync Global Peer Presence
  useEffect(() => {
    const usersRef = collection(db, 'users');
    const qUsers = query(usersRef, orderBy('lastSeen', 'desc'), limit(50));
    
    const unsubscribeUsers = onSnapshot(qUsers, (snapshot) => {
      const allUsers = snapshot.docs.map(doc => doc.data() as AcademyStudent);
      setTeachers(allUsers.filter(u => u.isTeacher));
      setPeers(allUsers.filter(u => u.schoolName || u.collegeName));
    }, (error) => console.error("Presence sync error:", error));

    const qProjects = query(collection(db, 'projects'), orderBy('createdAt', 'desc'), limit(20));
    const unsubscribeProjects = onSnapshot(qProjects, (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'projects'));
    
    return () => {
      unsubscribeUsers();
      unsubscribeProjects();
    };
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !activeRoom) return;
    const msgData = {
      text: newMessage.trim(),
      senderId: user.uid,
      senderName: user.displayName,
      senderPhoto: user.photoURL,
      roomId: activeRoom.id,
      createdAt: serverTimestamp()
    };
    setNewMessage('');
    try {
      await addDoc(collection(db, 'messages'), msgData);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'messages');
    }
  };

  const startDM = (peer: UserProfile) => {
    if (!user || user.uid === peer.uid) return;
    const ids = [user.uid, peer.uid].sort();
    const roomId = `dm_${ids[0]}_${ids[1]}`;
    setActiveRoom({ id: roomId, name: `Chat with ${peer.displayName}` });
    setActiveTab('COMMUNITY');
  };

  const isOnline = (p: UserProfile) => {
    if (!p.isOnline) return false;
    if (!p.lastSeen) return false;
    
    // If lastSeen was more than 5 mins ago, consider offline
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
    const lastSeenDate = p.lastSeen?.toDate ? p.lastSeen.toDate() : new Date(p.lastSeen);
    return lastSeenDate > fiveMinsAgo;
  };

  const handleProfileUpdate = async () => {
    if (!school && !college) return;
    try {
      await updateProfile({
        schoolName: school,
        collegeName: college,
        idCardURL: hasIdCard ? 'verified_placeholder_url' : '',
        role: user?.role || 'student'
      });
      setShowProfileSetup(false);
    } catch (e) {
      console.error(e);
    }
  };

  const enrollAsTeacher = async () => {
    if (!teacherSubject) return;
    try {
      await updateProfile({
        isTeacher: true,
        teacherSubject: teacherSubject,
        teacherFee: Number(teacherFee) || 20,
        role: 'teacher'
      });
      alert("Welcome to the Faculty! You are now an Expert Node.");
    } catch (e) {
      console.error(e);
    }
  };

  // AI Tutor Logic (Previously implemented but kept here for flow)
  const handleAiAsk = async () => {
    if (!aiQuery.trim() || isAiStreaming || !activeAiSubject) return;
    
    const userMsg = aiQuery.trim();
    setAiQuery('');
    setAiMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsAiStreaming(true);

    try {
      setAiMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      const result = await askSeaRho7({
        question: userMsg,
        mode: `academy-${activeAiSubject.id || activeAiSubject.name}`,
        roomId: 'academy-ai-tutor',
        userName: user?.displayName || 'student',
        useSearch: true,
        context: [
          `The student is learning ${activeAiSubject.name}.`,
          `School or college: ${user?.schoolName || user?.collegeName || 'not set'}.`,
          'Teach clearly. Give one simple example and one practice step.',
        ].join('\n'),
      });

      setAiMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content = result.text;
        return newMessages;
      });
    } catch (error) {
      console.error("AI Tutor Error:", error);
      setAiMessages(prev => {
        const newMessages = [...prev];
        if (newMessages[newMessages.length - 1]?.role === 'assistant') {
          newMessages[newMessages.length - 1].content = "I could not answer this one yet. Try again from AI Chat or ask the topic in a simpler sentence.";
          return newMessages;
        }
        return [...newMessages, { role: 'assistant', content: "I could not answer this one yet. Try again from AI Chat or ask the topic in a simpler sentence." }];
      });
    } finally {
      setIsAiStreaming(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      {/* Dynamic Header: Blue & Saffron Fusion */}
      <div className="relative overflow-hidden pt-12 pb-24 px-6 rounded-[3rem] bg-gradient-to-br from-vision-blue-900/40 via-slate-950 to-saffron-900/20 border border-slate-900 mb-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-vision-blue-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-saffron-500/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-vision-blue-500/10 text-vision-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-vision-blue-500/20">
              <Zap className="w-3.5 h-3.5" /> Virtualized Hyper-School
            </div>
            <h1 className="text-6xl font-black italic tracking-tighter leading-none">
              VISION <span className="text-vision-blue-500">ACADEMY</span>
              <span className="block text-saffron-500">NETWORK.</span>
            </h1>
            <p className="text-slate-400 text-sm max-w-xl font-medium tracking-wide leading-relaxed">
              Connect with students globally, learn from freelance experts, and master technology. 
              Earn, collaborate, and evolve in the saffron-blue digital campus.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl text-center">
              <p className="text-2xl font-black text-vision-blue-400 italic">2.4k+</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Active Students</p>
            </div>
            <div className="p-6 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl text-center">
              <p className="text-2xl font-black text-saffron-500 italic">150+</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Freelance Tutors</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Navigation */}
      <div className="flex flex-wrap gap-4 mb-12 p-3 bg-slate-900/40 rounded-[2.5rem] border border-slate-900 w-fit">
        {[
          { id: 'DISCOVER', label: 'Explore', icon: Globe, color: 'text-vision-blue-500' },
          { id: 'PROJECTS', label: 'Project Hub', icon: Rocket, color: 'text-saffron-500' },
          { id: 'COMMUNITY', label: 'Community', icon: Users, color: 'text-emerald-500' },
          { id: 'LEARN', label: 'Curriculum', icon: BookOpen, color: 'text-vision-blue-400' },
          { id: 'TEACH', label: 'Teach & Earn', icon: Wallet, color: 'text-saffron-400' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "px-8 py-4 rounded-2xl flex items-center gap-3 text-[11px] font-black uppercase tracking-widest transition-all",
              activeTab === tab.id 
                ? "bg-slate-950 border border-slate-800 text-white shadow-2xl scale-105" 
                : "text-slate-500 hover:text-slate-300"
            )}
          >
            <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? tab.color : "")} />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* DISCOVER TAB: School/College Feed & Subjects */}
        {activeTab === 'DISCOVER' && (
          <motion.div 
            key="discover" 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-12"
          >
            {/* Left: Subjects Grid */}
            <div className="lg:col-span-2 space-y-8">
               <div className="flex items-center gap-4">
                  <h2 className="text-3xl font-black italic uppercase">Hyper <span className="text-vision-blue-500">Subjects</span></h2>
                  <div className="flex-1 h-px bg-slate-900" />
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {SUBJECTS.map(subj => (
                   <div key={subj.id} className="group p-8 rounded-[3rem] bg-slate-900/40 border border-slate-900 hover:border-vision-blue-500/30 transition-all relative overflow-hidden">
                     <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6", subj.color)}>
                        <subj.icon className="w-8 h-8 text-white" />
                     </div>
                     <h3 className="text-2xl font-black italic uppercase mb-2">{subj.name}</h3>
                     <p className="text-slate-400 text-xs leading-relaxed mb-8">{subj.description}</p>
                     <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-vision-blue-400 hover:text-white transition-colors group">
                        Enter Lab <Zap className="w-3.5 h-3.5 group-hover:scale-125 transition-transform" />
                     </button>
                   </div>
                 ))}
               </div>

               {/* Video Call Highlight */}
               <div className="p-10 rounded-[3.5rem] bg-gradient-to-r from-saffron-600 to-vision-blue-600 relative overflow-hidden group shadow-2xl">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                    <div className="space-y-4">
                      <h3 className="text-4xl font-black italic uppercase leading-none">Global Classroom <br/> <span className="text-white/80">Live Session 01</span></h3>
                      <p className="text-white/70 text-xs font-medium tracking-widest uppercase">Robotics Engineering • Started 15m ago</p>
                    </div>
                    <button className="px-10 py-5 bg-white text-slate-950 font-black rounded-3xl text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-black/20 flex items-center gap-3">
                      Join Live Class <Video className="w-5 h-5" />
                    </button>
                  </div>
               </div>
            </div>

            {/* Right: Social Sidebar */}
            <div className="space-y-8">
               <div className="bg-slate-900/40 border border-slate-900 rounded-[3rem] p-8 space-y-8">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-black italic uppercase text-saffron-500">Top Peers</h3>
                    <Users className="w-5 h-5 text-slate-700" />
                  </div>
                  
                  <div className="space-y-6">
                    {peers.length > 0 ? peers.filter(p => p.uid !== user?.uid).map(student => (
                      <div 
                        key={student.uid} 
                        onClick={() => startDM(student)}
                        className="flex items-center gap-4 group cursor-pointer hover:bg-slate-800/40 p-3 rounded-2xl transition-all"
                      >
                        <div className="relative">
                          <img src={student.photoURL || `https://i.pravatar.cc/150?u=${student.uid}`} alt={student.displayName} className="w-12 h-12 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all border border-slate-800" />
                          {isOnline(student) && <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-black uppercase text-white truncate">{student.displayName}</h4>
                          <p className="text-[9px] font-mono text-slate-500 truncate uppercase mt-0.5">{student.schoolName || student.collegeName}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-black text-vision-blue-500 italic">{student.projectsCount || 0}P</p>
                           <p className={cn("text-[7px] font-black uppercase", isOnline(student) ? "text-emerald-500" : "text-slate-600")}>
                             {isOnline(student) ? 'Live' : 'Node Idle'}
                           </p>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-10">
                        <p className="text-[9px] font-black uppercase text-slate-700 tracking-widest">Searching Network...</p>
                      </div>
                    )}
                  </div>

                  <button className="w-full py-4 bg-slate-950 border border-slate-800 rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:border-saffron-500/40 hover:text-white transition-all">
                    Discover More Nodes
                  </button>
               </div>

               {/* Your Profile Card */}
               <div className="p-8 rounded-[3rem] bg-vision-blue-600/5 border border-vision-blue-500/20 space-y-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                     <ShieldCheck className="w-8 h-8 text-vision-blue-500" />
                  </div>
                  <div className="flex items-center gap-4">
                    <img src={user?.photoURL || 'https://i.pravatar.cc/100?img=auth'} className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-800" alt="Me" />
                    <div>
                      <h4 className="text-xl font-black italic uppercase">{user?.displayName || 'Student Alpha'}</h4>
                      <p className="text-[9px] font-mono text-vision-blue-400 uppercase tracking-[0.2em]">{user?.schoolName || user?.collegeName || 'Node Unconfigured'}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowProfileSetup(true)}
                    className="w-full py-4 bg-vision-blue-600 text-white font-black rounded-2xl text-[9px] uppercase tracking-[0.3em] hover:bg-vision-blue-500 transition-all shadow-lg shadow-vision-blue-900/20"
                  >
                    Edit Neural ID
                  </button>
               </div>
            </div>
          </motion.div>
        )}

        {/* PROJECTS TAB: The Hub */}
        {activeTab === 'PROJECTS' && (
          <motion.div 
            key="projects" 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h2 className="text-3xl font-black italic uppercase">Project <span className="text-saffron-500">Hub</span></h2>
                <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mt-1">Real-time Node Activity Feed</p>
              </div>
              <button 
                onClick={() => {
                  const title = prompt("Project Title?");
                  const desc = prompt("Short Description?");
                  const status = prompt("Status? (In Progress, Review, Completed)") || 'In Progress';
                  if (title && user) {
                    addDoc(collection(db, 'projects'), {
                      title,
                      description: desc || '',
                      status,
                      studentId: user.uid,
                      studentName: user.displayName,
                      studentPhoto: user.photoURL,
                      likes: 0,
                      tags: ['Academy'],
                      createdAt: serverTimestamp()
                    }).catch(e => handleFirestoreError(e, OperationType.CREATE, 'projects'));
                  }
                }}
                className="px-8 py-4 bg-saffron-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-saffron-500 transition-all flex items-center gap-3 shadow-xl shadow-saffron-900/20"
              >
                <Plus className="w-4 h-4" /> Deploy New Node
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {projects.map(proj => (
                 <div key={proj.id} className="bg-slate-900/40 border border-slate-900 rounded-[3rem] p-8 space-y-6 hover:border-saffron-500/30 transition-all group shadow-xl">
                    <div className="flex justify-between items-start">
                       <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            proj.status === 'Completed' ? "bg-emerald-500" : 
                            proj.status === 'Review' ? "bg-vision-blue-500" : "bg-saffron-500 animate-pulse"
                          )} />
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest",
                            proj.status === 'Completed' ? "text-emerald-500" : 
                            proj.status === 'Review' ? "text-vision-blue-500" : "text-saffron-500"
                          )}>{proj.status}</span>
                       </div>
                       <button className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-500 hover:text-white transition-colors">
                          <Plus className="w-3 h-3" />
                       </button>
                    </div>

                    <div className="space-y-2">
                       <h3 className="text-xl font-black italic uppercase group-hover:text-saffron-500 transition-colors">{proj.title}</h3>
                       <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2">{proj.description}</p>
                    </div>

                    <div className="pt-4 flex items-center justify-between border-t border-slate-900/50">
                       <div className="flex items-center gap-3">
                          <img 
                            src={proj.studentPhoto || `https://i.pravatar.cc/100?u=${proj.studentId}`} 
                            className="w-8 h-8 rounded-lg object-cover border border-slate-800" 
                            alt={proj.studentName} 
                          />
                          <div>
                             <p className="text-[10px] font-black uppercase text-white">{proj.studentName}</p>
                             <p className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">Assignee</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 text-slate-500 group-hover:text-saffron-500 transition-colors cursor-pointer">
                             <Star className="w-3.5 h-3.5 fill-current" />
                             <span className="text-[10px] font-black">{proj.likes || 0}</span>
                          </div>
                       </div>
                    </div>
                 </div>
               ))}

               {projects.length === 0 && (
                 <div className="col-span-full py-20 text-center space-y-4">
                    <Loader2 className="w-10 h-10 text-slate-800 animate-spin mx-auto" />
                    <p className="text-[9px] font-black uppercase text-slate-600 tracking-widest">No Active Nodes Detected</p>
                 </div>
               )}
            </div>
          </motion.div>
        )}

        {/* COMMUNITY TAB: Social Platform */}
        {activeTab === 'COMMUNITY' && (
          <motion.div 
            key="community" 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-8"
          >
            {/* Navigation / Filters */}
            <div className="lg:col-span-1 space-y-6">
               <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-6">
                 <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Filter Network</h3>
                 <div className="space-y-2">
                   {['All Nodes', 'My School', 'My College', 'Prodigies', 'Collaborators'].map(f => (
                     <button key={f} className="w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
                       {f}
                     </button>
                   ))}
                 </div>
               </div>
               
               <div className="p-6 bg-saffron-500/5 border border-saffron-500/20 rounded-3xl">
                  <p className="text-[9px] font-black uppercase text-saffron-500 tracking-widest mb-3">Trending Subject</p>
                  <p className="text-sm font-black italic uppercase text-white">#NeuralArchitecture</p>
               </div>
            </div>

            {/* Chat / Social Feed */}
            <div className="lg:col-span-3 space-y-8">
               <div className="bg-slate-900 border border-slate-800 rounded-[3rem] overflow-hidden flex flex-col h-[600px] shadow-2xl">
                  <div className="p-6 border-b border-slate-800 bg-slate-900/40 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-vision-blue-600 flex items-center justify-center text-white">
                          {activeRoom?.id === 'global' ? <MessageSquare className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                       </div>
                       <div>
                          <h4 className="text-xs font-black uppercase tracking-widest">{activeRoom?.name || 'Academy Network'}</h4>
                          <p className="text-[8px] font-mono text-emerald-500 uppercase">
                            {activeRoom?.id === 'global' ? `${peers.filter(isOnline).length} Active Nodes` : 'Private Neural Link'}
                          </p>
                       </div>
                    </div>
                    {activeRoom?.id !== 'global' && (
                      <button 
                        onClick={() => setActiveRoom({ id: 'global', name: 'Academy Global Chat' })}
                        className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all"
                      >
                         Back to Global
                      </button>
                    )}
                    <div className="hidden sm:flex -space-x-2">
                       {peers.filter(isOnline).slice(0, 3).map(p => (
                         <img key={p.uid} src={p.photoURL || `https://i.pravatar.cc/100?u=${p.uid}`} className="w-8 h-8 rounded-full border-2 border-slate-900 object-cover" alt="online" />
                       ))}
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-slate-950/20">
                     {messages.map((msg, idx) => (
                       <div key={msg.id || idx} className={cn("flex gap-4", msg.senderId === user?.uid ? "flex-row-reverse" : "")}>
                          <img 
                            src={msg.senderPhoto || `https://i.pravatar.cc/100?u=${msg.senderId}`} 
                            className="w-8 h-8 rounded-lg mt-1 object-cover border border-slate-800" 
                            alt="avatar" 
                          />
                          <div className={cn(
                            "p-4 rounded-2xl border space-y-1 max-w-[80%]",
                            msg.senderId === user?.uid 
                              ? "bg-vision-blue-600/10 border-vision-blue-500/20 rounded-tr-none text-right" 
                              : "bg-slate-900 border-slate-800 rounded-tl-none"
                          )}>
                             <p className={cn("text-[9px] font-black uppercase", msg.senderId === user?.uid ? "text-white" : "text-vision-blue-400")}>
                                {msg.senderName} {msg.senderId === user?.uid ? '' : '• Network Node'}
                             </p>
                             <p className="text-xs text-slate-300 leading-relaxed">{msg.text}</p>
                          </div>
                       </div>
                     ))}
                     <div ref={chatEndRef} />
                  </div>

                  <div className="p-6 bg-slate-900 border-t border-slate-800">
                     <div className="relative">
                        <input 
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Type your message to the network..." 
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-xs text-white focus:border-saffron-500 outline-none transition-all" 
                        />
                        <button 
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim()}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-saffron-600 rounded-xl text-white hover:bg-saffron-500 transition-all disabled:opacity-50"
                        >
                           <Send className="w-4 h-4" />
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        )}

        {/* LEARN TAB: AI Tutors & Materials */}
        {activeTab === 'LEARN' && (
          <motion.div 
            key="learn" 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <div className="p-10 rounded-[3rem] bg-slate-900 border border-slate-800 text-center space-y-6">
                  <div className="w-16 h-16 bg-vision-blue-600 rounded-2xl flex items-center justify-center mx-auto text-white shadow-lg">
                    <Bot className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-black italic uppercase">AI Tutor <br/> <span className="text-vision-blue-400 text-2xl">CORE V2</span></h4>
                  <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest">Personalized Intelligence</p>
                  <button 
                    onClick={() => setActiveAiSubject(SUBJECTS[0])}
                    className="w-full py-4 bg-slate-950 border border-slate-800 rounded-2xl text-[10px] font-black uppercase text-vision-blue-400 hover:bg-vision-blue-600 hover:text-white transition-all"
                  >
                    Launch Chat
                  </button>
               </div>
               
               <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-8 rounded-[3rem] bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 space-y-6">
                     <div className="flex justify-between items-center">
                        <h3 className="text-xl font-black italic uppercase text-white">Neural Pathways</h3>
                        <Zap className="w-5 h-5 text-saffron-500" />
                     </div>
                     <div className="space-y-4">
                        {SUBJECTS.map(subj => (
                          <div 
                            key={subj.id} 
                            onClick={() => setActiveAiSubject(subj)}
                            className="flex items-center justify-between p-4 bg-slate-950/40 border border-slate-900 rounded-2xl group cursor-pointer hover:border-vision-blue-500/30 transition-all"
                          >
                             <div className="flex items-center gap-3">
                               <subj.icon className="w-4 h-4 text-vision-blue-400" />
                               <p className="text-xs font-black uppercase text-slate-400 group-hover:text-white">{subj.name}</p>
                             </div>
                             <CheckCircle2 className="w-4 h-4 text-emerald-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                          </div>
                        ))}
                     </div>
                  </div>
                  
                  <div className="p-8 rounded-[3rem] bg-gradient-to-br from-vision-blue-900/20 to-slate-950 border border-vision-blue-500/20 flex flex-col justify-center items-center text-center space-y-4">
                     <div className="w-12 h-12 bg-vision-blue-500/10 rounded-xl flex items-center justify-center text-vision-blue-500 mb-2">
                        <BookOpen className="w-6 h-6" />
                     </div>
                     <h4 className="text-xl font-black italic uppercase">Material <br/> <span className="text-vision-blue-400">Inventory</span></h4>
                     <p className="text-slate-500 text-[9px] uppercase font-black tracking-widest">48 Exclusive Downloads</p>
                     <button className="px-6 py-3 bg-vision-blue-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-vision-blue-900/40">Open Vault</button>
                  </div>
               </div>
            </div>

            {/* AI Tutor Interface */}
            <AnimatePresence>
              {activeAiSubject && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-slate-900 border border-slate-800 rounded-[3rem] overflow-hidden flex flex-col h-[600px] shadow-3xl"
                >
                  <div className="p-6 border-b border-slate-800 bg-slate-900/40 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                       <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white", activeAiSubject.color)}>
                          <Bot className="w-6 h-6" />
                       </div>
                       <div>
                          <h4 className="text-sm font-black uppercase tracking-widest">{activeAiSubject.name} AI Tutor</h4>
                          <p className="text-[9px] font-mono text-vision-blue-400 uppercase tracking-widest">Neural Stream Active</p>
                       </div>
                    </div>
                    <button 
                      onClick={() => setActiveAiSubject(null)}
                      className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-500 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                    {aiMessages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                        <Cpu className="w-16 h-16 text-slate-800 animate-pulse" />
                        <div className="space-y-2">
                          <h3 className="text-xl font-black italic uppercase text-slate-300">Awaiting Query...</h3>
                          <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Ask me anything about {activeAiSubject.name}</p>
                        </div>
                      </div>
                    ) : (
                      aiMessages.map((msg, idx) => (
                        <div key={idx} className={cn("flex gap-6", msg.role === 'user' ? "flex-row-reverse" : "")}>
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", msg.role === 'assistant' ? activeAiSubject.color : "bg-slate-800")}>
                            {msg.role === 'assistant' ? <Bot className="w-6 h-6 text-white" /> : <img src={user?.photoURL || ''} className="w-full h-full rounded-xl object-cover" />}
                          </div>
                          <div className={cn(
                            "max-w-[80%] p-6 rounded-3xl text-sm leading-relaxed",
                            msg.role === 'assistant' ? "bg-slate-950/40 border border-slate-800 text-slate-300" : "bg-vision-blue-600/10 border border-vision-blue-500/20 text-white rounded-tr-none"
                          )}>
                             <div className="markdown-body prose prose-invert prose-xs max-w-none">
                               <ReactMarkdown>{msg.content}</ReactMarkdown>
                             </div>
                             {idx === aiMessages.length - 1 && isAiStreaming && (
                               <div className="flex gap-1 mt-4">
                                 <div className="w-1.5 h-1.5 rounded-full bg-vision-blue-500 animate-bounce" />
                                 <div className="w-1.5 h-1.5 rounded-full bg-vision-blue-500 animate-bounce [animation-delay:0.2s]" />
                                 <div className="w-1.5 h-1.5 rounded-full bg-vision-blue-500 animate-bounce [animation-delay:0.4s]" />
                               </div>
                             )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-6 bg-slate-900 border-t border-slate-800">
                    <div className="relative">
                      <input 
                        value={aiQuery}
                        onChange={(e) => setAiQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAiAsk()}
                        placeholder={`Ask questions about ${activeAiSubject.name}...`} 
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-5 px-8 text-sm text-white focus:border-vision-blue-500 outline-none transition-all" 
                      />
                      <button 
                        onClick={handleAiAsk}
                        disabled={isAiStreaming || !aiQuery.trim()}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-vision-blue-600 rounded-xl text-white hover:bg-vision-blue-500 transition-all disabled:opacity-50"
                      >
                         <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* TEACH TAB: Earn & Freelance */}
        {activeTab === 'TEACH' && (
          <motion.div 
            key="teach" 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            {/* Earnings Hero */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 p-12 rounded-[3.5rem] bg-gradient-to-br from-vision-blue-600 to-vision-blue-800 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                  <Wallet className="w-40 h-40" />
                </div>
                <div className="relative z-10 space-y-6">
                  <h2 className="text-5xl font-black italic uppercase leading-tight">Master. Teach. <br/> <span className="text-white/70">EARN REWARDS.</span></h2>
                  <p className="text-white/80 text-sm max-w-md font-medium">Turn your technical projects into a recurring stream of credits. High-performing students can monetize their help nodes and faculty experts can set custom rates.</p>
                  <div className="flex flex-wrap gap-4 pt-4">
                    <button className="px-10 py-5 bg-white text-vision-blue-700 font-black rounded-3xl text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
                      List Subject Profile
                    </button>
                    <button className="px-10 py-5 bg-black/20 text-white border border-white/20 font-black rounded-3xl text-xs uppercase tracking-widest hover:bg-black/30 transition-all">
                      Earnings History
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-10 rounded-[3.5rem] bg-slate-900 border border-slate-800 flex flex-col justify-between">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-6">Network Revenue</h3>
                  <div className="space-y-6">
                    <div className="flex justify-between items-end border-b border-slate-800 pb-4">
                       <p className="text-[10px] font-black uppercase text-slate-400">Project Nodes (Total)</p>
                       <p className="text-2xl font-black italic text-saffron-500 underline decoration-saffron-900 underline-offset-4 tracking-tighter">1,240.00 CR</p>
                    </div>
                    <div className="flex justify-between items-end border-b border-slate-800 pb-4">
                       <p className="text-[10px] font-black uppercase text-slate-400">Active Students</p>
                       <p className="text-2xl font-black italic text-vision-blue-400 underline decoration-vision-blue-900 underline-offset-4 tracking-tighter">42 NODES</p>
                    </div>
                  </div>
                </div>
                <div className="pt-8">
                   <div className="flex items-center gap-2 text-[9px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">
                      <Zap className="w-3.5 h-3.5 fill-current" /> Auto-payout enabled
                   </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-12">
               <h2 className="text-3xl font-black italic uppercase">Expert <span className="text-saffron-500">Marketplace</span></h2>
               <div className="flex-1 h-px bg-slate-900" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teachers.map(t => (
                <div key={t.uid} className="bg-slate-900/40 border border-slate-900 rounded-[3rem] p-10 space-y-8 group hover:border-saffron-500/30 transition-all relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6">
                    <p className="text-2xl font-black text-saffron-500 italic">${t.teacherFee || 20}<span className="text-[10px] text-slate-500 uppercase font-mono">/hr</span></p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden">
                       <img src={t.photoURL || `https://i.pravatar.cc/150?u=${t.uid}`} className="w-full h-full object-cover" alt="Expert" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black italic uppercase">{t.displayName}</h4>
                      <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{t.schoolName || t.collegeName || 'Independent'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <Zap className="w-4 h-4 text-saffron-500" />
                       <p className="text-xs font-black uppercase text-white">{t.teacherSubject}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Star className="w-3.5 h-3.5 text-saffron-500 fill-saffron-500" />
                        <span className="text-[10px] font-black">4.9</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isOnline(t) ? (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black text-emerald-500">Live Expert</span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-black text-slate-600">Expert Offline</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => startDM(t)}
                    className="w-full py-5 bg-slate-950 border border-slate-800 text-saffron-500 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-saffron-600 hover:text-white transition-all group"
                  >
                    Hire Expert Node <Rocket className="w-4 h-4 ml-2 inline group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                </div>
              ))}

              {/* Enrollment Trigger */}
              <div className="bg-gradient-to-br from-vision-blue-900/40 to-slate-900 border border-vision-blue-500/20 rounded-[3rem] p-10 flex flex-col justify-center items-center text-center space-y-6">
                 <div className="w-20 h-20 rounded-full bg-vision-blue-500/10 border border-vision-blue-500/30 flex items-center justify-center text-vision-blue-500">
                    <Plus className="w-10 h-10" />
                 </div>
                 <h4 className="text-2xl font-black italic uppercase leading-tight">Become a <span className="text-vision-blue-400">Collaborator</span></h4>
                 <p className="text-slate-400 text-xs leading-relaxed">Top students can enroll as tutors to earn credits by helping peers with local school projects.</p>
                 
                 <div className="w-full space-y-3">
                   <input 
                     value={teacherSubject}
                     onChange={(e) => setTeacherSubject(e.target.value)}
                     placeholder="Subject to teach" 
                     className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-[10px] text-white focus:border-vision-blue-500 outline-none" 
                   />
                   <button 
                    onClick={enrollAsTeacher}
                    className="w-full py-4 bg-vision-blue-600 text-white font-black rounded-2xl text-[9px] uppercase tracking-widest hover:scale-105 transition-all"
                   >
                     Start Earning
                   </button>
                 </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile / School Setup Modal */}
      <AnimatePresence>
        {showProfileSetup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/95 backdrop-blur-3xl" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }}
              className="relative w-full max-w-2xl bg-slate-900 border-2 border-slate-800 rounded-[3.5rem] p-12 lg:p-20 shadow-3xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-saffron-500 via-vision-blue-500 to-saffron-500" />
              
              <div className="space-y-12 text-center">
                 <div className="w-24 h-24 bg-vision-blue-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-vision-blue-600/40 transform -rotate-12">
                   <IdCard className="w-12 h-12 text-white" />
                 </div>
                 
                 <div className="space-y-4">
                   <h3 className="text-4xl font-black italic uppercase tracking-tighter">Initialize <span className="text-vision-blue-400">Student Identity</span></h3>
                   <p className="text-slate-400 text-sm font-medium tracking-widest uppercase">School or College Verification Required for Hub Access</p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                   <div className="space-y-3">
                     <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-widest">
                       <School className="w-3.5 h-3.5" /> Educational Institution
                     </label>
                     <input 
                       value={school || college}
                       onChange={(e) => setSchool(e.target.value)}
                       placeholder="School or College Name" 
                       className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white text-xs focus:border-vision-blue-500 outline-none transition-all font-mono" 
                     />
                   </div>
                   <div className="space-y-3">
                     <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-widest">
                       <Camera className="w-3.5 h-3.5" /> ID Identity Scan
                     </label>
                     <button 
                       onClick={() => setHasIdCard(true)}
                       className={cn(
                         "w-full h-[3.25rem] rounded-2xl flex items-center justify-center gap-3 border transition-all text-[10px] font-black uppercase tracking-widest",
                         hasIdCard ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-500" : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600"
                       )}
                     >
                       {hasIdCard ? <><CheckCircle2 className="w-4 h-4" /> Identity Verified</> : <><Search className="w-4 h-4" /> Scan ID Card</>}
                     </button>
                   </div>
                 </div>

                 <div className="pt-6 space-y-4">
                    <button 
                      onClick={handleProfileUpdate}
                      disabled={!hasIdCard || !(school || college)}
                      className="w-full py-5 bg-vision-blue-600 text-white font-black rounded-3xl text-sm uppercase tracking-[0.3em] hover:bg-vision-blue-500 transition-all shadow-2xl shadow-vision-blue-900/40 disabled:opacity-50 disabled:grayscale"
                    >
                      Authenticate Node
                    </button>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">Privacy Secure: Data stays within Academy Network</p>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Class Materials: Hover Sidebar Placeholder */}
      <div className="fixed bottom-12 left-12 z-40 group">
         <div className="flex items-center gap-4 cursor-pointer">
            <div className="w-14 h-14 bg-saffron-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-saffron-900/20 group-hover:scale-110 transition-transform">
               <BookOpen className="w-7 h-7" />
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-slate-800 p-4 rounded-2xl w-64 shadow-3xl">
               <p className="text-[10px] font-black uppercase tracking-widest text-saffron-500 mb-2">Global Materials</p>
               <div className="space-y-2">
                 {['PDF: Robbins & Coster Physics', 'Lab: Neural Networks 101', 'Archived: Robotics Finals'].map(m => (
                   <div key={m} className="text-[9px] font-medium text-slate-400 hover:text-white truncate cursor-pointer transition-colors border-b border-slate-800/50 pb-1 italic">
                     {m}
                   </div>
                 ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
