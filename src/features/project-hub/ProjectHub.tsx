import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  MoreHorizontal, 
  Clock, 
  CheckCircle2, 
  User, 
  Hash
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../lib/firestoreUtils';
import { useAuth } from '../../context/AuthContext';

type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';

interface Task {
  id: string;
  title: string;
  desc: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high';
  assignee: string;
}

export const ProjectHub: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const PROJECT_ID = 'default-hub';

  useEffect(() => {
    const q = query(
      collection(db, 'projects', PROJECT_ID, 'tasks'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Task));
      setTasks(fetchedTasks);
    }, (error) => handleFirestoreError(error, OperationType.LIST, `projects/${PROJECT_ID}/tasks`));

    return () => unsubscribe();
  }, []);

  const columns: { id: TaskStatus; label: string }[] = [
    { id: 'todo', label: 'Backlog Core // 01' },
    { id: 'in-progress', label: 'Async Processing // 02' },
    { id: 'review', label: 'Validation Sync // 03' },
    { id: 'done', label: 'Terminated // 04' }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-rose-500';
      case 'medium': return 'text-amber-500';
      case 'low': return 'text-emerald-500';
      default: return 'text-slate-500';
    }
  };

  const moveTask = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const taskRef = doc(db, 'projects', PROJECT_ID, 'tasks', taskId);
      await updateDoc(taskRef, { status: newStatus });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `projects/${PROJECT_ID}/tasks/${taskId}`);
    }
  };

  const addTask = async () => {
    const title = prompt("Payload Title?");
    const desc = prompt("Mission Parameters?");
    if (!title) return;

    try {
      await addDoc(collection(db, 'projects', PROJECT_ID, 'tasks'), {
        title,
        desc: desc || '',
        status: 'todo',
        priority: 'medium',
        assignee: user?.displayName || 'SYSTEM',
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `projects/${PROJECT_ID}/tasks`);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-bold text-white tracking-tight uppercase italic">Project Control Hub</h2>
          <p className="text-slate-500 font-mono text-[10px] mt-1 uppercase tracking-[0.4em] font-black">Multi-Node Workflow Execution Manager</p>
        </div>
        <div className="flex gap-8 items-center">
          <div className="flex -space-x-4">
             {[1, 2, 3].map(i => (
               <div key={i} className="w-12 h-12 rounded-2xl border-4 border-slate-950 bg-slate-900 flex items-center justify-center overflow-hidden shadow-2xl relative group">
                 <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                 <User className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
               </div>
             ))}
             <div className="w-12 h-12 rounded-2xl border-4 border-slate-950 bg-slate-800 flex items-center justify-center text-xs font-black text-slate-400 shadow-2xl uppercase">
               +{Math.max(0, tasks.length - 3)}
             </div>
          </div>
          <button 
            onClick={addTask}
            className="px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-500 flex items-center gap-3 transition-all shadow-[0_15px_40px_rgba(79,70,229,0.3)] hover:-translate-y-1 active:translate-y-0 text-xs uppercase tracking-widest"
          >
            <Plus className="w-5 h-5" /> Initialize Mission
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 h-[calc(100vh-20rem)] min-w-[1000px] overflow-x-auto custom-scrollbar pb-4">
        {columns.map(column => (
          <div key={column.id} className="flex flex-col gap-6">
            <div className="flex justify-between items-center px-4">
              <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em] font-black italic">{column.label}</h3>
              <span className="text-[10px] font-mono bg-slate-950 text-indigo-400 px-3 py-1 rounded-full border border-slate-800 font-black shadow-lg">
                {tasks.filter(t => t.status === column.id).length.toString().padStart(2, '0')}
              </span>
            </div>
            
            <div className="flex-1 space-y-4 p-4 bg-slate-900/10 rounded-[2.5rem] border border-slate-900 backdrop-blur-xl overflow-y-auto custom-scrollbar shadow-inner">
              <AnimatePresence mode="popLayout">
                {tasks.filter(t => t.status === column.id).map(task => (
                  <motion.div
                    key={task.id}
                    layoutId={task.id}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    className="p-8 group hover:border-indigo-500/40 border border-slate-900/60 rounded-[2rem] transition-all cursor-grab active:cursor-grabbing relative bg-slate-900/30 shadow-xl backdrop-blur-md overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div className={cn("text-[8px] font-mono uppercase tracking-[0.4em] font-black flex items-center gap-2 px-3 py-1 rounded-full border bg-slate-950 shadow-lg", getPriorityColor(task.priority).replace('text', 'border').replace('500', '500/30'), getPriorityColor(task.priority))}>
                        <div className={cn("w-1.5 h-1.5 rounded-full", getPriorityColor(task.priority).replace('text', 'bg'))} /> {task.priority}
                      </div>
                      <button className="p-2 text-slate-700 hover:text-white transform group-hover:rotate-90 transition-transform">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <h4 className="text-lg font-black text-white mb-3 leading-tight tracking-tight uppercase italic relative z-10">{task.title}</h4>
                    <p className="text-[12px] text-slate-500 leading-relaxed mb-10 font-bold group-hover:text-slate-400 transition-colors relative z-10">
                      {task.desc}
                    </p>
                    
                    <div className="pt-6 border-t border-slate-900 flex justify-between items-center bg-slate-950/20 -mx-8 px-8 bottom-0 absolute w-full left-0 rounded-b-[2rem] relative z-10">
                      <div className="flex items-center gap-3 pb-2">
                        <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center group-hover:border-indigo-500/30 transition-colors">
                          <User className="w-4 h-4 text-slate-600" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-mono text-slate-400 font-black uppercase tracking-widest">{task.assignee}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 pb-2">
                         <div className="flex items-center gap-2 text-[10px] font-mono text-slate-600 font-black uppercase tracking-tighter group-hover:text-indigo-400 transition-colors">
                           <Clock className="w-4 h-4" /> AUTO
                         </div>
                      </div>
                    </div>

                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-10 group-hover:translate-x-0 relative z-20">
                      {column.id !== 'done' && (
                        <button 
                          onClick={() => moveTask(task.id, 'done')}
                          className="p-3.5 rounded-2xl bg-emerald-500 text-black shadow-[0_10px_20px_rgba(16,185,129,0.3)] hover:bg-emerald-400 transition-all font-black scale-90 hover:scale-100"
                          title="Finish Phase"
                        >
                          <CheckCircle2 className="w-5 h-5 animate-pulse" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              <button 
                onClick={addTask}
                className="w-full py-6 rounded-[2rem] border-2 border-dashed border-slate-900 text-slate-700 hover:border-slate-800 hover:text-slate-500 transition-all text-[10px] font-mono uppercase tracking-[0.5em] font-black mt-2 bg-slate-950/10"
              >
                <Plus className="w-4 h-4 inline-block mr-3" /> Append Payload
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
