import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Hash, Lock, Search, MoreVertical, Plus, MessageSquare, Cpu, Volume2, Globe, Loader2, Star, Menu, X, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ChatMessage } from '../../types';
import { cn } from '../../lib/utils';
import ReactMarkdown from 'react-markdown';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  addDoc, 
  updateDoc,
  doc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../lib/firestoreUtils';
import { createHelpfulLocalAnswer } from '../../lib/localAssistant';
import { askSeaRho7 } from '../../services/assistantGateway';
import * as geminiService from '../../services/geminiService';

export const Chat: React.FC = () => {
  const { user: currentUser } = useAuth();
  const isOfflinePreview = typeof window !== 'undefined' && window.location.protocol === 'file:';
  const isLocalMode = isOfflinePreview || currentUser?.uid === 'local-agent';
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [useLocalFallback, setUseLocalFallback] = useState(false);
  const [inputText, setInputText] = useState('');
  const [activeRoom, setActiveRoom] = useState('academic-general');
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const [showRooms, setShowRooms] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const rooms = ['academic-general', 'coding-lab', 'math-physics', 'geography-history', 'medical-support', 'ai-tutor-hub'];

  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<string | null>(null);
  const useLocalResponses = isLocalMode || useLocalFallback;

  const appendLocalExchange = (text: string) => {
    if (!currentUser) return;
    const now = new Date().toISOString();
    const localUserMessage: ChatMessage = {
      id: `local-user-${Date.now()}`,
      text,
      authorId: currentUser.uid,
      authorName: currentUser.displayName || 'Local User',
      roomId: activeRoom,
      timestamp: now
    };
    const localAiMessage: ChatMessage = {
      id: `local-ai-${Date.now()}`,
      text: createHelpfulLocalAnswer(text),
      authorId: 'gemini-ai',
      authorName: 'SEA.RHO7',
      roomId: activeRoom,
      hasAiResponded: true,
      timestamp: now
    };

    setMessages(prev => [...prev, localUserMessage]);
    setIsAiGenerating(true);
    setStreamingMessage('');
    window.setTimeout(() => {
      setMessages(prev => [...prev, localAiMessage]);
      setStreamingMessage(null);
      setIsAiGenerating(false);
    }, 350);
  };

  // Sync Messages from Firestore
  useEffect(() => {
    if (useLocalResponses) {
      setMessages([{
        id: `local-welcome-${activeRoom}`,
        text: `SEA.RHO7 chat is ready in #${activeRoom}. Ask a study question, coding problem, Firebase issue, app idea, or lyrics prompt.`,
        authorId: 'gemini-ai',
        authorName: 'SEA.RHO7',
        roomId: activeRoom,
        hasAiResponded: true,
        timestamp: new Date().toISOString()
      }]);
      return;
    }

    const q = query(
      collection(db, 'messages'),
      where('roomId', '==', activeRoom),
      orderBy('createdAt', 'asc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString()
      } as ChatMessage));
      setMessages(msgs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'messages');
      setUseLocalFallback(true);
    });

    return () => unsubscribe();
  }, [activeRoom, useLocalResponses]);

  // AI Response Logic
  useEffect(() => {
    const processAiResponse = async () => {
      if (useLocalResponses) return;
      if (isAiGenerating || messages.length === 0) return;

      const lastMsg = messages[messages.length - 1];
      const aiTriggerRooms = chatTriggerRooms();
      
      if (aiTriggerRooms.includes(activeRoom) && lastMsg.authorId !== 'gemini-ai' && !lastMsg.hasAiResponded) {
        setIsAiGenerating(true);
        try {
          // Mark as responded in Firestore
          await updateDoc(doc(db, 'messages', lastMsg.id), {
            hasAiResponded: true
          });

          let systemPersona = "This is a shared student chat. Answer the user's request directly first. If they ask to teach or explain, give a clear lesson, example, and practice question. If they send a short acknowledgement like ok or yes, reply warmly and ask what they want to solve next.";
          if (activeRoom === 'coding-lab') systemPersona += " You are an expert software engineer. Provide clean, efficient code and technical explanations.";
          if (activeRoom === 'math-physics') systemPersona += " You are a PhD mathematician and physicist. Solve equations step-by-step and explain theories clearly.";
          if (activeRoom === 'geography-history') systemPersona += " You are a world-class historian and geographer. Provide rich context, coordinates, and historical significance.";
          if (activeRoom === 'medical-support') systemPersona += " You provide general wellness education, avoid diagnosis, and recommend a qualified professional for personal medical decisions.";

          setStreamingMessage("Thinking...");
          const result = await askSeaRho7({
            question: lastMsg.text,
            mode: `chat-${activeRoom}`,
            roomId: activeRoom,
            userName: lastMsg.authorName,
            context: systemPersona,
          });
          const fullText = result.text.trim();
          
          if (fullText) {
            await addDoc(collection(db, 'messages'), {
              text: fullText,
              authorId: 'gemini-ai',
              authorName: 'SEA.RHO7',
              roomId: activeRoom,
              hasAiResponded: true,
              grounding: result.grounding || null,
              createdAt: serverTimestamp()
            });
            setStreamingMessage(null);
          }
        } catch (error) {
          console.error("AI Node failed to respond:", error);
          const userFriendlyMsg = `Local helper response:\n\n${createHelpfulLocalAnswer(lastMsg.text)}\n\nLive Gemini did not answer. Check Settings > AI Soul > Test AI Connection.`;
          
          setStreamingMessage(userFriendlyMsg);
          await addDoc(collection(db, 'messages'), {
            text: userFriendlyMsg,
            authorId: 'gemini-ai',
            authorName: 'SEA.RHO7',
            roomId: activeRoom,
            hasAiResponded: true,
            createdAt: serverTimestamp()
          }).catch(writeError => {
            handleFirestoreError(writeError, OperationType.CREATE, 'messages');
            setUseLocalFallback(true);
          });
          setStreamingMessage(null);
        } finally {
          setIsAiGenerating(false);
        }
      }
    };

    processAiResponse();
  }, [messages, activeRoom, isAiGenerating, useLocalResponses]);

  const chatTriggerRooms = () => ['academic-general', 'coding-lab', 'math-physics', 'geography-history', 'medical-support', 'ai-tutor-hub'];

  const handleSpeak = async (msg: ChatMessage) => {
    if (isSpeaking) return;
    setIsSpeaking(msg.id);
    try {
      const audioUrl = await geminiService.generateSpeech(msg.text);
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.onended = () => setIsSpeaking(null);
        try {
          await audio.play();
        } catch (error: any) {
          if (error.name !== 'AbortError') {
            console.warn("TTS Playback failed:", error);
          }
          setIsSpeaking(null);
        }
      } else {
        setIsSpeaking(null);
      }
    } catch (error) {
      console.error("TTS failed:", error);
      setIsSpeaking(null);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingMessage]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !currentUser) return;
    
    const textToSend = inputText.trim();
    setInputText('');

    if (useLocalResponses) {
      appendLocalExchange(textToSend);
      return;
    }
    
    try {
      await addDoc(collection(db, 'messages'), {
        text: textToSend,
        authorId: currentUser.uid,
        authorName: currentUser.displayName || 'System User',
        roomId: activeRoom,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      handleFirestoreError(error, OperationType.CREATE, 'messages');
      setUseLocalFallback(true);
      appendLocalExchange(textToSend);
    }
  };

  const SidePanel = () => (
    <div className="w-full h-full flex flex-col">
      <div className="p-6 lg:p-8 border-b border-slate-900 bg-slate-950/40">
        <div className="relative group">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-saffron-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search rooms..." 
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-11 pr-5 text-xs font-mono focus:outline-none focus:border-saffron-500/50 text-slate-300 font-bold shadow-inner"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-10 custom-scrollbar">
        <div>
          <div className="flex justify-between items-center mb-6 px-2">
            <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em] font-black italic">Rooms</h3>
            <Plus className="w-4 h-4 text-slate-600 cursor-pointer hover:text-white transition-colors" />
          </div>
          <div className="space-y-2">
            {rooms.map(room => (
              <button
                key={room}
                onClick={() => { setActiveRoom(room); setShowRooms(false); }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-[11px] font-bold transition-all border group uppercase tracking-widest relative overflow-hidden",
                  activeRoom === room 
                    ? "bg-saffron-600/10 text-white border-saffron-500/20 shadow-lg" 
                    : "text-slate-500 border-transparent hover:bg-slate-900/60 hover:text-slate-300"
                )}
              >
                <span className="flex items-center gap-3 relative z-10">
                  <Hash className={cn("w-4 h-4 transition-colors", activeRoom === room ? "text-saffron-500 animate-pulse" : "opacity-30 group-hover:opacity-60")} />
                  {room}
                </span>
                {activeRoom === room && <div className="absolute right-0 top-0 h-full w-1 bg-saffron-500 shadow-[0_0_15px_rgba(255,116,18,0.5)]" />}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em] font-black italic mb-6 px-2">Active Guests</h3>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4 px-2 group">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center relative group-hover:border-saffron-500/30 transition-all shadow-md">
                  <User className="w-5 h-5 text-slate-600 group-hover:text-saffron-400" />
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-saffron-500 border-4 border-slate-950 shadow-[0_0_8px_rgba(255,116,18,0.5)]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-300 font-black tracking-tight uppercase group-hover:text-white transition-colors">Guest Student 0{i}</span>
                  <span className="text-[8px] text-saffron-500 font-mono tracking-[0.2em] font-black">ONLINE</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-10rem)] lg:h-[calc(100vh-12rem)] border border-slate-900 rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden flex bg-slate-900/10 backdrop-blur-xl shadow-2xl relative">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-80 border-r border-slate-900/50 bg-slate-950/40 flex-col">
        <SidePanel />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {showRooms && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRooms(false)}
              className="fixed lg:hidden inset-0 bg-slate-950/80 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed lg:hidden inset-y-0 left-0 w-[80%] max-w-xs bg-slate-950 z-50 shadow-2xl border-r border-slate-900"
            >
              <div className="flex justify-end p-4">
                <button 
                  onClick={() => setShowRooms(false)}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <SidePanel />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-950/10 relative overflow-hidden">
        <header className="p-4 lg:p-8 border-b border-slate-900 flex justify-between items-center bg-slate-950/40 backdrop-blur-md relative z-20">
          <div className="flex items-center gap-3 lg:gap-6">
            <button 
              onClick={() => setShowRooms(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-saffron-500"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="p-3 lg:p-4 bg-saffron-600 shadow-xl shadow-saffron-600/20 rounded-2xl border border-saffron-500 hidden sm:block">
              <Hash className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl lg:text-2xl font-black text-white tracking-tighter uppercase italic -mb-1 flex items-center gap-2">
                {activeRoom}
                <Star className="w-3 h-3 text-saffron-500 fill-saffron-500" />
              </h2>
              <p className="text-[8px] lg:text-[10px] font-mono text-slate-600 uppercase tracking-[0.4em] font-black">Shared help room</p>
            </div>
          </div>
          <div className="flex items-center gap-3 lg:gap-6 text-slate-600">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[9px] font-mono font-black uppercase tracking-widest">
               <Lock className="w-3.5 h-3.5 text-saffron-500" /> Guest Safe
            </div>
            <MoreVertical className="w-5 h-5 lg:w-6 lg:h-6 cursor-pointer hover:text-white transition-all hover:scale-110" />
          </div>
        </header>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8 lg:space-y-10 scroll-smooth custom-scrollbar relative"
        >
          <div className="absolute inset-0 technical-grid opacity-5 pointer-events-none" />
          
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-8 grayscale opacity-20 select-none">
              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ repeat: Infinity, duration: 4 }}
              >
                <Zap className="w-20 h-20 lg:w-24 lg:h-24 text-saffron-500" />
              </motion.div>
              <div className="font-mono text-[9px] lg:text-[10px] font-black uppercase tracking-[0.6em] max-w-xs lg:max-w-sm leading-relaxed">
                Ask your first question here.
              </div>
            </div>
          )}
          
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isMe = msg.authorId === currentUser?.uid;
              const isAi = msg.authorId === 'gemini-ai';
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className={cn(
                    "flex gap-3 lg:gap-6 max-w-[85%] lg:max-w-2xl",
                    isMe ? "ml-auto flex-row-reverse" : ""
                  )}
                >
                  <div className="flex-shrink-0 pt-1">
                    <div className={cn(
                      "w-8 h-8 lg:w-10 lg:h-10 rounded-xl lg:rounded-2xl border flex items-center justify-center overflow-hidden shadow-lg",
                      isMe 
                        ? "bg-saffron-600/20 border-saffron-500/30 text-saffron-400" 
                        : isAi 
                          ? "bg-amber-600/20 border-amber-500/30 text-amber-500"
                          : "bg-slate-900 border-slate-800 text-slate-500"
                    )}>
                      {isMe ? <User className="w-4 h-4 lg:w-5 lg:h-5" /> : isAi ? <Zap className="w-4 h-4 lg:w-5 lg:h-5 fill-current" /> : <Cpu className="w-4 h-4 lg:w-5 lg:h-5" />}
                    </div>
                  </div>
                  <div className={cn(
                    "space-y-2 group",
                    isMe ? "text-right" : ""
                  )}>
                    <div className={cn("flex items-center gap-3 mb-0.5 px-1", isMe ? "justify-end" : "")}>
                      <span className="text-[8px] lg:text-[10px] font-black text-slate-500 uppercase tracking-widest">{msg.authorName}</span>
                      <span className="text-[8px] lg:text-[9px] font-mono text-slate-700 uppercase font-black">
                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'SYNCING...'}
                      </span>
                    </div>
                    <div className={cn(
                      "p-4 lg:p-6 rounded-[1.5rem] lg:rounded-[2rem] text-sm leading-relaxed border shadow-xl backdrop-blur-sm transition-all relative overflow-hidden",
                      isMe 
                        ? "bg-saffron-600 border-saffron-500 text-white rounded-tr-none shadow-saffron-900/20" 
                        : isAi
                          ? "bg-slate-900/80 border-saffron-500/30 text-slate-100 rounded-tl-none ring-1 ring-saffron-500/20"
                          : "bg-slate-900/60 border-slate-800 text-slate-300 rounded-tl-none"
                    )}>
                      <div className="relative z-10 font-medium whitespace-pre-wrap prose prose-invert prose-p:my-0 prose-p:leading-relaxed max-w-none">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                      
                      {msg.grounding && msg.grounding.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-800/50 space-y-2">
                          <div className="flex items-center gap-2 text-[9px] font-mono text-saffron-400 uppercase tracking-widest font-black">
                            <Globe className="w-3 h-3" /> Sources
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {msg.grounding.map((chunk: any, idx: number) => chunk.web && (
                              <a 
                                key={idx} 
                                href={chunk.web.uri} 
                                target="_blank" 
                                rel="noreferrer"
                                className="px-3 py-1 bg-slate-950/50 rounded-lg border border-slate-800 text-[8px] text-slate-500 hover:text-saffron-400 hover:border-saffron-500/30 transition-all flex items-center gap-2"
                              >
                                {chunk.web.title || 'Source Path'}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className={cn(
                        "absolute top-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity",
                        isMe ? "left-4" : "right-4"
                      )}>
                        <button 
                          onClick={() => handleSpeak(msg)}
                          disabled={isSpeaking !== null}
                          className={cn(
                            "p-2 rounded-xl border transition-all",
                            isSpeaking === msg.id 
                              ? "bg-saffron-600 border-saffron-500 text-white animate-pulse" 
                              : "bg-slate-900/80 border-slate-800 text-slate-500 hover:text-white"
                          )}
                        >
                          {isSpeaking === msg.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {isMe && <div className="absolute right-0 bottom-0 w-8 h-8 bg-white/10 blur-xl rounded-full" />}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Streaming Message Placeholder */}
            {(isAiGenerating || streamingMessage !== null) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="flex gap-3 lg:gap-6 max-w-[85%] lg:max-w-2xl"
              >
                <div className="flex-shrink-0 pt-1">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl lg:rounded-2xl border flex items-center justify-center overflow-hidden shadow-lg bg-amber-600/20 border-amber-500/30 text-amber-500">
                    <Zap className="w-4 h-4 lg:w-5 lg:h-5 fill-current animate-pulse" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 mb-0.5 px-1">
                    <span className="text-[8px] lg:text-[10px] font-black text-slate-500 uppercase tracking-widest">SEA.RHO7</span>
                    <span className="text-[8px] lg:text-[9px] font-mono text-saffron-500 uppercase font-black animate-pulse">STREAMING...</span>
                  </div>
                  <div className="p-4 lg:p-6 rounded-[1.5rem] lg:rounded-[2rem] text-sm leading-relaxed border shadow-xl backdrop-blur-sm transition-all relative overflow-hidden bg-slate-900/80 border-saffron-500/30 text-slate-100 rounded-tl-none ring-1 ring-saffron-500/20">
                    <div className="relative z-10 font-medium whitespace-pre-wrap min-h-[1.5em] prose prose-invert prose-p:my-0 prose-p:leading-relaxed max-w-none">
                      {streamingMessage ? (
                        <ReactMarkdown>{streamingMessage}</ReactMarkdown>
                      ) : (
                        <div className="flex gap-1 items-center mt-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-saffron-500 animate-bounce [animation-delay:-0.3s]" />
                          <div className="w-1.5 h-1.5 rounded-full bg-saffron-500 animate-bounce [animation-delay:-0.15s]" />
                          <div className="w-1.5 h-1.5 rounded-full bg-saffron-500 animate-bounce" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-4 lg:p-8 border-t border-slate-900 bg-slate-950/80 backdrop-blur-xl relative z-20">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="relative group"
          >
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message #${activeRoom}...`}
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 lg:py-5 pl-6 lg:pl-8 pr-16 lg:pr-20 text-xs lg:text-sm font-mono focus:outline-none focus:border-saffron-500/50 focus:ring-4 focus:ring-saffron-500/10 transition-all text-white placeholder:text-slate-700 font-bold shadow-2xl"
            />
            <button 
              type="submit"
              disabled={!inputText.trim()}
              className="absolute right-2 lg:right-3 top-1/2 -translate-y-1/2 p-3 lg:p-3.5 bg-saffron-600 text-white rounded-xl hover:bg-saffron-500 disabled:opacity-20 disabled:grayscale transition-all shadow-[0_10px_30px_rgba(242,86,7,0.4)] hover:-translate-y-0.5 active:translate-y-0"
            >
              <Send className="w-4 h-4 lg:w-5 lg:h-5 fill-current" />
            </button>
          </form>
          <div className="mt-4 px-2 hidden sm:flex justify-between items-center text-[9px] font-mono text-slate-700 uppercase tracking-[0.4em] font-black">
            <div className="flex gap-4">
               <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-saffron-500" /> HELPER_READY</span>
               <span className="flex items-center gap-2"><Lock className="w-3 h-3 text-saffron-600" /> GUEST_MODE</span>
            </div>
            <span>Answers save in this session</span>
          </div>
        </div>
      </div>
    </div>
  );
};
