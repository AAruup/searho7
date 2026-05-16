import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  BookOpen,
  Bot,
  CheckCircle2,
  ChevronRight,
  Code2,
  FileText,
  Image as ImageIcon,
  ListTodo,
  MessageSquare,
  Music,
  Plus,
  Rocket,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRound,
  Zap,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { AppFeature } from '../types';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { askSeaRho7, getAssistantReadinessLabel } from '../services/assistantGateway';

interface DashboardProps {
  onNavigate: (feature: AppFeature) => void;
}

interface MissionTask {
  id: string;
  title: string;
  done: boolean;
}

interface AssistantEntry {
  id: string;
  question: string;
  answer: string;
  time: string;
}

const taskStorageKey = 'sea.rho7.dashboard.tasks';
const answerStorageKey = 'sea.rho7.dashboard.answers.v4';

const defaultTasks: MissionTask[] = [
  { id: 'ask-first-question', title: 'Ask SEA.RHO7 one real question', done: false },
  { id: 'plan-day', title: "Make today's study or work plan", done: false },
  { id: 'try-lyrics', title: 'Create one lyrics animation draft', done: false },
];

const starterPrompts = [
  'Teach fluid mechanics for a beginner',
  'Make my day plan for study and coding',
  'Help me fix my Firebase login problem',
  'Create a lyric animation concept in blue and saffron',
];

