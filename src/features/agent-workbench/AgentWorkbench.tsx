import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  Bot,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Clipboard,
  Code2,
  Cpu,
  Eye,
  FileCode2,
  Files,
  GitBranch,
  ListChecks,
  MessageSquare,
  Rocket,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Terminal,
  Wrench,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { askSeaRho7 } from '../../services/assistantGateway';
import { ProactiveAgentPanel } from './ProactiveAgentPanel';

type AgentMode = 'architect' | 'builder' | 'debugger' | 'reviewer';

interface AgentRun {
  id: string;
  title: string;
  summary: string;
  response: string;
  plan: string[];
  commands: string[];
  files: string[];
  risks: string[];
  patch: string;
  tests: string[];
}

interface AgentMessage {
  id: string;
  role: 'user' | 'agent';
  text: string;
  timestamp: string;
}

const modes: Record<AgentMode, { label: string; icon: React.ElementType; tone: string; brief: string }> = {
  architect: {
    label: 'Architect',
    icon: BrainCircuit,
    tone: 'System design, data flow, interfaces',
    brief: 'Map the work before touching code',
  },
  builder: {
    label: 'Builder',
    icon: Code2,
    tone: 'Implementation, patches, UI polish',
    brief: 'Turn the task into shippable changes',
  },
  debugger: {
    label: 'Debugger',
    icon: Search,
    tone: 'Trace, isolate, verify',
    brief: 'Find the failing path and fix it',
  },
  reviewer: {
    label: 'Reviewer',
    icon: ShieldCheck,
    tone: 'Risk, regressions, missing tests',
    brief: 'Audit the change before release',
  },
};

const workspaceFiles = [
  { path: 'src/App.tsx', signal: 'Routing surface', status: 'active' },
  { path: 'src/components/Navigation.tsx', signal: 'Primary command rail', status: 'active' },
  { path: 'src/components/Dashboard.tsx', signal: 'Launch surface', status: 'active' },
  { path: 'src/services/geminiService.ts', signal: 'AI model gateway', status: 'guarded' },
  { path: 'server.ts', signal: 'Local app server', status: 'stable' },
  { path: 'vite.config.ts', signal: 'Build and dev pipeline', status: 'watched' },
];

const toolchain = [
  { label: 'Read Files', icon: Files, state: 'ready' },
  { label: 'Search Repo', icon: Search, state: 'ready' },
  { label: 'Patch Code', icon: Wrench, state: 'armed' },
  { label: 'Run Checks', icon: Terminal, state: 'ready' },
  { label: 'Review Risk', icon: Eye, state: 'ready' },
  { label: 'Ship Brief', icon: Rocket, state: 'queued' },
];

const qualityGates = [
  'Understand existing patterns first',
  'Keep edits scoped to the task',
  'Prefer reversible changes',
  'Verify behavior with local checks',
  'Summarize outcome clearly',
];

const defaultGoal = 'Upgrade this app into a Codex-grade AI workspace with planning, code awareness, terminal checks, risk review, and a polished agent console.';

const makeTitle = (goal: string) => {
  const words = goal
    .replace(/[^\w\s-]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 7);
  return words.length ? words.join(' ') : 'Untitled Agent Task';
};

