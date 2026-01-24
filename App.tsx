
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type } from '@google/genai';
import SettingsPanel from './components/SettingsPanel';
import Dashboard from './components/Dashboard';
import { PersonalityType, DMonState, ActiveAlert, Language } from './types';
import { PERSONALITY_PROMPTS, TRANSLATIONS } from './constants';
import { createPcmBlob, decodeAudio, decodeAudioData } from './services/audioProcessing';

// Variables fuera del componente para persistencia entre re-renders durante la sesión activa
let inputAudioContext: AudioContext | null = null;
let outputAudioContext: AudioContext | null = null;
let nextStartTime = 0;
const sources = new Set<AudioBufferSourceNode>();

const App: React.FC = () => {
  const [state, setState] = useState<DMonState>({
    isConnected: false,
    isStreamingScreen: false,
    isStreamingWebcam: false,
    isMuted: false,
    userName: localStorage.getItem('dmon_user_name') || '',
    aiName: localStorage.getItem('dmon_ai_name') || 'D-mon',
    language: (localStorage.getItem('dmon_lang') as Language) || 'es',
    personality: PersonalityType.FRIENDLY,
    customPrompt: '',
    voice: 'Kore',
    currentTask: '',
    facingMode: 'user'
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [transcriptions, setTranscriptions] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('dmon_neural_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [activeAlerts, setActiveAlerts] = useState<ActiveAlert[]>([]);
  const [volume, setVolume] = useState(0);
  const [userVolume, setUserVolume] = useState(0);
  
  const aiTextRef = useRef('');
  const userTextRef = useRef('');
  const lastActivityTimeRef = useRef<number>(Date.now());
  const proactiveThresholdRef = useRef<number>(25000 + Math.random() * 15000);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const userAnalyserRef = useRef<AnalyserNode | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameIntervalRef = useRef<number | null>(null);
  
  // Cola de promesas para asegurar que el procesamiento de audio sea secuencial y sin solapamientos
  const audioQueueRef = useRef<Promise<void>>(Promise.resolve());
  const isMutedRef = useRef(state.isMuted);

  useEffect(() => {
    isMutedRef.current = state.isMuted;
  }, [state.isMuted]);

  useEffect(() => {
    if (videoRef.current && streamRef.current && (state.isStreamingScreen || state.isStreamingWebcam)) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(err => console.error("Video play failed:", err));
      }
    }
  }, [state.isStreamingScreen, state.isStreamingWebcam]);

  useEffect(() => {
    localStorage.setItem('dmon_user_name', state.userName);
    localStorage.setItem('dmon_ai_name', state.aiName);
    localStorage.setItem('dmon_lang', state.language);
  }, [state.userName, state.aiName, state.language]);

  useEffect(() => {
    localStorage.setItem('dmon_neural_history', JSON.stringify(transcriptions));
  }, [transcriptions]);

  useEffect(() => {
    const t = TRANSLATIONS[state.language];
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setState(s => ({ ...s, location: { lat: pos.coords.latitude, lng: pos.coords.longitude } })),
        () => addTranscription(t.system as any, t.locationError),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    }
  }, [state.language]);

  useEffect(() => {
    if (!state.isConnected) { setVolume(0); setUserVolume(0); return; }
    let animationFrame: number;
    const aiData = new Uint8Array(analyserRef.current?.frequencyBinCount || 0);
    const userData = new Uint8Array(userAnalyserRef.current?.frequencyBinCount || 0);
    const updateVolumes = () => {
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(aiData);
        let sum = 0; for (let i = 0; i < aiData.length; i++) sum += aiData[i];
        setVolume(Math.min(1, (sum / aiData.length) / 60));
      }
      if (userAnalyserRef.current && !state.isMuted) {
        userAnalyserRef.current.getByteFrequencyData(userData);
        let sum = 0; for (let i = 0; i < userData.length; i++) sum += userData[i];
        setUserVolume(Math.min(1, (sum / userData.length) / 60));
      } else { setUserVolume(0); }
      animationFrame = requestAnimationFrame(updateVolumes);
    };
    updateVolumes();
    return () => cancelAnimationFrame(animationFrame);
  }, [state.isConnected, state.isMuted]);

  useEffect(() => {
    if (!state.isConnected) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const quietTime = now - lastActivityTimeRef.current;
      const audioIsPlaying = outputAudioContext && nextStartTime > outputAudioContext.currentTime;
      
      if (!audioIsPlaying && quietTime > proactiveThresholdRef.current) {
        lastActivityTimeRef.current = now;
        proactiveThresholdRef.current = 20000 + Math.random() * 20000;
        if (sessionRef.current) {
          const nudgeMsg = state.language === 'es' ? "[SISTEMA: Silencio prolongado. Di algo breve según tu personalidad.]" : "[SYSTEM: Prolonged silence. Say something brief based on your personality.]";
          sessionRef.current.sendRealtimeInput({ text: nudgeMsg });
        }
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [state.isConnected, state.language]);

  const addTranscription = (sender: string, text: string) => {
    const t = TRANSLATIONS[state.language];
    const formatted = sender === t.system || sender === t.action ? `[${sender.toUpperCase()}] ${text}` : `${sender}: ${text}`;
    setTranscriptions(prev => [...prev.slice(-99), formatted]);
  };

  const clearMemory = () => {
    const t = TRANSLATIONS[state.language];
    setTranscriptions([]);
    localStorage.removeItem('dmon_neural_history');
    setTimeout(() => {
       addTranscription(t.system, state.language === 'es' ? "NÚCLEO DE MEMORIA FORMATEADO. REINICIO COMPLETADO." : "MEMORY CORE FORMATTED. RESET COMPLETE.");
    }, 50);
    if (state.isConnected && sessionRef.current) {
      sessionRef.current.sendRealtimeInput({ text: "[SYSTEM: User cleared your memory. Forget everything.]" });
    }
  };

  const handleConnect = async () => {
    const t = TRANSLATIONS[state.language];
    if (state.isConnected) {
      if (sessionRef.current) sessionRef.current.close();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setState(prev => ({ ...prev, isConnected: false, isStreamingScreen: false, isStreamingWebcam: false }));
      addTranscription(t.system, "Neural Link Offline.");
      nextStartTime = 0;
      audioQueueRef.current = Promise.resolve();
      return;
    }
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      inputAudioContext = new AudioContext({ sampleRate: 16000 });
      outputAudioContext = new AudioContext({ sampleRate: 24000 });
      const analyser = outputAudioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.connect(outputAudioContext.destination);
      analyserRef.current = analyser;
      
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const userAnalyser = inputAudioContext.createAnalyser();
      userAnalyser.fftSize = 256;
      inputAudioContext.createMediaStreamSource(micStream).connect(userAnalyser);
      userAnalyserRef.current = userAnalyser;
      
      const persona = state.personality === PersonalityType.CUSTOM ? state.customPrompt : PERSONALITY_PROMPTS[state.personality];
      const historyCtx = transcriptions.length > 0 ? `HISTORY:\n${transcriptions.slice(-15).join('\n')}\n` : "";
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          thinkingConfig: { thinkingBudget: 0 },
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: state.voice as any } } },
          systemInstruction: `Identity: ${state.aiName}. User: ${state.userName}. ${historyCtx} Tone: ${persona}. 
          REAL-TIME MODE: Respond immediately. Be extremely concise. Use short sentences. 
          Priority is LOW LATENCY and SMOOTHNESS. Do not use monologues. Avoid empty filler words.`,
          tools: [{ functionDeclarations: [{ name: 'set_timer', parameters: { type: Type.OBJECT, properties: { seconds: { type: Type.NUMBER }, label: { type: Type.STRING } }, required: ['seconds', 'label'] } }] }, { googleSearch: {} }],
          outputAudioTranscription: {},
          inputAudioTranscription: {}
        },
        callbacks: {
          onopen: () => {
            setState(prev => ({ ...prev, isConnected: true }));
            addTranscription(t.system, "Neural Link Established.");
            lastActivityTimeRef.current = Date.now();
            
            const processor = inputAudioContext!.createScriptProcessor(4096, 1, 1);
            inputAudioContext!.createMediaStreamSource(micStream).connect(processor);
            
            processor.onaudioprocess = (e) => {
              if (!isMutedRef.current) {
                const inputData = e.inputBuffer.getChannelData(0);
                let hasSpeech = false;
                // Threshold ligeramente más alto (0.06) para evitar ruidos de fondo que activen el trigger de interrupción
                for(let i=0; i<inputData.length; i++) if(Math.abs(inputData[i]) > 0.06) { hasSpeech = true; break; }
                if (hasSpeech) lastActivityTimeRef.current = Date.now();

                sessionPromise.then(s => s.sendRealtimeInput({ 
                  media: { 
                    data: createPcmBlob(inputData), 
                    mimeType: 'audio/pcm;rate=16000' 
                  } 
                }));
              }
            };
            processor.connect(inputAudioContext!.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            lastActivityTimeRef.current = Date.now();

            if (msg.serverContent?.outputTranscription) aiTextRef.current += msg.serverContent.outputTranscription.text;
            if (msg.serverContent?.inputTranscription) {
               userTextRef.current += msg.serverContent.inputTranscription.text;
               lastActivityTimeRef.current = Date.now();
            }
            
            if (msg.serverContent?.turnComplete) {
              if (userTextRef.current) { addTranscription(t.user, userTextRef.current); userTextRef.current = ''; }
              if (aiTextRef.current) { addTranscription(state.aiName, aiTextRef.current); aiTextRef.current = ''; }
              lastActivityTimeRef.current = Date.now();
            }

            const audio = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audio && outputAudioContext && analyserRef.current) {
              const audioData = decodeAudio(audio);
              
              audioQueueRef.current = audioQueueRef.current.then(async () => {
                // Reanudar contexto de audio si el navegador lo suspendió
                if (outputAudioContext!.state === 'suspended') await outputAudioContext!.resume();
                
                const buffer = await decodeAudioData(audioData, outputAudioContext!, 24000, 1);
                const source = outputAudioContext!.createBufferSource();
                source.buffer = buffer;
                source.connect(analyserRef.current!);
                
                const now = outputAudioContext!.currentTime;
                // Sincronización robusta: si el tiempo planeado ya pasó, resetear al presente
                if (nextStartTime < now) {
                  nextStartTime = now + 0.05; // Pequeño buffer para estabilidad
                }
                
                source.start(nextStartTime);
                nextStartTime += buffer.duration;
                sources.add(source);
                source.onended = () => sources.delete(source);
                
                lastActivityTimeRef.current = Date.now();
              });
            }

            if (msg.serverContent?.interrupted) {
              // Limpieza inmediata en caso de interrupción del usuario
              sources.forEach(s => { try{s.stop()}catch(e){} });
              sources.clear();
              nextStartTime = 0;
              audioQueueRef.current = Promise.resolve();
              lastActivityTimeRef.current = Date.now();
            }
          },
          onerror: () => addTranscription(t.system, "Link Error."),
          onclose: () => setState(prev => ({ ...prev, isConnected: false }))
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (e) { addTranscription(t.system, "Init Error."); }
  };

  const handleSwitchCamera = async () => {
    const newMode = state.facingMode === 'user' ? 'environment' : 'user';
    setState(s => ({ ...s, facingMode: newMode }));
    if (state.isStreamingWebcam) await startVisualStream('camera', true, newMode);
  };

  const startVisualStream = async (type: 'screen' | 'camera', force: boolean = false, overrideMode?: any) => {
    if (!state.isConnected) return;
    if (!force && ((type === 'screen' && state.isStreamingScreen) || (type === 'camera' && state.isStreamingWebcam))) {
      if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      setState(p => ({ ...p, isStreamingScreen: false, isStreamingWebcam: false }));
      return;
    }
    try {
      if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      
      const stream = type === 'screen' 
        ? await navigator.mediaDevices.getDisplayMedia({ video: true }) 
        : await navigator.mediaDevices.getUserMedia({ video: { facingMode: overrideMode || state.facingMode } });
      
      streamRef.current = stream;
      
      stream.getVideoTracks()[0].onended = () => {
        if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
        setState(p => ({ ...p, isStreamingScreen: false, isStreamingWebcam: false }));
        streamRef.current = null;
      };

      setState(p => ({ ...p, isStreamingScreen: type === 'screen', isStreamingWebcam: type === 'camera' }));

      frameIntervalRef.current = window.setInterval(() => {
        if (!canvasRef.current || !videoRef.current || !sessionRef.current || videoRef.current.readyState < 2) return;
        const ctx = canvasRef.current.getContext('2d');
        canvasRef.current.width = 640; canvasRef.current.height = 360;
        ctx?.drawImage(videoRef.current, 0, 0, 640, 360);
        canvasRef.current.toBlob(b => {
          if (b && sessionRef.current) {
            const r = new FileReader();
            r.onloadend = () => sessionRef.current.sendRealtimeInput({ media: { data: (r.result as string).split(',')[1], mimeType: 'image/jpeg' } });
            r.readAsDataURL(b);
          }
        }, 'image/jpeg', 0.5);
      }, 1500);
    } catch (e) {
      console.error("Stream initialization failed:", e);
      setState(p => ({ ...p, isStreamingScreen: false, isStreamingWebcam: false }));
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#0a0a0c] text-white overflow-hidden">
      <SettingsPanel 
        {...state} 
        onUserNameChange={v => setState(s => ({...s, userName: v}))}
        onAiNameChange={v => setState(s => ({...s, aiName: v}))}
        onLanguageToggle={() => setState(s => ({...s, language: s.language === 'es' ? 'en' : 'es'}))}
        onPersonalityChange={p => setState(s => ({...s, personality: p}))}
        onCustomPromptChange={v => setState(s => ({...s, customPrompt: v}))}
        onVoiceChange={v => setState(s => ({...s, voice: v}))}
        isOpen={isSettingsOpen}
        onToggleOpen={() => setIsSettingsOpen(!isSettingsOpen)}
        memorySize={JSON.stringify(transcriptions).length}
        onClearMemory={clearMemory}
      />
      <Dashboard 
        state={state} volume={volume} userVolume={userVolume} activeAlerts={activeAlerts}
        onToggleScreen={() => startVisualStream('screen')}
        onToggleWebcam={() => startVisualStream('camera')}
        onSwitchCamera={handleSwitchCamera}
        onToggleMute={() => setState(s => ({...s, isMuted: !s.isMuted}))}
        onConnect={handleConnect}
        videoRef={videoRef} canvasRef={canvasRef} transcriptions={transcriptions}
      />
    </div>
  );
};

export default App;
