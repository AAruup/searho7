import { GoogleGenAI, Modality, Type } from "@google/genai";

export const geminiModel = "gemini-3.1-pro-preview";
export const flashModel = "gemini-3.1-flash-lite";
export const ttsModel = "gemini-3.1-flash-tts-preview";
export const imageModel = "gemini-3.1-flash-image-preview";
export const musicModel = "lyria-3-clip-preview";
export const videoModel = "veo-3.1-lite-generate-preview";

const GEMINI_API_KEY_STORAGE = 'sea.rho7.geminiApiKey';

export const getStoredGeminiApiKey = () => {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(GEMINI_API_KEY_STORAGE) || '';
};

export const setStoredGeminiApiKey = (apiKey: string) => {
  if (typeof window === 'undefined') return;
  const cleanKey = apiKey.trim();
  if (cleanKey) {
    window.localStorage.setItem(GEMINI_API_KEY_STORAGE, cleanKey);
  } else {
    window.localStorage.removeItem(GEMINI_API_KEY_STORAGE);
  }
};

export const resolveGeminiApiKey = () => {
  const storedKey = getStoredGeminiApiKey();
  const viteKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.GEMINI_API_KEY || '';
  const processKey = typeof process !== 'undefined'
    ? process.env.GEMINI_API_KEY || process.env.API_KEY || ''
    : '';

  return storedKey || viteKey || processKey;
};

export const hasGeminiApiKey = () => {
  const apiKey = resolveGeminiApiKey();
  return Boolean(apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey !== "undefined");
};

const getAI = () => {
  const apiKey = resolveGeminiApiKey();
  
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "undefined") {
    const errorMsg = "GEMINI_API_KEY_INVALID: Add a Gemini API key in SEA.RHO7 Settings to enable live AI.";
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  return new GoogleGenAI({ apiKey });
};

export const generateText = async (prompt: string, model: string = flashModel, useSearch: boolean = false) => {
  const ai = getAI();
  const config: any = {};
  if (useSearch) {
    config.tools = [{ googleSearch: {} }];
  }

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config
  });

  return {
    text: response.text || '',
    grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks
  };
};

export const testGeminiApiKey = async (apiKey: string) => {
  const cleanKey = apiKey.trim();
  if (!cleanKey) throw new Error('Paste a Gemini API key first.');

  const ai = new GoogleGenAI({ apiKey: cleanKey });
  const response = await ai.models.generateContent({
    model: flashModel,
    contents: 'Reply with exactly: SEA.RHO7 LIVE',
  });

  const text = response.text || '';
  if (!text.toLowerCase().includes('sea.rho7')) {
    throw new Error('Gemini responded, but not in the expected format.');
  }

  return text;
};

export const generateTextStream = async (prompt: string, model: string = flashModel, useSearch: boolean = false) => {
  const ai = getAI();
  const config: any = {};
  if (useSearch) {
    config.tools = [{ googleSearch: {} }];
  }

  return await ai.models.generateContentStream({
    model,
    contents: prompt,
    config
  });
};

export const generateSpeech = async (text: string, voice: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr' = 'Kore') => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: ttsModel,
    contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voice },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (base64Audio) {
    return `data:audio/pcm;base64,${base64Audio}`;
  }
  return null;
};

export const generateImage = async (prompt: string, aspectRatio: "1:1" | "16:9" | "9:16" = "1:1") => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: imageModel,
    contents: [{ text: prompt }],
    config: {
      imageConfig: {
        aspectRatio,
        imageSize: "1K"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

export const generateMusic = async (prompt: string, model: string = musicModel) => {
  const ai = getAI();
  const response = await ai.models.generateContentStream({
    model,
    contents: prompt,
    config: {
      responseModalities: [Modality.AUDIO],
    },
  });

  let audioBase64 = "";
  let lyrics = "";
  let mimeType = "audio/wav";

  for await (const chunk of response) {
    const parts = chunk.candidates?.[0]?.content?.parts;
    if (!parts) continue;
    for (const part of parts) {
      if (part.inlineData?.data) {
        if (!audioBase64 && part.inlineData.mimeType) {
          mimeType = part.inlineData.mimeType;
        }
        audioBase64 += part.inlineData.data;
      }
      if (part.text && !lyrics) {
        lyrics = part.text;
      }
    }
  }

  if (!audioBase64) return null;

  const binary = atob(audioBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: mimeType });
  return {
    url: URL.createObjectURL(blob),
    lyrics
  };
};

export const createChat = (systemInstruction?: string) => {
  const ai = getAI();
  return ai.chats.create({
    model: geminiModel,
    config: {
      systemInstruction,
    },
  });
};

export const summarizeContent = async (text: string) => {
  const prompt = `Please summarize the following content objectively and concisely:\n\n${text}`;
  const res = await generateText(prompt, flashModel);
  return res.text;
};
