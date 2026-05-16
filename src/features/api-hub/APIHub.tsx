import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Globe, Send, Save, Trash2, Plus, Terminal, Play, Settings, Activity, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { APIEndpoint } from '../../types';
import { AnimatePresence } from 'motion/react';

export const APIHub: React.FC = () => {
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [url, setUrl] = useState('https://api.example.com/data');
  const [method, setMethod] = useState('GET');
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newMethod, setNewMethod] = useState('GET');

  const handleSend = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(url, { method });
      const data = await res.json();
      setResponse(data);
    } catch (err: any) {
      setResponse({ error: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    const newEndpoint: APIEndpoint = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Endpoint ${endpoints.length + 1}`,
      url,
      method,
      ownerId: 'me'
    };
    setEndpoints([...endpoints, newEndpoint]);
    setActiveId(newEndpoint.id);
  };

  const handleCreateEndpoint = () => {
    if (!newName.trim() || !newUrl.trim()) return;

    const newEndpoint: APIEndpoint = {
      id: Math.random().toString(36).substr(2, 9),
      name: newName,
      url: newUrl,
      method: newMethod,
      ownerId: 'me'
    };
    setEndpoints([...endpoints, newEndpoint]);
    setActiveId(newEndpoint.id);
    setUrl(newUrl);
    setMethod(newMethod);
    setIsCreateModalOpen(false);
    setNewName('');
    setNewUrl('');
    setNewMethod('GET');
  };

  const [activeTab, setActiveTab] = useState('Parameters');
  const [params, setParams] = useState([{ key: '', value: '' }]);
  const [headers, setHeaders] = useState([{ key: 'Content-Type', value: 'application/json' }]);
  const [body, setBody] = useState('{\n  "query": "matrix_sync"\n}');

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-bold text-white tracking-tight uppercase">API Integration Hub</h2>
          <p className="text-slate-500 font-mono text-[10px] mt-1 uppercase tracking-[0.3em] font-bold">Distributed Protocol Connectivity Manager</p>
        </div>
        <div className="flex gap-3">
          <button className="p-3 rounded-2xl border border-slate-800 bg-slate-900 text-slate-500 hover:text-white hover:bg-slate-800 transition-all shadow-lg active:scale-95">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-16rem)]">
        {/* Sidebar */}
        <div className="lg:col-span-3 bg-slate-900/30 border border-slate-800 rounded-[2rem] overflow-hidden flex flex-col shadow-xl backdrop-blur-md">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] font-bold">Node Registry</span>
            <button 
              onClick={() => setIsCreateModalOpen(true)} 
              className="p-3 rounded-xl bg-saffron-600 border border-saffron-500 text-white hover:bg-saffron-500 transition-all shadow-lg shadow-saffron-600/20 active:scale-95 flex items-center gap-2 group"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] pr-1">Initialize Node</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {endpoints.length === 0 && (
              <div className="py-20 text-center space-y-6">
                <div className="relative inline-block">
                  <Globe className="w-16 h-16 mx-auto text-slate-800 opacity-20" />
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-2 border-dashed border-saffron-500/20 rounded-full"
                  />
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest font-bold">No Neural Endpoints Mapped</p>
                  <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-6 py-3 bg-slate-900 border border-slate-800 text-saffron-500 text-[9px] font-black uppercase tracking-[0.3em] rounded-xl hover:bg-saffron-600 hover:text-white hover:border-saffron-500 transition-all shadow-xl active:scale-95"
                  >
                    Deploy First Node
                  </button>
                </div>
              </div>
            )}
            {endpoints.map(ep => (
              <button
                key={ep.id}
                onClick={() => {
                  setActiveId(ep.id);
                  setUrl(ep.url);
                  setMethod(ep.method);
                }}
                className={cn(
                  "w-full flex flex-col gap-2 p-4 rounded-2xl text-left transition-all border group relative overflow-hidden",
                  activeId === ep.id 
                    ? "bg-saffron-600/10 border-saffron-500/30 text-white shadow-lg" 
                    : "border-transparent hover:bg-slate-800/40 text-slate-400 hover:text-slate-200"
                )}
              >
                <div className="flex justify-between items-center relative z-10">
                  <span className="text-[11px] font-bold truncate tracking-wide uppercase">{ep.name}</span>
                  <span className={cn(
                    "text-[8px] font-mono px-2 py-0.5 rounded-full border font-bold",
                    ep.method === 'GET' ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" : "border-saffron-500/30 text-saffron-400 bg-saffron-500/10"
                  )}>{ep.method}</span>
                </div>
                <span className="text-[9px] font-mono opacity-40 truncate relative z-10">{ep.url}</span>
                {activeId === ep.id && <div className="absolute right-0 top-0 w-1 h-full bg-saffron-500" />}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-9 flex flex-col gap-8 h-full">
          <div className="bg-slate-900/30 border border-slate-800 p-8 rounded-[2rem] space-y-8 backdrop-blur-md shadow-2xl overflow-hidden flex flex-col shrink-0">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative group">
                <select 
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xs font-mono text-saffron-400 focus:outline-none focus:border-saffron-500/50 appearance-none cursor-pointer hover:bg-slate-900 transition-all font-bold min-w-[120px] shadow-lg w-full md:w-auto"
                >
                  <option>GET</option>
                  <option>POST</option>
                  <option>PUT</option>
                  <option>DELETE</option>
                </select>
              </div>
              <div className="flex-1 relative group">
                <Globe className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-saffron-400 transition-colors" />
                <input 
                  type="text" 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-14 pr-6 text-sm font-mono text-slate-200 focus:outline-none focus:border-saffron-500/50 transition-all shadow-lg placeholder:text-slate-700"
                  placeholder="https://api.vortex.network/v1/stream"
                />
              </div>
              <button 
                onClick={handleSend}
                disabled={isLoading}
                className="bg-saffron-600 text-white px-10 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-saffron-500 disabled:opacity-50 transition-all shadow-[0_10px_30px_rgba(255,116,18,0.3)] hover:-translate-y-1 active:translate-y-0 text-sm uppercase tracking-widest shrink-0"
              >
                {isLoading ? <Activity className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                Execute
              </button>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex gap-6 border-b border-slate-800/50 overflow-x-auto pb-px">
                {['Parameters', 'Header Stream', 'Data Payload', 'Auth Protocol'].map((tab) => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-6 py-4 text-[10px] font-mono uppercase tracking-[0.2em] font-bold transition-all whitespace-nowrap border-b-2 hover:text-white",
                      activeTab === tab ? "text-saffron-400 border-saffron-500" : "text-slate-500 border-transparent hover:border-slate-700"
                    )}
                  >
                    {tab}
                  </button>
                ))}
                <div className="flex-1" />
                <button onClick={handleSave} className="px-6 py-4 text-[10px] font-mono text-saffron-400 uppercase tracking-widest hover:text-saffron-300 flex items-center gap-3 font-bold group">
                  <Save className="w-4 h-4 group-hover:scale-110 transition-transform" /> Persist
                </button>
              </div>

              <div className="bg-slate-950/40 rounded-2xl border border-slate-800/50 p-6">
                <AnimatePresence mode="wait">
                  {activeTab === 'Parameters' && (
                    <motion.div 
                      key="params"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      {params.map((p, i) => (
                        <div key={i} className="flex gap-4">
                          <input 
                            placeholder="Key"
                            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 flex-1 text-xs font-mono text-slate-300 outline-none focus:border-saffron-500/30"
                            value={p.key}
                            onChange={(e) => {
                              const newParams = [...params];
                              newParams[i].key = e.target.value;
                              setParams(newParams);
                            }}
                          />
                          <input 
                            placeholder="Value"
                            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 flex-1 text-xs font-mono text-slate-300 outline-none focus:border-saffron-500/30"
                            value={p.value}
                            onChange={(e) => {
                              const newParams = [...params];
                              newParams[i].value = e.target.value;
                              setParams(newParams);
                            }}
                          />
                          {params.length > 1 && (
                            <button 
                              onClick={() => setParams(params.filter((_, idx) => idx !== i))}
                              className="p-2 text-slate-600 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button 
                        onClick={() => setParams([...params, { key: '', value: '' }])}
                        className="text-[10px] font-mono text-saffron-500 uppercase tracking-widest flex items-center gap-2 hover:text-saffron-400 transition-colors font-bold"
                      >
                        <Plus className="w-3 h-3" /> Insert Parameter
                      </button>
                    </motion.div>
                  )}

                  {activeTab === 'Header Stream' && (
                    <motion.div 
                      key="headers"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      {headers.map((h, i) => (
                        <div key={i} className="flex gap-4">
                          <input 
                            placeholder="Header"
                            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 flex-1 text-xs font-mono text-slate-300 outline-none focus:border-saffron-500/30"
                            value={h.key}
                            onChange={(e) => {
                              const newHeaders = [...headers];
                              newHeaders[i].key = e.target.value;
                              setHeaders(newHeaders);
                            }}
                          />
                          <input 
                            placeholder="Value"
                            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 flex-1 text-xs font-mono text-slate-300 outline-none focus:border-saffron-500/30"
                            value={h.value}
                            onChange={(e) => {
                              const newHeaders = [...headers];
                              newHeaders[i].value = e.target.value;
                              setHeaders(newHeaders);
                            }}
                          />
                          {headers.length > 1 && (
                            <button 
                              onClick={() => setHeaders(headers.filter((_, idx) => idx !== i))}
                              className="p-2 text-slate-600 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button 
                        onClick={() => setHeaders([...headers, { key: '', value: '' }])}
                        className="text-[10px] font-mono text-saffron-500 uppercase tracking-widest flex items-center gap-2 hover:text-saffron-400 transition-colors font-bold"
                      >
                        <Plus className="w-3 h-3" /> Append Header
                      </button>
                    </motion.div>
                  )}

                  {activeTab === 'Data Payload' && (
                    <motion.div 
                      key="payload"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <textarea 
                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-xs font-mono text-slate-300 outline-none focus:border-saffron-500/30 min-h-[150px] resize-none"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder='{ "key": "value" }'
                      />
                    </motion.div>
                  )}

                  {activeTab === 'Auth Protocol' && (
                    <motion.div 
                      key="auth"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center justify-center py-10"
                    >
                      <div className="text-center space-y-4">
                        <Settings className="w-10 h-10 text-slate-800 mx-auto animate-spin-slow" />
                        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest font-bold">Standard Bearer Auth Active</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-slate-900/30 border border-slate-800 rounded-[2.5rem] overflow-hidden flex flex-col backdrop-blur-md shadow-[0_40px_100px_rgba(0,0,0,0.4)]">
            <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex justify-between items-center px-8">
              <div className="flex items-center gap-6">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3 font-bold">
                  <Terminal className="w-4 h-4 text-saffron-400" /> Output Buffer
                </span>
                {response && (
                  <span className={cn(
                    "text-[9px] font-mono px-4 py-1 rounded-full border font-bold uppercase tracking-widest",
                    response.error ? "border-red-500/30 text-red-400 bg-red-500/10" : "border-emerald-500/30 text-emerald-400 bg-emerald-500/10 shadow-[0_0_15px_rgba(52,211,153,0.1)]"
                  )}>
                    {response.error ? 'CRITICAL_FAILURE' : 'SIGNAL_SYNC_OK (200)'}
                  </span>
                )}
              </div>
              <button onClick={() => setResponse(null)} className="text-[9px] font-mono text-slate-500 hover:text-red-400 uppercase font-bold tracking-widest transition-colors">Wipe Buffer</button>
            </div>
            <div className="flex-1 p-8 font-mono text-xs overflow-y-auto custom-scrollbar bg-slate-950/60 selection:bg-saffron-500/30">
              {response ? (
                <pre className="text-slate-300 leading-relaxed font-medium">
                  {JSON.stringify(response, null, 2)}
                </pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-800 select-none uppercase tracking-[0.4em] gap-6 grayscale">
                  <motion.div
                    animate={{ opacity: [0.2, 0.5, 0.2], scale: [0.95, 1, 0.95] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                  >
                    <Terminal className="w-16 h-16" />
                  </motion.div>
                  <span className="text-[11px] font-bold">Awaiting encrypted signal sync...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl p-10 space-y-8"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-white uppercase tracking-tight">Configure New Node</h3>
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] font-bold mt-1">Protocol Definition Matrix</p>
                </div>
                <button 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-800 text-slate-500 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-mono text-slate-500 font-black uppercase tracking-widest px-1">Endpoint Name</label>
                  <input 
                    type="text" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="User Metadata Service"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-mono text-xs focus:border-saffron-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-mono text-slate-500 font-black uppercase tracking-widest px-1">Resource URL</label>
                  <div className="relative">
                    <Globe className="w-4 h-4 absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" />
                    <input 
                      type="text" 
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      placeholder="https://api.vortex.network/v1/auth"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-14 pr-6 text-white font-mono text-xs focus:border-saffron-500 outline-none transition-all placeholder:text-slate-700"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-mono text-slate-500 font-black uppercase tracking-widest px-1">HTTP Method</label>
                  <div className="grid grid-cols-4 gap-3">
                    {['GET', 'POST', 'PUT', 'DELETE'].map((m) => (
                      <button
                        key={m}
                        onClick={() => setNewMethod(m)}
                        className={cn(
                          "py-3 rounded-xl border text-[10px] font-bold transition-all uppercase tracking-widest",
                          newMethod === m 
                            ? "bg-saffron-600 border-saffron-400 text-white shadow-lg shadow-saffron-600/20" 
                            : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300"
                        )}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleCreateEndpoint}
                  disabled={!newName.trim() || !newUrl.trim()}
                  className="w-full py-5 rounded-2xl bg-saffron-600 text-white font-black text-xs uppercase tracking-[0.3em] hover:bg-saffron-500 transition-all shadow-[0_20px_50px_rgba(255,116,18,0.3)] disabled:opacity-30 disabled:pointer-events-none hover:-translate-y-1 active:translate-y-0"
                >
                  Map Protocol Node
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