const buildRun = (goal: string, mode: AgentMode): AgentRun => {
  const title = makeTitle(goal);
  const focus = modes[mode];
  const lower = goal.toLowerCase();
  const isUi = lower.includes('app') || lower.includes('ui') || lower.includes('screen') || lower.includes('dashboard');
  const isBug = lower.includes('fix') || lower.includes('error') || lower.includes('bug') || mode === 'debugger';
  const isReview = lower.includes('review') || lower.includes('risk') || mode === 'reviewer';

  const files = [
    isUi ? 'src/components/Dashboard.tsx' : 'src/App.tsx',
    isUi ? 'src/components/Navigation.tsx' : 'src/types.ts',
    isBug ? 'server.ts' : 'src/features/agent-workbench/AgentWorkbench.tsx',
    isReview ? 'tsconfig.json' : 'src/index.css',
  ];

  return {
    id: Date.now().toString(),
    title,
    summary: `${focus.label} pass prepared for "${goal.trim()}". The run is scoped, testable, and ready to convert into code changes.`,
    response: [
      `I can handle this as your ${focus.label.toLowerCase()} agent.`,
      isBug
        ? 'First I will isolate the failing path, then patch the smallest surface that restores behavior.'
        : isReview
          ? 'First I will look for regressions and missing checks, then turn the findings into a clear repair list.'
          : 'First I will shape the work into a concrete implementation plan, then produce the file and command path.',
      isUi
        ? 'Because this touches the app experience, I will protect layout, mobile fit, labels, and obvious empty states.'
        : 'Because this touches project behavior, I will keep the edit surface narrow and verification explicit.',
    ].join(' '),
    files,
    plan: [
      `Read the current entry points and identify the smallest useful surface for "${title}".`,
      `Define the user-facing workflow, visible states, empty states, and success signal.`,
      `Patch the target files with a compact implementation that follows the existing visual system.`,
      `Run type checks and a local page request before calling the task complete.`,
      `Return a release note with changed files, verification, and known limits.`,
    ],
    commands: [
      'rg --files src',
      'npm run lint',
      'npm run dev',
      'curl http://localhost:3000/api/health',
    ],
    risks: [
      isBug ? 'A partial fix could hide the real failing path.' : 'Scope can expand if the task is not pinned to visible outcomes.',
      'AI-backed flows need a valid local API key before live model calls can be trusted.',
      'Large UI changes should keep mobile navigation and keyboard access intact.',
    ],
    patch: [
      `*** Task: ${title}`,
      `Mode: ${focus.label}`,
      '',
      '1. Add or update the focused feature surface.',
      '2. Wire it through app routing and navigation.',
      '3. Preserve existing modules unless they block the requested behavior.',
      '4. Verify with typecheck and a local smoke test.',
    ].join('\n'),
    tests: [
      'Feature appears in the sidebar and opens without reload.',
      'Primary task input creates a fresh run with plan, files, commands, and risks.',
      'Long text wraps in panels without overlapping controls.',
      'TypeScript check completes without errors.',
    ],
  };
};

