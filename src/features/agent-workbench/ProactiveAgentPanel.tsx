import React, { useCallback, useEffect, useState } from 'react';
import { Activity, Pause, Play, Plus, ShieldAlert, Square, Target } from 'lucide-react';
import firebaseConfig from '../../../firebase-applet-config.json';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

type Goal = {
  id: string;
  objective: string;
  status: string;
  latestProgress?: string;
  nextAction?: string;
  approvalReason?: string;
  runCount?: number;
};

const endpoint = `https://${'us-central1'}-${firebaseConfig.projectId}.cloudfunctions.net/agenticApi`;

const statusLabel: Record<string, string> = {
  active: 'Working proactively',
  paused: 'Paused',
  stopped: 'Stopped',
  completed: 'Completed',
  awaiting_approval: 'Approval required',
};

export const ProactiveAgentPanel: React.FC = () => {
  const [objective, setObjective] = useState('');
  const [successCriteria, setSuccessCriteria] = useState('');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const request = useCallback(async (payload?: Record<string, unknown>, method: 'GET' | 'POST' = 'GET') => {
    const user = auth.currentUser;
    if (!user) throw new Error('Sign in to use proactive goals.');
    const token = await user.getIdToken();
    const response = await fetch(endpoint, {
      method,
      headers: { Authorization: `Bearer ${token}`, ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {}) },
      ...(method === 'POST' ? { body: JSON.stringify(payload || {}) } : {}),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'The agent service is unavailable.');
    return data;
  }, []);

  const refresh = useCallback(async () => {
    try {
      const data = await request();
      setGoals(Array.isArray(data.goals) ? data.goals : []);
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load your goals.');
    }
  }, [request]);

  useEffect(() => {
    let timer: number | undefined;
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (!user) {
        setGoals([]);
        if (timer !== undefined) window.clearInterval(timer);
        return;
      }
      void refresh();
      if (timer !== undefined) window.clearInterval(timer);
      timer = window.setInterval(() => { void refresh(); }, 30000);
    });
    return () => {
      unsubscribe();
      if (timer !== undefined) window.clearInterval(timer);
    };
  }, [refresh]);

  const createGoal = async () => {
    if (objective.trim().length < 8) {
      setError('Write a clear objective of at least 8 characters.');
      return;
    }
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await request({ action: 'create', objective, successCriteria }, 'POST');
      setObjective('');
      setSuccessCriteria('');
      setNotice('Goal saved. SEA.RHO7 will pick it up automatically.');
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not create this goal.');
    } finally {
      setBusy(false);
    }
  };

  const control = async (goalId: string, action: string) => {
    setBusy(true);
    setError('');
    try {
      await request({ action, goalId }, 'POST');
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not update this goal.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mb-6 overflow-hidden rounded-xl border border-saffron-500/30 bg-slate-950/90">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-vision-blue-950/50 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-saffron-500/30 bg-saffron-500/10 p-2"><Target className="h-5 w-5 text-saffron-400" /></div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-white">Proactive goals</h2>
            <p className="text-xs text-slate-400">Set an outcome. SEA.RHO7 keeps working through safe planning cycles.</p>
          </div>
        </div>
        <span className="flex items-center gap-2 rounded-full border border-emerald-500/30 px-3 py-1 text-[10px] font-mono uppercase text-emerald-300"><Activity className="h-3 w-3" /> Background agent</span>
      </div>

      <div className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
        <div className="space-y-3">
          <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400" htmlFor="proactive-objective">What outcome should I work toward?</label>
          <textarea id="proactive-objective" value={objective} onChange={event => setObjective(event.target.value)} maxLength={600} placeholder="Example: Help me prepare a launch plan for my new product, identify the next milestones, and keep the plan updated." className="min-h-28 w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-sm leading-6 text-white outline-none focus:border-saffron-500" />
          <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400" htmlFor="proactive-success">How will we know it is done? (optional)</label>
          <input id="proactive-success" value={successCriteria} onChange={event => setSuccessCriteria(event.target.value)} maxLength={500} placeholder="Success criteria" className="w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-sm text-white outline-none focus:border-saffron-500" />
          <button disabled={busy || objective.trim().length < 8} onClick={createGoal} className="inline-flex h-10 items-center gap-2 rounded-lg bg-gradient-to-r from-vision-blue-600 to-saffron-600 px-4 text-xs font-black uppercase tracking-wider text-white disabled:cursor-not-allowed disabled:opacity-40"><Plus className="h-4 w-4" /> Start autonomous goal</button>
          <p className="text-[11px] leading-5 text-slate-500">Proactive mode runs on a five-minute schedule. It can plan, draft, and track progress. Sending, publishing, spending, deleting, deployment, and other consequential actions remain approval-gated and are not executed by this first release.</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between"><h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">Your active objectives</h3><button onClick={() => void refresh()} className="text-[10px] font-mono uppercase text-saffron-400">Refresh</button></div>
          {goals.length === 0 && <div className="rounded-lg border border-dashed border-slate-700 p-5 text-sm text-slate-500">No goals yet. Add one and SEA.RHO7 will start a background planning cycle.</div>}
          {goals.map(goal => (
            <article key={goal.id} className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2"><h4 className="text-sm font-bold text-white">{goal.objective}</h4><span className={`text-[9px] font-mono uppercase ${goal.status === 'awaiting_approval' ? 'text-amber-300' : goal.status === 'active' ? 'text-emerald-300' : 'text-slate-400'}`}>{statusLabel[goal.status] || goal.status}</span></div>
              <p className="mt-2 text-xs leading-5 text-slate-300">{goal.latestProgress || 'Waiting for first agent cycle.'}</p>
              {goal.nextAction && <p className="mt-2 text-xs leading-5 text-slate-500"><span className="text-saffron-400">Next:</span> {goal.nextAction}</p>}
              {goal.approvalReason && <p className="mt-2 flex gap-2 text-xs text-amber-300"><ShieldAlert className="h-4 w-4 shrink-0" />{goal.approvalReason}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                {goal.status === 'active' && <button disabled={busy} onClick={() => void control(goal.id, 'pause')} className="inline-flex items-center gap-1 rounded border border-slate-700 px-2 py-1 text-[10px] text-slate-300"><Pause className="h-3 w-3" /> Pause</button>}
                {goal.status === 'paused' && <button disabled={busy} onClick={() => void control(goal.id, 'resume')} className="inline-flex items-center gap-1 rounded border border-slate-700 px-2 py-1 text-[10px] text-slate-300"><Play className="h-3 w-3" /> Resume</button>}
                {goal.status === 'awaiting_approval' && <button disabled={busy} onClick={() => void control(goal.id, 'approve')} className="inline-flex items-center gap-1 rounded border border-amber-500/40 px-2 py-1 text-[10px] text-amber-200">Approve next planning step</button>}
                {!['stopped', 'completed'].includes(goal.status) && <button disabled={busy} onClick={() => void control(goal.id, 'stop')} className="inline-flex items-center gap-1 rounded border border-rose-500/30 px-2 py-1 text-[10px] text-rose-300"><Square className="h-3 w-3" /> Stop</button>}
                <span className="ml-auto self-center text-[9px] font-mono text-slate-600">{goal.runCount || 0} cycles</span>
              </div>
            </article>
          ))}
        </div>
      </div>
      {(error || notice) && <div role="status" className={`border-t px-5 py-3 text-xs ${error ? 'border-rose-500/30 text-rose-300' : 'border-emerald-500/30 text-emerald-300'}`}>{error || notice}</div>}
    </section>
  );
};
