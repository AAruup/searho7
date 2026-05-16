import React, { useMemo, useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Loader2, Radio, Film, Wand2, Download } from 'lucide-react';
import { cn } from '../../lib/utils';
import { generateMusic, hasGeminiApiKey } from '../../services/geminiService';

interface LyricLine {
  time: number;
  text: string;
}

const DEMO_LYRICS: LyricLine[] = [
  { time: 0, text: "[INITIALIZING PROTOCOL]" },
  { time: 2, text: "Lost in the static of the main-frame" },
  { time: 5, text: "Shadows dancing on the silicon floor" },
  { time: 8, text: "Binary heartbeats, rhythmic and cold" },
  { time: 12, text: "Searching for data we used to hold" },
  { time: 15, text: "SEA.RHO7 in the deep architecture" },
  { time: 19, text: "Neural pathways in the night" },
  { time: 22, text: "Waiting for the signal to ignite" },
  { time: 26, text: "[END OF TRANSMISSION]" },
];

const buildLocalLyrics = (prompt: string): LyricLine[] => {
  const subject = prompt.trim() || 'blue saffron dreams';
  const words = subject
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 6);
  const hook = words.length ? words.join(' ') : 'future signal';

  return [
    { time: 0, text: '[BLUEPRINT ONLINE]' },
    { time: 3, text: `I light the screen with ${hook}` },
    { time: 7, text: 'Saffron sparks over midnight blue' },
    { time: 11, text: 'Every heartbeat turns into motion' },
    { time: 15, text: 'Every line becomes a view' },
    { time: 19, text: 'We rise through the static together' },
    { time: 23, text: 'Frame by frame, the signal is new' },
    { time: 27, text: 'SEA.RHO7 carries the chorus' },
    { time: 31, text: '[ANIMATION READY]' },
  ];
};

const getActiveLyricIndex = (time: number, lines: LyricLine[]) =>
  lines.findIndex((line, i) => {
    const nextLine = lines[i + 1];
    return time >= line.time && (!nextLine || time < nextLine.time);
  });

const wrapCanvasText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });

  if (currentLine) lines.push(currentLine);
  return lines;
};