export const AgentWorkbench: React.FC = () => {
  const [goal, setGoal] = useState(defaultGoal);
  const [mode, setMode] = useState<AgentMode>('builder');
  const [autonomy, setAutonomy] = useState(74);
  const [selectedFile, setSelectedFile] = useState(workspaceFiles[0].path);
  const [activeRun, setActiveRun] = useState<AgentRun>(() => buildRun(defaultGoal, 'builder'));
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: 'agent-ready',
      role: 'agent',
      text: 'I am ready. Describe what you want changed, fixed, reviewed, or built, then press Run Agent. I will answer with a plan, files, commands, risks, and tests.',
      timestamp: 'READY',
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeMode = modes[mode];
  const ModeIcon = activeMode.icon;

  const runLog = useMemo(() => [
    { tag: 'scan', text: 'Workspace context indexed', icon: Search },
    { tag: 'plan', text: `${activeMode.label} strategy selected`, icon: BrainCircuit },
    { tag: 'scope', text: `${activeRun.files.length} file targets estimated`, icon: Files },
    { tag: 'checks', text: `${activeRun.tests.length} acceptance gates prepared`, icon: ListChecks },
  ], [activeMode.label, activeRun.files.length, activeRun.tests.length]);

  const handleRun = async () => {
    const cleanGoal = goal.trim() || defaultGoal;
    const nextRun = buildRun(cleanGoal, mode);
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toUpperCase();
    setGoal(cleanGoal);
    setActiveRun(nextRun);
    setCopied(false);
    setIsThinking(true);
    setMessages(prev => [
      ...prev,
      { id: `${nextRun.id}-user`, role: 'user', text: cleanGoal, timestamp: now },
    ]);

    try {
      const answer = await askSeaRho7({
        question: cleanGoal,
        mode: `agent-workbench-${mode}`,
        roomId: 'agent-workbench',
        context: [
          `Agent mode: ${modes[mode].label}`,
          `Autonomy level: ${autonomy}%`,
          'The answer should behave like a practical AI coding and life-work assistant.',
          'Give a direct solution, a compact action plan, risks, and what to test.',
        ].join('\n'),
      });

      setMessages(prev => [
        ...prev,
        {
          id: `${nextRun.id}-agent`,
          role: 'agent',
          text: `${answer.text}\n\nStructured run prepared:\n- Next move: ${nextRun.plan[0]}\n- Watch first: ${nextRun.files.join(', ')}\n- Test gate: ${nextRun.tests[0]}`,
          timestamp: 'NOW',
        },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `${nextRun.id}-agent`,
          role: 'agent',
          text: `${nextRun.response}\n\nNext move: ${nextRun.plan[0]}\n\nI will watch these files first: ${nextRun.files.join(', ')}.`,
          timestamp: 'NOW',
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleCopy = async () => {
    const brief = [
      activeRun.summary,
      '',
      'Plan:',
      ...activeRun.plan.map((item, index) => `${index + 1}. ${item}`),
      '',
      'Files:',
      ...activeRun.files.map(file => `- ${file}`),
      '',
      'Commands:',
      ...activeRun.commands.map(command => `- ${command}`),
      '',
      activeRun.patch,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(brief);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] space-y-6 pb-10">
      <ProactiveAgentPanel />
      <section className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)_360px] gap-4">
        <aside className="border border-vision-blue-900/70 bg-slate-950/80 rounded-lg overflow-hidden">
          <div className="h-14 px-4 flex items-center justify-between border-b border-vision-blue-900/70 bg-vision-blue-950/50">
            <div className="flex items-center gap-3">
              <Bot className="w-5 h-5 text-saffron-400" />
              <div>
                <h1 className="text-sm font-black text-white uppercase">Agent Workbench</h1>
                <p className="text-[10px] font-mono text-vision-blue-300 uppercase">Ask. Plan. Build. Check.</p>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-saffron-400 shadow-[0_0_10px_rgba(255,148,56,0.7)]" />
          </div>

          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(modes) as AgentMode[]).map(agentMode => {
                const item = modes[agentMode];
                const Icon = item.icon;
                const isActive = mode === agentMode;
                return (
                  <button
                    key={agentMode}
                    onClick={() => setMode(agentMode)}
                    className={cn(
                      'h-24 rounded-lg border p-3 text-left transition-all',
                      isActive
                        ? 'border-saffron-500 bg-vision-blue-900/50 text-white shadow-[0_0_30px_rgba(59,130,246,0.12)]'
                        : 'border-vision-blue-900/60 bg-slate-900/40 text-slate-500 hover:text-slate-200 hover:border-vision-blue-600'
                    )}
                  >
                    <Icon className={cn('w-5 h-5 mb-3', isActive ? 'text-saffron-400' : 'text-slate-600')} />
                    <div className="text-[11px] font-black uppercase">{item.label}</div>
                    <div className="text-[9px] leading-4 mt-1 font-mono uppercase text-slate-600">{item.brief}</div>
                  </button>
                );
              })}
            </div>

            <div className="rounded-lg border border-vision-blue-900/60 bg-vision-blue-950/30 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-black">Autonomy</span>
                <span className="text-[10px] font-mono text-saffron-400 uppercase font-black">{autonomy}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={autonomy}
                onChange={(event) => setAutonomy(Number(event.target.value))}
                className="w-full accent-saffron-500"
              />
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[9px] font-mono uppercase text-slate-600">
                <span>Ask</span>
                <span>Plan</span>
                <span>Act</span>
              </div>
            </div>

            <div className="rounded-lg border border-vision-blue-900/60 bg-vision-blue-950/30 p-4 space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase font-black">
                <Cpu className="w-4 h-4 text-saffron-400" />
                Tool Belt
              </div>
              <div className="grid grid-cols-2 gap-2">
                {toolchain.map(tool => {
                  const Icon = tool.icon;
                  return (
                    <div key={tool.label} className="rounded-lg border border-vision-blue-900/60 bg-slate-950 px-3 py-3">
                      <Icon className="w-4 h-4 text-slate-500 mb-2" />
                      <div className="text-[10px] font-black uppercase text-slate-300">{tool.label}</div>
                      <div className="text-[9px] font-mono uppercase text-saffron-500 mt-1">{tool.state}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        <main className="border border-vision-blue-900/70 bg-slate-950/80 rounded-lg overflow-hidden min-h-[760px] flex flex-col">
          <div className="h-14 px-4 flex items-center justify-between border-b border-vision-blue-900/70 bg-vision-blue-950/50">
            <div className="flex items-center gap-3 min-w-0">
              <ModeIcon className="w-5 h-5 text-saffron-400 shrink-0" />
              <div className="min-w-0">
                <h2 className="text-sm font-black text-white uppercase truncate">{activeMode.label} Run</h2>
                <p className="text-[10px] font-mono text-vision-blue-300 uppercase truncate">{activeMode.tone}</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 text-[10px] font-mono uppercase text-slate-500">
              <GitBranch className="w-4 h-4" />
              local-main
            </div>
          </div>

          <div className="p-4 lg:p-5 border-b border-vision-blue-900/70 bg-slate-950">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold text-vision-blue-100">
              <MessageSquare className="w-4 h-4 text-saffron-400" />
              Tell the agent what to do
            </div>
            <label htmlFor="agent-goal" className="sr-only">Agent goal</label>
            <textarea
              id="agent-goal"
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
              className="w-full min-h-28 resize-none rounded-lg border border-vision-blue-900/70 bg-vision-blue-950/30 p-4 text-sm leading-6 text-slate-100 outline-none focus:border-saffron-500/70"
            />
            <div className="mt-3 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                {['Frontend', 'Backend', 'Tests', 'Review'].map(tag => (
                  <span key={tag} className="px-3 py-1.5 rounded-md border border-vision-blue-900/60 bg-slate-900 text-[10px] font-mono uppercase text-vision-blue-300">
                    {tag}
                  </span>
                ))}
              </div>
              <button
                onClick={handleRun}
                className="h-11 px-5 rounded-lg bg-gradient-to-r from-vision-blue-600 to-saffron-600 text-white text-xs font-black uppercase tracking-widest hover:from-vision-blue-500 hover:to-saffron-500 transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Run Agent
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] flex-1 min-h-0">
            <div className="p-4 lg:p-5 space-y-4 overflow-y-auto custom-scrollbar">
              <div className="rounded-lg border border-vision-blue-900/70 bg-vision-blue-950/20 overflow-hidden">
                <div className="px-4 py-3 border-b border-vision-blue-900/70 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-saffron-400" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-white">Agent Response</h3>
                  {isThinking && <span className="ml-auto text-[10px] font-mono uppercase text-saffron-400 animate-pulse">thinking</span>}
                </div>
                <div className="p-4 space-y-3 max-h-72 overflow-y-auto custom-scrollbar">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={cn(
                        'rounded-lg border p-4',
                        message.role === 'agent'
                          ? 'border-vision-blue-700/60 bg-vision-blue-950/50'
                          : 'border-saffron-500/40 bg-saffron-500/10'
                      )}
                    >
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-saffron-400">
                          {message.role === 'agent' ? 'SEA.RHO7 Agent' : 'You'}
                        </span>
                        <span className="text-[9px] font-mono uppercase text-slate-600">{message.timestamp}</span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-6 text-slate-200">{message.text}</p>
                    </div>
                  ))}
                  {isThinking && (
                    <div className="flex items-center gap-2 text-xs text-vision-blue-300">
                      <div className="w-2 h-2 rounded-full bg-saffron-400 animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-saffron-400 animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-2 h-2 rounded-full bg-saffron-400 animate-bounce [animation-delay:-0.3s]" />
                      Agent is preparing a response.
                    </div>
                  )}
                </div>
              </div>

              <motion.div
                key={activeRun.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-slate-800 bg-slate-900/40 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                  <div className="min-w-0">
                    <h3 className="text-base font-black text-white uppercase truncate">{activeRun.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">{activeRun.summary}</p>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="ml-3 h-9 w-9 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-white hover:border-saffron-500/50 flex items-center justify-center"
                    title="Copy run brief"
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Clipboard className="w-4 h-4" />}
                  </button>
                </div>

                <div className="p-4 grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                    <div className="flex items-center gap-2 mb-4 text-[10px] font-mono text-slate-500 uppercase font-black">
                      <ListChecks className="w-4 h-4 text-saffron-400" />
                      Execution Plan
                    </div>
                    <div className="space-y-3">
                      {activeRun.plan.map((item, index) => (
                        <div key={item} className="flex gap-3">
                          <div className="w-6 h-6 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-mono text-saffron-400 flex items-center justify-center shrink-0">
                            {index + 1}
                          </div>
                          <p className="text-xs leading-5 text-slate-300">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                    <div className="flex items-center gap-2 mb-4 text-[10px] font-mono text-slate-500 uppercase font-black">
                      <Terminal className="w-4 h-4 text-saffron-400" />
                      Command Queue
                    </div>
                    <div className="space-y-2">
                      {activeRun.commands.map(command => (
                        <div key={command} className="rounded-md bg-black/40 border border-slate-800 px-3 py-2 font-mono text-[11px] text-slate-300 overflow-x-auto">
                          <span className="text-saffron-500">$</span> {command}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                    <div className="flex items-center gap-2 mb-4 text-[10px] font-mono text-slate-500 uppercase font-black">
                      <FileCode2 className="w-4 h-4 text-saffron-400" />
                      Patch Brief
                    </div>
                    <pre className="min-h-52 whitespace-pre-wrap rounded-md bg-black/40 border border-slate-800 p-3 text-[11px] leading-5 text-slate-300 overflow-auto custom-scrollbar">
                      {activeRun.patch}
                    </pre>
                  </div>

                  <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                    <div className="flex items-center gap-2 mb-4 text-[10px] font-mono text-slate-500 uppercase font-black">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      Risk Review
                    </div>
                    <div className="space-y-3">
                      {activeRun.risks.map(risk => (
                        <div key={risk} className="flex gap-3">
                          <ChevronRight className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                          <p className="text-xs leading-5 text-slate-300">{risk}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <aside className="border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-950/90 p-4 space-y-4 overflow-y-auto custom-scrollbar">
              <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
                <div className="flex items-center gap-2 mb-4 text-[10px] font-mono text-slate-500 uppercase font-black">
                  <Files className="w-4 h-4 text-saffron-400" />
                  Workspace
                </div>
                <div className="space-y-2">
                  {workspaceFiles.map(file => (
                    <button
                      key={file.path}
                      onClick={() => setSelectedFile(file.path)}
                      className={cn(
                        'w-full rounded-lg border px-3 py-3 text-left transition-colors',
                        selectedFile === file.path
                          ? 'border-saffron-500/60 bg-saffron-500/10'
                          : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                      )}
                    >
                      <div className="text-[11px] font-mono text-slate-200 truncate">{file.path}</div>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <span className="text-[9px] uppercase text-slate-600 truncate">{file.signal}</span>
                        <span className="text-[9px] font-mono uppercase text-saffron-500">{file.status}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
                <div className="flex items-center gap-2 mb-4 text-[10px] font-mono text-slate-500 uppercase font-black">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Quality Gates
                </div>
                <div className="space-y-2">
                  {qualityGates.map(gate => (
                    <div key={gate} className="flex items-center gap-3 rounded-md bg-slate-950 border border-slate-800 px-3 py-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-[11px] text-slate-300">{gate}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
                <div className="flex items-center gap-2 mb-4 text-[10px] font-mono text-slate-500 uppercase font-black">
                  <Cpu className="w-4 h-4 text-saffron-400" />
                  Run Log
                </div>
                <div className="space-y-3">
                  {runLog.map(item => {
                    const Icon = item.icon;
                    return (
                      <div key={item.tag} className="flex gap-3">
                        <Icon className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-[10px] font-mono uppercase text-saffron-500">{item.tag}</div>
                          <div className="text-xs text-slate-400">{item.text}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </aside>
          </div>
        </main>
      </section>
    </div>
  );
};