const loadStoredJson = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;

  try {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) as T : fallback;
  } catch {
    return fallback;
  }
};

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [question, setQuestion] = useState('Teach me Pythagoras like I am learning it today.');
  const [answers, setAnswers] = useState<AssistantEntry[]>(() => loadStoredJson(answerStorageKey, []));
  const [tasks, setTasks] = useState<MissionTask[]>(() => loadStoredJson(taskStorageKey, defaultTasks));
  const [newTask, setNewTask] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const [lastSource, setLastSource] = useState('');

  useEffect(() => {
    window.localStorage.setItem(taskStorageKey, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    window.localStorage.setItem(answerStorageKey, JSON.stringify(answers.slice(0, 6)));
  }, [answers]);

  const completedTasks = useMemo(() => tasks.filter(task => task.done).length, [tasks]);
  const sessionType = user?.uid === 'local-agent'
    ? 'Local workspace'
    : user?.email === 'guest@sea.rho7'
      ? 'Guest session'
      : 'Signed in';

  const featureCards = [
    {
      title: 'Ask Anything',
      detail: 'General help, coding, study, Firebase, ideas',
      icon: MessageSquare,
      action: 'Open Chat',
      feature: AppFeature.CHAT,
      accent: 'text-saffron-300',
    },
    {
      title: 'Build With Agent',
      detail: 'Plan features, debug screens, prepare checks',
      icon: Bot,
      action: 'Open Agent',
      feature: AppFeature.AGENT_WORKBENCH,
      accent: 'text-vision-blue-200',
    },
    {
      title: 'Lyrics To Motion',
      detail: 'Draft synced lyric visuals and animation timing',
      icon: Music,
      action: 'Open Studio',
      feature: AppFeature.LYRIC_ANIMATION,
      accent: 'text-saffron-300',
    },
    {
      title: 'Student Projects',
      detail: 'Track ideas, tasks, progress, and reviews',
      icon: Rocket,
      action: 'Open Projects',
      feature: AppFeature.PROJECT_HUB,
      accent: 'text-emerald-300',
    },
    {
      title: 'Academy',
      detail: 'Study, teach, and grow a learning profile',
      icon: BookOpen,
      action: 'Open Academy',
      feature: AppFeature.ACADEMY,
      accent: 'text-amber-300',
    },
    {
      title: 'Visual Studio',
      detail: 'Create visual drafts for app, class, and media',
      icon: ImageIcon,
      action: 'Open Visuals',
      feature: AppFeature.IMAGE_EDITOR,
      accent: 'text-orange-300',
    },
  ];

  const statusItems = [
    { label: 'Account', value: sessionType, icon: UserRound },
    { label: 'Assistant', value: lastSource || getAssistantReadinessLabel(), icon: Sparkles },
    { label: 'Hosting', value: 'Firebase live', icon: ShieldCheck },
    { label: 'Workspace', value: `${completedTasks}/${tasks.length} tasks`, icon: ListTodo },
  ];

  const handleAsk = async (promptOverride?: string) => {
    const cleanQuestion = (promptOverride || question).trim();
    if (!cleanQuestion || isAnswering) return;

    setQuestion(cleanQuestion);
    setIsAnswering(true);

    const nextEntry: AssistantEntry = {
      id: Date.now().toString(),
      question: cleanQuestion,
      answer: '',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setAnswers(prev => [nextEntry, ...prev].slice(0, 6));

    try {
      const result = await askSeaRho7({
        question: cleanQuestion,
        mode: 'dashboard-quick-ask',
        roomId: 'dashboard',
        userName: user?.displayName || 'student',
        context: 'The user is on the SEA.RHO7 home dashboard and wants an immediately useful day-to-day answer.',
      });

      const fullAnswer = result.text.trim();

      if (!fullAnswer.trim()) {
        throw new Error('Empty model response');
      }

      setLastSource(result.source === 'firebase-ai' ? 'Free AI beta' : result.source === 'backend' ? 'Cloud AI' : result.source === 'browser-gemini' ? 'Live AI' : 'Local helper');

      setAnswers(prev => prev.map(entry =>
        entry.id === nextEntry.id ? { ...entry, answer: fullAnswer } : entry
      ));
    } catch {
      setAnswers(prev => prev.map(entry =>
        entry.id === nextEntry.id ? { ...entry, answer: 'SEA.RHO7 could not answer this one yet. Try again in Chat or check Settings > AI Soul.' } : entry
      ));
    } finally {
      setIsAnswering(false);
    }
  };

  const handleAddTask = (event: React.FormEvent) => {
    event.preventDefault();
    const title = newTask.trim();
    if (!title) return;

    setTasks(prev => [
      ...prev,
      { id: `task-${Date.now()}`, title, done: false },
    ]);
    setNewTask('');
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, done: !task.done } : task
    ));
  };

  const removeTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  return (
    <div className="space-y-6 pb-10">
      <section className="border border-vision-blue-900/70 bg-vision-blue-950/45 rounded-lg overflow-hidden">
        <div className="relative px-5 py-6 lg:px-8 lg:py-8">
          <div className="absolute inset-0 technical-grid opacity-10 pointer-events-none" />
          <div className="relative z-10 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-md border border-saffron-500/30 bg-saffron-500/10 px-3 py-2 text-[10px] font-mono font-black uppercase tracking-widest text-saffron-200">
                  <span className="h-2 w-2 rounded-full bg-saffron-400" />
                  SEA.RHO7 is open
                </span>
                <span className="inline-flex items-center gap-2 rounded-md border border-vision-blue-700/70 bg-slate-950/60 px-3 py-2 text-[10px] font-mono font-black uppercase tracking-widest text-vision-blue-100">
                  {sessionType}
                </span>
              </div>

              <div className="max-w-3xl">
                <h1 className="text-4xl lg:text-6xl font-black tracking-tight text-white">
                  One place to ask, build, study, and create.
                </h1>
                <p className="mt-4 max-w-2xl text-sm lg:text-base leading-7 text-vision-blue-100/75">
                  SEA.RHO7 now starts with the work itself: ask a question, keep your next tasks, and jump into the right tool without a fake control room in the way.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => onNavigate(AppFeature.CHAT)}
                  className="h-12 px-5 rounded-lg bg-gradient-to-r from-vision-blue-600 to-saffron-600 text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:from-vision-blue-500 hover:to-saffron-500 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Ask SEA.RHO7
                </button>
                <button
                  onClick={() => onNavigate(AppFeature.AGENT_WORKBENCH)}
                  className="h-12 px-5 rounded-lg border border-vision-blue-700 bg-slate-950/80 text-vision-blue-100 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:border-saffron-400 hover:text-white transition-colors"
                >
                  <Code2 className="w-4 h-4 text-saffron-300" />
                  Build With Agent
                </button>
                <button
                  onClick={() => onNavigate(AppFeature.LYRIC_ANIMATION)}
                  className="h-12 px-5 rounded-lg border border-vision-blue-700 bg-slate-950/80 text-vision-blue-100 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:border-saffron-400 hover:text-white transition-colors"
                >
                  <Music className="w-4 h-4 text-saffron-300" />
                  Lyrics Studio
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {statusItems.map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-lg border border-vision-blue-900/70 bg-slate-950/75 p-4">
                    <Icon className="w-5 h-5 text-saffron-300 mb-4" />
                    <p className="text-[10px] font-mono uppercase tracking-widest text-vision-blue-300/70">{item.label}</p>
                    <p className="mt-1 text-sm font-black text-white">{item.value}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-6 items-start">
        <div className="rounded-lg border border-vision-blue-900/70 bg-slate-950/80 overflow-hidden">
          <div className="border-b border-vision-blue-900/70 px-5 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Bot className="w-5 h-5 text-saffron-300" />
              <div>
                <h2 className="text-sm font-black uppercase text-white">SEA.RHO7 Quick Ask</h2>
                <p className="text-[10px] font-mono uppercase text-vision-blue-300/70">Answers now, better model key later</p>
              </div>
            </div>
            {isAnswering && (
              <span className="text-[10px] font-mono uppercase tracking-widest text-saffron-300 animate-pulse">Thinking</span>
            )}
          </div>

          <div className="p-5 space-y-4">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleAsk();
              }}
              className="space-y-3"
            >
              <label htmlFor="dashboard-question" className="sr-only">Ask SEA.RHO7</label>
              <textarea
                id="dashboard-question"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                className="min-h-28 w-full resize-none rounded-lg border border-vision-blue-900/70 bg-vision-blue-950/35 p-4 text-sm leading-6 text-white outline-none focus:border-saffron-400"
              />
              <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-2">
                  {starterPrompts.map(prompt => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handleAsk(prompt)}
                      className="rounded-md border border-vision-blue-900/70 bg-slate-900 px-3 py-2 text-[10px] font-mono uppercase text-vision-blue-200 hover:border-saffron-400 hover:text-white transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={!question.trim() || isAnswering}
                  className="h-11 px-5 rounded-lg bg-saffron-600 text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-saffron-500 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
            </form>

            <div className="space-y-3">
              {answers.length === 0 ? (
                <div className="rounded-lg border border-vision-blue-900/60 bg-vision-blue-950/25 p-5 text-sm text-vision-blue-100/70">
                  Ask a real question and SEA.RHO7 will answer here.
                </div>
              ) : (
                answers.map(entry => (
                  <motion.article
                    key={entry.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-vision-blue-900/60 bg-vision-blue-950/25 p-5"
                  >
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-mono uppercase tracking-widest text-saffron-300">You asked</p>
                        <h3 className="mt-1 text-sm font-bold text-white">{entry.question}</h3>
                      </div>
                      <span className="text-[10px] font-mono text-vision-blue-300/70">{entry.time}</span>
                    </div>
                    <div className="prose prose-invert max-w-none prose-p:my-2 prose-li:my-1 prose-ol:my-2 prose-ul:my-2 text-sm leading-6 text-vision-blue-50">
                      <ReactMarkdown>{entry.answer || 'Preparing a useful answer...'}</ReactMarkdown>
                    </div>
                  </motion.article>
                ))
              )}
            </div>
          </div>
        </div>

        <aside className="rounded-lg border border-vision-blue-900/70 bg-slate-950/80 overflow-hidden">
          <div className="border-b border-vision-blue-900/70 px-5 py-4 flex items-center gap-3">
            <ListTodo className="w-5 h-5 text-saffron-300" />
            <div>
              <h2 className="text-sm font-black uppercase text-white">Today&apos;s Mission</h2>
              <p className="text-[10px] font-mono uppercase text-vision-blue-300/70">{completedTasks} of {tasks.length} complete</p>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <form onSubmit={handleAddTask} className="flex gap-2">
              <label htmlFor="new-mission-task" className="sr-only">New mission task</label>
              <input
                id="new-mission-task"
                value={newTask}
                onChange={(event) => setNewTask(event.target.value)}
                placeholder="Add one real task..."
                className="min-w-0 flex-1 rounded-lg border border-vision-blue-900/70 bg-vision-blue-950/35 px-3 py-3 text-sm text-white outline-none focus:border-saffron-400 placeholder:text-vision-blue-300/35"
              />
              <button
                type="submit"
                className="h-11 w-11 rounded-lg bg-vision-blue-700 text-white flex items-center justify-center hover:bg-saffron-600 transition-colors"
                aria-label="Add task"
              >
                <Plus className="w-5 h-5" />
              </button>
            </form>

            <div className="space-y-2">
              {tasks.map(task => (
                <div
                  key={task.id}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg border px-3 py-3 transition-colors',
                    task.done
                      ? 'border-emerald-500/30 bg-emerald-500/10'
                      : 'border-vision-blue-900/60 bg-vision-blue-950/25'
                  )}
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={cn(
                      'h-6 w-6 rounded-md border flex items-center justify-center shrink-0 transition-colors',
                      task.done ? 'border-emerald-400 bg-emerald-500 text-white' : 'border-vision-blue-700 text-transparent hover:border-saffron-400'
                    )}
                    aria-label={task.done ? 'Mark incomplete' : 'Mark complete'}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                  <span className={cn('min-w-0 flex-1 text-sm', task.done ? 'text-emerald-100 line-through opacity-70' : 'text-vision-blue-50')}>
                    {task.title}
                  </span>
                  <button
                    onClick={() => removeTask(task.id)}
                    className="h-8 w-8 rounded-md text-vision-blue-300/40 hover:text-rose-300 hover:bg-rose-500/10 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all"
                    aria-label="Remove task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {featureCards.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.button
              key={feature.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              onClick={() => onNavigate(feature.feature)}
              className="rounded-lg border border-vision-blue-900/70 bg-slate-950/80 p-5 text-left hover:border-saffron-400/70 hover:bg-vision-blue-950/45 transition-colors group"
            >
              <div className="mb-5 flex items-center justify-between gap-4">
                <Icon className={cn('w-6 h-6', feature.accent)} />
                <ChevronRight className="w-5 h-5 text-vision-blue-300/45 group-hover:text-saffron-300 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-lg font-black text-white">{feature.title}</h3>
              <p className="mt-2 min-h-12 text-sm leading-6 text-vision-blue-100/65">{feature.detail}</p>
              <div className="mt-5 text-[10px] font-mono font-black uppercase tracking-widest text-saffron-300">
                {feature.action}
              </div>
            </motion.button>
          );
        })}
      </section>

      <section className="rounded-lg border border-vision-blue-900/70 bg-vision-blue-950/30 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-saffron-300" />
            <div>
              <h2 className="text-sm font-black uppercase text-white">Real App Direction</h2>
              <p className="text-sm text-vision-blue-100/70">Students open the app, continue as guest or Google, ask a real question, and SEA.RHO7 routes it through the secure AI backend when deployed.</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate(AppFeature.SETTINGS)}
            className="h-11 px-5 rounded-lg border border-vision-blue-700 bg-slate-950/80 text-vision-blue-100 text-xs font-black uppercase tracking-widest hover:border-saffron-400 hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 text-saffron-300" />
            Open Settings
          </button>
        </div>
      </section>
    </div>
  );
};