export const LyricAnimation: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [musicPrompt, setMusicPrompt] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [lyrics, setLyrics] = useState<LyricLine[]>(DEMO_LYRICS);
  const [statusMessage, setStatusMessage] = useState('Ready. Type an idea and press Create Animation.');
  const [isExportingVideo, setIsExportingVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const duration = useMemo(() => Math.max(34, (lyrics[lyrics.length - 1]?.time || 30) + 4), [lyrics]);

  const drawVideoFrame = (time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(640, Math.floor(rect.width * dpr));
    const height = Math.max(720, Math.floor(rect.height * dpr));

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const active = Math.max(0, getActiveLyricIndex(time, lyrics));
    const activeLine = lyrics[active] || lyrics[0];
    const nextLine = lyrics[active + 1];
    const lineStart = activeLine?.time || 0;
    const lineEnd = nextLine?.time || duration;
    const lineProgress = Math.min(1, Math.max(0, (time - lineStart) / Math.max(1, lineEnd - lineStart)));
    const pulse = Math.sin(time * 2.4) * 0.5 + 0.5;

    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, '#031027');
    bg.addColorStop(0.45, '#123b86');
    bg.addColorStop(1, '#461405');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 1 * dpr;
    const grid = 44 * dpr;
    for (let x = (time * 12 * dpr) % grid; x < width; x += grid) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = (time * 8 * dpr) % grid; y < height; y += grid) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();

    const cx = width / 2;
    const cy = height * 0.44;
    const radius = Math.min(width, height) * (0.2 + pulse * 0.045);
    const ring = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * 1.5);
    ring.addColorStop(0, 'rgba(255, 148, 56, 0.34)');
    ring.addColorStop(0.45, 'rgba(37, 99, 235, 0.18)');
    ring.addColorStop(1, 'rgba(3, 16, 39, 0)');
    ctx.fillStyle = ring;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.55, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 34; i += 1) {
      const drift = time * (0.12 + i * 0.008);
      const x = (Math.sin(i * 91.7 + drift) * 0.5 + 0.5) * width;
      const y = (Math.cos(i * 43.3 + drift * 1.6) * 0.5 + 0.5) * height;
      ctx.fillStyle = i % 3 === 0 ? 'rgba(255, 148, 56, 0.58)' : 'rgba(147, 197, 253, 0.34)';
      ctx.beginPath();
      ctx.arc(x, y, (2 + (i % 4)) * dpr, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = 'rgba(3, 16, 39, 0.55)';
    ctx.fillRect(0, height * 0.62, width, height * 0.38);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(255, 116, 18, 0.7)';
    ctx.shadowBlur = 28 * dpr;
    ctx.font = `${Math.max(36, Math.floor(width * 0.058))}px Inter, Arial, sans-serif`;
    ctx.fillStyle = '#ffffff';
    const mainLines = wrapCanvasText(ctx, activeLine?.text || 'SEA.RHO7', width * 0.82);
    const lineHeight = Math.max(44, width * 0.07);
    const startY = height * 0.68 - ((mainLines.length - 1) * lineHeight) / 2;
    mainLines.forEach((line, index) => {
      const y = startY + index * lineHeight;
      ctx.globalAlpha = 0.92 + pulse * 0.08;
      ctx.fillText(line.toUpperCase(), cx, y);
    });
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    ctx.font = `${Math.max(14, Math.floor(width * 0.018))}px JetBrains Mono, monospace`;
    ctx.fillStyle = '#ffbc6b';
    ctx.fillText('SEA.RHO7 LYRICS TO ANIMATION', cx, height * 0.1);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    const barX = width * 0.16;
    const barY = height * 0.88;
    const barW = width * 0.68;
    const barH = 8 * dpr;
    ctx.fillRect(barX, barY, barW, barH);
    const fill = ctx.createLinearGradient(barX, barY, barX + barW, barY);
    fill.addColorStop(0, '#2563eb');
    fill.addColorStop(1, '#ff7412');
    ctx.fillStyle = fill;
    ctx.fillRect(barX, barY, barW * lineProgress, barH);

    ctx.font = `${Math.max(12, Math.floor(width * 0.015))}px JetBrains Mono, monospace`;
    ctx.fillStyle = 'rgba(219, 234, 254, 0.7)';
    ctx.fillText(`${Math.floor(time).toString().padStart(2, '0')}s / ${Math.floor(duration).toString().padStart(2, '0')}s`, cx, height * 0.93);
  };

  const handleGenerateMusic = async () => {
    if (!musicPrompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setStatusMessage('Creating local lyric animation...');
    try {
      const offlinePreview = typeof window !== 'undefined' && window.location.protocol === 'file:';
      const localLyrics = buildLocalLyrics(musicPrompt);

      if (!offlinePreview && hasGeminiApiKey()) {
        const result = await generateMusic(musicPrompt);
        if (!result) {
          setAudioUrl(null);
          setLyrics(localLyrics);
          setStatusMessage('Cloud audio was unavailable, so I created an offline animation instead.');
        } else if (result.lyrics) {
          setAudioUrl(result.url);
          const lines = result.lyrics.split('\n').filter(l => l.trim()).map((l, i) => ({
            time: i * 4,
            text: l.trim()
          }));
          setLyrics(lines.length > 0 ? lines : localLyrics);
        } else {
          setAudioUrl(result.url);
          setLyrics(localLyrics);
          setStatusMessage('Cloud audio loaded. Animation is ready.');
        }
      } else {
        setAudioUrl(null);
        setLyrics(localLyrics);
        setStatusMessage('Offline animation created. It will animate without an audio file.');
      }
      setCurrentTime(0);
      setActiveIndex(0);
      setIsPlaying(true);
      setVideoUrl(null);
    } catch (error) {
      console.error("Music generation failed:", error);
      setAudioUrl(null);
      setLyrics(buildLocalLyrics(musicPrompt));
      setCurrentTime(0);
      setActiveIndex(0);
      setIsPlaying(true);
      setVideoUrl(null);
      setStatusMessage('Cloud audio was unavailable, so I created an offline animation instead.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas || isExportingVideo) return;

    const stream = canvas.captureStream(30);
    if (!stream || typeof MediaRecorder === 'undefined') {
      setStatusMessage('This browser cannot export the canvas video. The live preview still works.');
      return;
    }

    const chunks: BlobPart[] = [];
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm';
    const recorder = new MediaRecorder(stream, { mimeType });
    recorder.ondataavailable = event => {
      if (event.data.size > 0) chunks.push(event.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'sea-rho7-lyrics-animation.webm';
      link.click();
      setIsExportingVideo(false);
      setStatusMessage('Animated WebM video downloaded. You can convert it to MP4 later if needed.');
    };

    setIsExportingVideo(true);
    setStatusMessage('Recording a short animated video from the lyric preview...');
    setCurrentTime(0);
    setActiveIndex(0);
    setIsPlaying(true);
    recorder.start();

    window.setTimeout(() => {
      if (recorder.state !== 'inactive') recorder.stop();
      setIsPlaying(false);
    }, Math.min(duration, 18) * 1000);
  };

  useEffect(() => {
    let frame = 0;
    const render = () => {
      drawVideoFrame(currentTime);
      frame = window.requestAnimationFrame(render);
    };

    render();
    return () => window.cancelAnimationFrame(frame);
  }, [currentTime, lyrics, duration, musicPrompt]);

  useEffect(() => {
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            if (error.name !== 'AbortError') {
              console.warn("Audio playback interrupted or failed:", error);
            }
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, audioUrl]);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        if (audioRef.current && audioUrl) {
          const current = audioRef.current.currentTime;
          setCurrentTime(current);
          const index = getActiveLyricIndex(current, lyrics);
          setActiveIndex(index);
          
          if (audioRef.current.ended) {
            setIsPlaying(false);
            setCurrentTime(0);
          }
        } else {
          setCurrentTime(prev => {
            const next = prev + 0.1;
            const index = getActiveLyricIndex(next, lyrics);
            setActiveIndex(index);
            if (next >= duration) {
              setIsPlaying(false);
              return 0;
            }
            return next;
          });
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, lyrics, audioUrl, duration]);

  const jumpToLyric = (index: number) => {
    const line = lyrics[index];
    if (!line) return;
    if (audioRef.current && audioUrl) audioRef.current.currentTime = line.time;
    setCurrentTime(line.time);
    setActiveIndex(index);
  };

  useEffect(() => {
    if (scrollRef.current && activeIndex !== -1) {
      const activeEl = scrollRef.current.children[activeIndex] as HTMLElement;
      if (activeEl) {
        scrollRef.current.scrollTo({
          top: activeEl.offsetTop - 200,
          behavior: 'smooth'
        });
      }
    }
  }, [activeIndex]);

  return (
    <div className="min-h-[calc(100vh-10rem)] grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
      {/* Player Section */}
      <div className="lg:col-span-5 flex flex-col gap-5">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-lg bg-vision-blue-600/10 border border-vision-blue-500/30 text-vision-blue-200 text-[9px] font-mono font-black uppercase tracking-[0.3em] shadow-xl">
             <Radio className="w-3.5 h-3.5 text-saffron-400" /> Lyrics Studio
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tighter uppercase italic premium-text-gradient">
            Lyrics To Animation
          </h2>
          <p className="text-vision-blue-200/70 text-sm leading-6">Type a song idea. The app now creates timed lyrics and animates them even when cloud audio is unavailable.</p>
        </div>

        <div className="sticky top-0 z-20 bg-vision-blue-950/70 shadow-2xl border border-vision-blue-900 rounded-lg p-4 mb-2">
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text"
              value={musicPrompt}
              onChange={(e) => setMusicPrompt(e.target.value)}
              placeholder="Example: hopeful blue city anthem with saffron lights"
              className="flex-1 bg-slate-950 border border-vision-blue-900 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-saffron-500/60"
            />
            <button 
              onClick={handleGenerateMusic}
              disabled={isGenerating || !musicPrompt.trim()}
              className="px-5 py-3 bg-gradient-to-r from-vision-blue-600 to-saffron-600 hover:from-vision-blue-500 hover:to-saffron-500 text-white rounded-lg transition-all disabled:opacity-40 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              {isGenerating ? 'Creating...' : 'Create Animation'}
            </button>
            <button
              onClick={handleExportVideo}
              disabled={isExportingVideo}
              className="px-5 py-3 bg-slate-950 border border-vision-blue-800 hover:border-saffron-500/70 text-white rounded-lg transition-all disabled:opacity-40 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"
            >
              {isExportingVideo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 text-saffron-300" />}
              {isExportingVideo ? 'Recording...' : 'Download Video'}
            </button>
          </div>
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-xs text-vision-blue-200/70">{statusMessage}</p>
            {videoUrl && (
              <a
                href={videoUrl}
                download="sea-rho7-lyrics-animation.webm"
                className="text-[10px] font-mono uppercase tracking-widest text-saffron-300 hover:text-saffron-100"
              >
                Download again
              </a>
            )}
          </div>
        </div>

        <div className="flex-1 min-h-[520px] bg-slate-900 border border-vision-blue-900 rounded-lg overflow-hidden relative group shadow-2xl backdrop-blur-xl">
          <div className="absolute inset-0 technical-grid opacity-20 pointer-events-none" />
          <audio ref={audioRef} src={audioUrl || undefined} className="hidden" />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full"
            aria-label="Animated lyric video preview"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(37,99,235,0.35),transparent_35%),linear-gradient(135deg,rgba(15,23,42,0.95),rgba(30,64,175,0.35),rgba(242,86,7,0.22))] opacity-30" />
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-vision-blue-500/15 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-transparent" />
          <motion.div
            className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-saffron-400/30"
            animate={{ scale: isPlaying ? [1, 1.25, 1] : 1, rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
          
          <div className="absolute bottom-8 left-6 right-6 space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-3xl lg:text-4xl font-black text-white tracking-tighter uppercase italic">{musicPrompt || "Binary Shadows"}</h3>
                <p className="text-vision-blue-300 font-mono text-[10px] tracking-[0.35em] mt-3 uppercase font-black">
                  {audioUrl ? 'AUDIO_SYNC_ACTIVE' : 'OFFLINE_ANIMATION_MODE'}
                </p>
              </div>
              <div className="p-4 bg-slate-950/80 backdrop-blur-2xl rounded-lg border border-vision-blue-900 cursor-pointer hover:border-saffron-500/60 group/heart transition-all shadow-2xl">
                <Film className="w-7 h-7 text-saffron-400 group-hover/heart:scale-110 transition-all duration-500" />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden relative backdrop-blur-xl p-[1px]">
                <motion.div 
                   className="h-full bg-saffron-600 shadow-[0_0_30px_rgba(242,86,7,0.7)] relative z-10 rounded-full"
                  animate={{ width: `${(currentTime / (audioRef.current?.duration || duration)) * 100}%` }}
                  transition={{ ease: 'linear' }}
                />
                <div className="absolute inset-0 bg-saffron-500/10 animate-pulse pointer-events-none" />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-slate-600 font-black tracking-widest uppercase italic">
                <span>0:{Math.floor(currentTime).toString().padStart(2, '0')}</span>
                <span className="text-saffron-400">0:{Math.floor(audioRef.current?.duration || duration).toString().padStart(2, '0')}_READY</span>
              </div>
            </div>

            <div className="flex justify-center items-center gap-14 py-4">
              <button onClick={() => jumpToLyric(Math.max(0, activeIndex - 1))} className="text-vision-blue-300/50 hover:text-white transition-all transform hover:-translate-x-2 active:scale-95"><SkipBack className="w-8 h-8 font-black" /></button>
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-20 h-20 rounded-2xl bg-white text-slate-950 flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-[0_30px_60px_rgba(255,255,255,0.15)] group/play relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-saffron-600 translate-y-full group-hover/play:translate-y-0 transition-transform duration-700" />
                {isPlaying ? <Pause className="w-10 h-10 fill-current relative z-10 group-hover/play:text-white transition-colors duration-500" /> : <Play className="w-10 h-10 fill-current ml-2 relative z-10 group-hover/play:text-white transition-colors duration-500" />}
              </button>
              <button onClick={() => jumpToLyric(Math.min(lyrics.length - 1, activeIndex + 1))} className="text-vision-blue-300/50 hover:text-white transition-all transform hover:translate-x-2 active:scale-95"><SkipForward className="w-8 h-8 font-black" /></button>
            </div>
          </div>
        </div>

        <div className="bg-vision-blue-950/30 border border-vision-blue-900 p-5 rounded-lg flex items-center justify-between backdrop-blur-xl shadow-2xl">
           <div className="flex items-center gap-6">
             <Volume2 className="w-6 h-6 text-slate-800" />
             <div className="w-40 h-1.5 bg-slate-950 rounded-full overflow-hidden p-[1px]">
               <div className="w-[60%] h-full bg-saffron-600 shadow-[0_0_10px_rgba(242,86,7,0.4)] rounded-full" />
             </div>
           </div>
           <p className="text-[10px] font-mono text-vision-blue-300/60 font-black uppercase tracking-[0.25em] italic">Animation Engine Ready</p>
        </div>
      </div>

      {/* Lyrics Side */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <div className="flex justify-between items-center px-4 border-b border-vision-blue-900/70 pb-5">
          <div className="flex items-center gap-4">
             <div className="w-3 h-3 rounded-full bg-saffron-600 animate-pulse shadow-[0_0_15px_rgba(242,86,7,0.5)]" />
             <span className="text-[11px] font-mono text-vision-blue-200 uppercase tracking-[0.3em] font-black italic">Timed lyric frames</span>
          </div>
          <p className="text-[11px] font-mono text-slate-800 uppercase tracking-widest font-black opacity-30 select-none">Protocol_SR7_SYNC_v6.0</p>
        </div>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-6 lg:px-10 custom-scrollbar space-y-16 py-32 relative scroll-smooth overflow-x-hidden"
          style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)' }}
        >
          {lyrics.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0.05, x: -40 }}
              animate={{ 
                opacity: activeIndex === i ? 1 : (activeIndex - i > 2 || i - activeIndex > 2 ? 0.02 : 0.1),
                scale: activeIndex === i ? 1.15 : 1,
                x: activeIndex === i ? 0 : -40,
                filter: activeIndex === i ? 'blur(0px)' : 'blur(4px)',
                rotateX: activeIndex === i ? 0 : 45
              }}
              transition={{ type: 'spring', stiffness: 80, damping: 20 }}
              className={cn(
                "text-4xl lg:text-6xl font-black transition-all duration-1000 cursor-pointer tracking-tighter leading-tight uppercase italic relative",
                activeIndex === i ? "text-white drop-shadow-[0_0_50px_rgba(37,99,235,0.55)]" : "text-vision-blue-950/80"
              )}
              onClick={() => {
                jumpToLyric(i);
              }}
            >
              <div className="relative inline-block">
                {activeIndex === i && (
                  <motion.div 
                    layoutId="lyric-indicator"
                    className="absolute -left-16 top-1/2 -translate-y-1/2 w-10 h-1.5 bg-saffron-600 rounded-full shadow-[0_0_20px_rgba(242,86,7,0.8)]"
                  />
                )}
                <span className="relative z-10">{line.text}</span>
                 {activeIndex === i && (
                   <motion.div 
                    className="absolute inset-0 bg-saffron-600/10 blur-[40px] rounded-full pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                   />
                 )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
