import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Palette, 
  Zap, 
  Save, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  Star,
  KeyRound,
  Eye,
  EyeOff,
  BrainCircuit
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import { getStoredGeminiApiKey, hasGeminiApiKey, setStoredGeminiApiKey, testGeminiApiKey } from '../../services/geminiService';
import { askSeaRho7, getAssistantReadinessLabel, type AssistantSource } from '../../services/assistantGateway';

const sourceLabel = (source: AssistantSource) => {
  if (source === 'backend') return 'Cloud AI';
  if (source === 'firebase-ai') return 'Free AI beta';
  if (source === 'browser-gemini') return 'Owner browser AI';
  return 'Local helper';
};

export const Settings: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [agentName, setAgentName] = useState(user?.agentName || '');
  const [theme, setTheme] = useState(user?.preferences?.theme || 'dark');
  const [speedMode, setSpeedMode] = useState<boolean>(user?.preferences?.speedMode ?? true);
  const [geminiApiKey, setGeminiApiKey] = useState(() => getStoredGeminiApiKey());
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingAi, setIsTestingAi] = useState(false);
  const [isTestingSeaRho7, setIsTestingSeaRho7] = useState(false);
  const [aiTestMessage, setAiTestMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sync initial state when user loads
  React.useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setAgentName(user.agentName || '');
      setTheme(user.preferences?.theme || 'dark');
      setSpeedMode(user.preferences?.speedMode ?? true);
    }
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        displayName,
        agentName,
        preferences: {
          theme: theme as 'light' | 'dark',
          speedMode
        }
      });
      setStoredGeminiApiKey(geminiApiKey);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestAi = async () => {
    setIsTestingAi(true);
    setAiTestMessage('');
    try {
      const result = await testGeminiApiKey(geminiApiKey);
      setStoredGeminiApiKey(geminiApiKey);
      setAiTestMessage(`Connected: ${result}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not connect to Gemini.';
      setAiTestMessage(`Not connected: ${message}`);
    } finally {
      setIsTestingAi(false);
    }
  };

  const handleTestSeaRho7 = async () => {
    setIsTestingSeaRho7(true);
    setAiTestMessage('');
    try {
      const result = await askSeaRho7({
        question: 'Teach Pythagoras in a useful student-friendly way.',
        mode: 'settings-ai-health-check',
        roomId: 'settings',
        userName: user?.displayName || 'owner',
        context: 'This is a health check. Answer briefly but prove the live assistant can teach directly.',
      });
      const label = sourceLabel(result.source);
      if (result.source === 'local') {
        setAiTestMessage('SEA.RHO7 answered, but only with the local helper. Run deploy-real-ai-backend.bat to make Cloud AI live.');
        return;
      }
      setAiTestMessage(`SEA.RHO7 live through ${label}: ${result.text.slice(0, 120)}...`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'SEA.RHO7 brain check failed.';
      setAiTestMessage(`Not connected: ${message}`);
    } finally {
      setIsTestingSeaRho7(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 px-4 sm:px-0">
      <div className="space-y-4">
        <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tighter uppercase italic flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          Settings <span className="text-saffron-600 block">/SEA.RHO7</span>
        </h2>
        <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.5em] font-black">Profile and workspace preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Section */}
        <div className="glass-panel p-8 sm:p-10 rounded-[2.5rem] border border-slate-900 flex flex-col gap-8 group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-lg group-hover:border-saffron-500/30 transition-all">
              <User className="w-6 h-6 text-saffron-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">Profile</h3>
              <p className="text-[10px] text-slate-500 font-mono font-bold uppercase">Name shown inside the app</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-mono text-slate-500 font-black uppercase tracking-widest px-1">Display Name</label>
              <input 
                type="text" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-mono text-xs focus:border-saffron-500 outline-none transition-all uppercase"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-mono text-slate-500 font-black uppercase tracking-widest px-1">Assistant Name</label>
              <input 
                type="text" 
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-mono text-xs focus:border-saffron-500 outline-none transition-all uppercase"
              />
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="glass-panel p-8 sm:p-10 rounded-[2.5rem] border border-slate-900 flex flex-col gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-lg">
              <Palette className="w-6 h-6 text-saffron-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">Appearance</h3>
              <p className="text-[10px] text-slate-500 font-mono font-bold uppercase">App display preferences</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                 <p className="text-xs font-bold text-white uppercase tracking-widest">Dark Mode</p>
                 <p className="text-[10px] font-mono text-slate-500 font-bold">High contrast workspace</p>
              </div>
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={cn(
                  "w-14 h-8 rounded-full border-2 transition-all p-1",
                  theme === 'dark' ? "bg-saffron-600 border-saffron-400" : "bg-slate-800 border-slate-700"
                )}
              >
                <div className={cn(
                  "w-5 h-5 bg-white rounded-full transition-all shadow-lg",
                  theme === 'dark' ? "translate-x-6" : "translate-x-0"
                )} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                 <p className="text-xs font-bold text-white uppercase tracking-widest">Fast Mode</p>
                 <p className="text-[10px] font-mono text-slate-500 font-bold">Shorter local helper responses</p>
              </div>
              <button 
                onClick={() => setSpeedMode(!speedMode)}
                className={cn(
                  "w-14 h-8 rounded-full border-2 transition-all p-1",
                  speedMode ? "bg-saffron-600 border-saffron-400" : "bg-slate-800 border-slate-700"
                )}
              >
                <div className={cn(
                  "w-5 h-5 bg-white rounded-full transition-all shadow-lg",
                  speedMode ? "translate-x-6" : "translate-x-0"
                )} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel p-8 sm:p-10 rounded-[2.5rem] border border-slate-900 flex flex-col gap-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-lg">
            <BrainCircuit className="w-6 h-6 text-saffron-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">AI Soul</h3>
            <p className="text-[10px] text-slate-500 font-mono font-bold uppercase">Connect Gemini for live answers</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <label className="text-[10px] font-mono text-slate-500 font-black uppercase tracking-widest px-1">Gemini API Key</label>
            <div className="relative">
              <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-saffron-400" />
              <input
                type={showApiKey ? 'text' : 'password'}
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="Paste your Gemini API key"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-14 py-4 text-white font-mono text-xs focus:border-saffron-500 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-900"
                aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <p className="text-xs leading-6 text-slate-500">
            Students should use the Cloud AI backend with your Gemini key hidden safely on Firebase. The browser key below is only for owner testing on this one browser.
          </p>
          <div className={cn(
            "rounded-2xl border px-5 py-4 text-xs font-black uppercase tracking-widest",
            getAssistantReadinessLabel() !== 'Local helper' || geminiApiKey.trim() || hasGeminiApiKey()
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-saffron-500/30 bg-saffron-500/10 text-saffron-300"
          )}>
            Assistant route: {getAssistantReadinessLabel()}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <button
              type="button"
              onClick={handleTestSeaRho7}
              disabled={isTestingSeaRho7}
              className="px-5 py-3 rounded-2xl bg-saffron-600 text-white text-[10px] font-black uppercase tracking-[0.25em] hover:bg-saffron-500 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {isTestingSeaRho7 ? <Zap className="w-4 h-4 animate-pulse" /> : <BrainCircuit className="w-4 h-4" />}
              {isTestingSeaRho7 ? 'Checking...' : 'Test SEA.RHO7 Brain'}
            </button>
            <button
              type="button"
              onClick={handleTestAi}
              disabled={isTestingAi || !geminiApiKey.trim()}
              className="px-5 py-3 rounded-2xl bg-vision-blue-700 text-white text-[10px] font-black uppercase tracking-[0.25em] hover:bg-vision-blue-600 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {isTestingAi ? <Zap className="w-4 h-4 animate-pulse" /> : <BrainCircuit className="w-4 h-4" />}
              {isTestingAi ? 'Testing...' : 'Test AI Connection'}
            </button>
            {aiTestMessage && (
              <p className={cn(
                "text-xs font-mono",
                aiTestMessage.startsWith('Connected') ? "text-emerald-300" : "text-saffron-300"
              )}>
                {aiTestMessage}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Premium Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Session', value: user?.email === 'guest@sea.rho7' ? 'GUEST' : 'ACTIVE', icon: Clock, color: 'text-saffron-400' },
          { label: 'AI', value: getAssistantReadinessLabel().toUpperCase(), icon: ShieldCheck, color: 'text-emerald-400' },
          { label: 'Hosting', value: 'FIREBASE', icon: Star, color: 'text-amber-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/40 p-6 rounded-3xl border border-slate-900 flex items-center gap-5">
            <stat.icon className={cn("w-5 h-5", stat.color)} />
            <div>
              <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest font-bold">{stat.label}</p>
              <p className="text-sm font-mono text-white font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex justify-center pt-10">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={cn(
            "px-12 py-5 rounded-2xl flex items-center gap-4 transition-all font-black text-xs uppercase tracking-[0.4em] relative overflow-hidden group w-full sm:w-auto justify-center",
            saved 
              ? "bg-emerald-600 text-white" 
              : "bg-saffron-600 text-white hover:bg-saffron-500 shadow-[0_20px_50px_rgba(242,86,7,0.3)] hover:-translate-y-1"
          )}
        >
          {isSaving ? (
            <Zap className="w-5 h-5 animate-pulse" />
          ) : saved ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <Save className="w-5 h-5 group-hover:scale-110 transition-all text-white fill-white" />
          )}
          {isSaving ? 'SAVING...' : saved ? 'SAVED' : 'SAVE CHANGES'}
          
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </button>
      </div>

      {/* Debug Info */}
      <div className="text-center">
        <p className="text-[9px] font-mono text-slate-800 uppercase tracking-[0.5em] font-black">
          USER ID: {user?.uid || 'guest'}
        </p>
      </div>
    </div>
  );
};
