import React, { useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  Download, 
  RefreshCw, 
  Sun, 
  Contrast, 
  Zap, 
  Trash2, 
  Maximize, 
  Image as ImageIcon,
  Check,
  Wand2,
  Video,
  Loader2,
  Sparkles,
  Play
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { generateImage, videoModel } from '../../services/geminiService';
import { GoogleGenAI } from "@google/genai";

export const ImageEditor: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturate: 100,
    grayscale: 0,
    sepia: 0,
    invert: 0,
    blur: 0
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleGenerateImage = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      const generatedUrl = await generateImage(prompt);
      if (generatedUrl) {
        setImage(generatedUrl);
        setGeneratedVideo(null);
      }
    } catch (error) {
      console.error("Image generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnimateImage = async () => {
    if (!image || isAnimating) return;

    // Check for API key selection for Veo (paid model)
    try {
      if (!(await (window as any).aistudio.hasSelectedApiKey())) {
        await (window as any).aistudio.openSelectKey();
        return; // Wait for user to select and try again
      }
    } catch (e) {
      console.warn("API Key selection helper missing, attempting with environment key");
    }

    setIsAnimating(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const ai = new GoogleGenAI({ apiKey: apiKey! });
      
      // Clean base64 for API
      const base64Data = image.split(',')[1];
      
      let operation = await ai.models.generateVideos({
        model: videoModel,
        prompt: "Animate this image with cinematic motion, subtle camera pan",
        image: {
          imageBytes: base64Data,
          mimeType: 'image/png',
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      // Poll for completion
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(downloadLink, {
          method: 'GET',
          headers: {
            'x-goog-api-key': apiKey!,
          },
        });
        const blob = await response.blob();
        setGeneratedVideo(URL.createObjectURL(blob));
      }
    } catch (error) {
      console.error("Video generation failed:", error);
    } finally {
      setIsAnimating(false);
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setGeneratedVideo(null);
      setFilters({
        brightness: 100,
        contrast: 100,
        saturate: 100,
        grayscale: 0,
        sepia: 0,
        invert: 0,
        blur: 0
      });
    };
    reader.readAsDataURL(file);
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({ 
    onDrop, 
    accept: { 'image/*': [] },
    multiple: false,
    noClick: true // We will handle click manually to have better control
  });

  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'sea-rho7-edit.png';
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  useEffect(() => {
    if (image && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        if (ctx) {
          ctx.filter = `
            brightness(${filters.brightness}%) 
            contrast(${filters.contrast}%) 
            saturate(${filters.saturate}%) 
            grayscale(${filters.grayscale}%) 
            sepia(${filters.sepia}%) 
            invert(${filters.invert}%) 
            blur(${filters.blur}px)
          `;
          ctx.drawImage(img, 0, 0);
        }
        imgRef.current = img;
      };
      img.src = image;
    }
  }, [image, filters]);

  const controlGroups = [
    { name: 'Light Layer Node', icon: Sun, controls: [
      { id: 'brightness', label: 'Luminosity Spectrum', min: 0, max: 200 },
      { id: 'contrast', label: 'Dynamic Pulse Range', min: 0, max: 200 },
    ]},
    { name: 'Chroma Synthesis', icon: Zap, controls: [
      { id: 'saturate', label: 'Vibrancy Intensity', min: 0, max: 200 },
      { id: 'grayscale', label: 'Desaturation Matrix', min: 0, max: 100 },
      { id: 'sepia', label: 'Archetypal Toning', min: 0, max: 100 },
    ]},
    { name: 'Spatial Diffraction', icon: Maximize, controls: [
      { id: 'invert', label: 'Polarity Inversion', min: 0, max: 100 },
      { id: 'blur', label: 'Gaussian Diffusion', min: 0, max: 20 },
    ]}
  ];

  return (
    <div className="space-y-10">
      <input {...getInputProps()} />
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-bold text-white tracking-tight uppercase italic">Neural Imaging Studio</h2>
          <p className="text-slate-500 font-mono text-[10px] mt-1 uppercase tracking-[0.4em] font-black">Visual Processing Control Unit</p>
        </div>
        <div className="flex gap-6">
          <div className="flex items-center gap-4 bg-slate-900/40 p-2 rounded-2xl border border-slate-900 group focus-within:border-saffron-500/50 transition-all">
            <Wand2 className="w-5 h-5 text-slate-500 ml-4 group-focus-within:text-saffron-400" />
            <input 
              type="text" 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="GENERATE_NEW_ASSET..."
              className="bg-transparent border-none focus:ring-0 text-white font-mono text-[10px] w-64 uppercase font-black"
            />
            <button 
              onClick={handleGenerateImage}
              disabled={isGenerating || !prompt.trim()}
              className="px-6 py-2 bg-saffron-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-saffron-500 transition-all disabled:opacity-20 flex items-center gap-2"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isGenerating ? 'SYNTHESIZING' : 'EXECUTE'}
            </button>
          </div>

          <button 
            onClick={open}
            className="px-8 py-3.5 bg-slate-900 border border-slate-800 text-saffron-400 rounded-2xl hover:text-white hover:bg-saffron-600 transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-xl"
          >
            <Upload className="w-5 h-5" /> Import New Source
          </button>

          {image && (
            <button 
              onClick={handleAnimateImage}
              disabled={isAnimating}
              className="px-8 py-3.5 bg-slate-950 border border-slate-800 text-amber-400 rounded-2xl hover:text-white hover:bg-amber-600 transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-xl"
            >
              {isAnimating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Video className="w-5 h-5" />}
              {isAnimating ? 'ANIMATING_MATRIX' : 'ANIMATE_VEO3'}
            </button>
          )}
          
          {image && (
            <>
              <button 
                onClick={downloadImage}
                className="px-10 py-3.5 bg-saffron-600 text-white font-black rounded-2xl hover:bg-saffron-500 flex items-center gap-3 transition-all shadow-[0_15px_40px_rgba(242,86,7,0.3)] hover:-translate-y-1 active:translate-y-0 text-[10px] uppercase tracking-[0.2em]"
              >
                <Download className="w-5 h-5" /> Export Data Stream
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 h-[calc(100vh-18rem)]">
        {/* Editor Area */}
        <div className="lg:col-span-8 bg-slate-900/10 border border-slate-900 rounded-[3rem] overflow-hidden relative group shadow-2xl backdrop-blur-xl">
           <div className="absolute inset-0 technical-grid opacity-5 pointer-events-none" />
          {!image ? (
            <div 
              {...getRootProps()} 
              onClick={open}
              className={cn(
                "h-full flex flex-col items-center justify-center border-2 border-dashed transition-all cursor-pointer rounded-[3rem]",
                isDragActive ? "border-saffron-500 bg-saffron-500/5 shadow-inner" : "border-slate-800/50 hover:border-saffron-500/30 bg-slate-950/20"
              )}
            >
              <motion.div 
                animate={{ y: [0, -15, 0], scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="p-10 bg-slate-950/60 rounded-[2.5rem] border border-slate-900 mb-10 shadow-3xl shadow-saffron-600/10 group-hover:border-saffron-500/40 group-hover:shadow-saffron-600/20 transition-all duration-700"
              >
                <Upload className="w-14 h-14 text-saffron-500" />
              </motion.div>
              <p className="text-xl text-white font-black tracking-tight uppercase italic group-hover:text-saffron-400 transition-colors">Initialize Visual Uplink</p>
              <p className="text-[10px] text-slate-600 mt-3 font-mono uppercase tracking-[0.5em] font-black">Inject source matrix or click to select</p>
            </div>
          ) : (
            <div className="h-full w-full flex items-center justify-center p-16 bg-slate-950/60 relative overflow-hidden group/canvas">
              <div className="absolute inset-0 bg-saffron-600/[0.02] animate-pulse pointer-events-none" />
              
              <div className="relative flex flex-col items-center gap-10">
                <canvas 
                  ref={canvasRef} 
                  className={cn(
                    "max-w-full max-h-full shadow-[0_50px_100px_rgba(0,0,0,0.6)] border border-slate-900 rounded-2xl group-hover/canvas:shadow-saffron-600/20 transition-all duration-1000",
                    generatedVideo ? "scale-75 opacity-50" : "scale-100"
                  )}
                />

                {generatedVideo && (
                  <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <video 
                      ref={(el) => {
                        if (el) {
                          el.play().catch(err => {
                            if (err.name !== 'AbortError') console.warn("Video autoplay failed:", err);
                          });
                        }
                      }}
                      src={generatedVideo} 
                      loop 
                      muted 
                      className="max-w-[120%] max-h-full rounded-2xl shadow-3xl shadow-indigo-600/40 pointer-events-auto border-4 border-indigo-600 ring-8 ring-slate-950/50"
                    />
                    <div className="absolute top-4 right-4 bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[10px] font-mono font-black uppercase tracking-[0.3em] flex items-center gap-2 shadow-xl">
                      <Play className="w-3 h-3 fill-current" /> VEO_3_ACTIVE_STREAM
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="absolute top-8 left-8 flex gap-4">
                <div className="px-5 py-2 rounded-2xl bg-slate-950/80 border border-slate-800 text-[10px] font-mono text-indigo-400 font-black uppercase tracking-[0.3em] backdrop-blur-xl shadow-xl flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                   Processor_v4.1_Stable
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls Sidebar */}
        <div className={cn(
          "lg:col-span-4 flex flex-col gap-10 h-full",
          !image && "opacity-20 pointer-events-none grayscale blur-sm transition-all duration-700"
        )}>
          <div className="bg-slate-900/20 border border-slate-900 shadow-2xl p-10 rounded-[3rem] space-y-10 flex-1 overflow-y-auto custom-scrollbar backdrop-blur-xl shadow-inner">
            {controlGroups.map((group) => (
              <div key={group.name} className="space-y-8">
                <div className="flex items-center gap-4 text-slate-500 mb-2 border-b border-slate-900 pb-6">
                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 shadow-lg">
                    <group.icon className="w-5 h-5 text-indigo-500" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.4em] font-black italic">{group.name}</span>
                </div>
                <div className="space-y-10">
                  {group.controls.map((control) => (
                    <div key={control.id} className="space-y-4">
                      <div className="flex justify-between items-center text-[10px] font-mono uppercase font-black tracking-widest px-1">
                        <span className="text-slate-600">{control.label}</span>
                        <span className="text-white bg-slate-950/80 px-3 py-1 rounded-lg border border-slate-900 shadow-lg font-black italic">{(filters as any)[control.id]}</span>
                      </div>
                      <div className="relative group/slider pt-2">
                        <input 
                          type="range"
                          min={control.min}
                          max={control.max}
                          value={(filters as any)[control.id]}
                          onChange={(e) => setFilters({ ...filters, [control.id]: parseInt(e.target.value) })}
                          className="w-full accent-indigo-600 appearance-none h-1.5 bg-slate-950 rounded-full cursor-pointer hover:bg-slate-800 transition-all shadow-inner"
                        />
                        <div className="absolute -inset-2 bg-indigo-500/5 rounded-full opacity-0 group-hover/slider:opacity-100 transition-opacity pointer-events-none" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            <button 
              onClick={() => {
                setFilters({
                  brightness: 100,
                  contrast: 100,
                  saturate: 100,
                  grayscale: 0,
                  sepia: 0,
                  invert: 0,
                  blur: 0
                });
              }}
              className="w-full py-5 rounded-[2rem] border border-slate-800 text-[10px] font-mono text-slate-600 uppercase tracking-[0.5em] font-black hover:bg-slate-950 hover:text-white hover:border-slate-700 transition-all flex items-center justify-center gap-4 mt-8 bg-slate-950/20 shadow-xl"
            >
              <RefreshCw className="w-4 h-4" /> Reset Parameter Stream
            </button>
          </div>

          <div className="p-10 bg-indigo-600/[0.03] border border-indigo-500/20 rounded-[2.5rem] backdrop-blur-xl shadow-2xl relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="flex items-center gap-6 relative z-10">
               <div className="p-4 bg-slate-950 rounded-[1.5rem] border border-indigo-500/30 shadow-2xl group-hover:shadow-indigo-600/30 transition-shadow duration-500">
                 <ImageIcon className="w-8 h-8 text-indigo-400" />
               </div>
               <div>
                 <p className="text-[10px] font-mono text-slate-600 font-black tracking-[0.4em] uppercase mb-1">Processing Status</p>
                 <p className="text-base font-black text-white uppercase tracking-tighter italic">Source Stream Node Active</p>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
