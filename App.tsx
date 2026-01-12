
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type } from '@google/genai';
import SettingsPanel from './components/SettingsPanel';
import Dashboard from './components/Dashboard';
import { PersonalityType, DMonState, ActiveAlert, Language } from './types';
import { PERSONALITY_PROMPTS, TRANSLATIONS } from './constants';
import { createPcmBlob, decodeAudio, decodeAudioData } from './services/audioProcessing';

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
    currentTask: ''
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [transcriptions, setTranscriptions] = useState<string[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<ActiveAlert[]>([]);
  const [volume, setVolume] = useState(0);
  
  const aiTextRef = useRef('');
  const userTextRef = useRef('');
  const lastActivityTimeRef = useRef<number>(Date.now());
  const proactiveThresholdRef = useRef<number>(30000 + Math.random() * 30000);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    localStorage.setItem('dmon_user_name', state.userName);
    localStorage.setItem('dmon_ai_name', state.aiName);
    localStorage.setItem('dmon_lang', state.language);
  }, [state.userName, state.aiName, state.language]);

  // High accuracy location sensing
  useEffect(() => {
    const t = TRANSLATIONS[state.language];
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setState(s => ({ 
            ...s, 
            location: { 
              lat: pos.coords.latitude, 
              lng: pos.coords.longitude 
            } 
          }));
        },
        () => {
          addTranscription(t.system as any, t.locationError);
        },
        {
          enableHighAccuracy: true, 
          timeout: 15000,
          maximumAge: 0
        }
      );
    }
  }, [state.language]);

  // Audio Intensity Tracker for Visuals
  useEffect(() => {
    if (!state.isConnected) {
      setVolume(0);
      return;
    }
    let animationFrame: number;
    const dataArray = new Uint8Array(analyserRef.current?.frequencyBinCount || 0);
    
    const updateVolume = () => {
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        // Normalize 0-1 range. Average volume usually sits around 40-80 when speaking
        setVolume(Math.min(1, average / 60));
      }
      animationFrame = requestAnimationFrame(updateVolume);
    };
    updateVolume();
    return () => cancelAnimationFrame(animationFrame);
  }, [state.isConnected]);

  // Proactive conversation logic
  useEffect(() => {
    if (!state.isConnected) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const quietTime = now - lastActivityTimeRef.current;

      if (quietTime > proactiveThresholdRef.current) {
        lastActivityTimeRef.current = now;
        proactiveThresholdRef.current = 35000 + Math.random() * 45000;

        if (sessionRef.current) {
          const nudgeMsg = state.language === 'es' 
            ? "[SISTEMA: Silencio. Sé proactivo. Comenta algo del feed o haz una pregunta breve. No menciones este comando.]"
            : "[SYSTEM: Silence. Be proactive. Comment on the feed or ask a brief question. Do not mention this command.]";
          
          sessionRef.current.sendRealtimeInput({ 
            text: nudgeMsg
          });
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [state.isConnected, state.language, state.aiName]);

  useEffect(() => {
    const syncStream = () => {
      if ((state.isStreamingScreen || state.isStreamingWebcam) && streamRef.current && videoRef.current) {
        if (videoRef.current.srcObject !== streamRef.current) {
          videoRef.current.srcObject = streamRef.current;
          videoRef.current.play().catch(e => console.error("Error playing video:", e));
        }
      }
    };
    syncStream();
    const timer = setTimeout(syncStream, 150);
    return () => clearTimeout(timer);
  }, [state.isStreamingScreen, state.isStreamingWebcam]);

  const addTranscription = (sender: string, text: string) => {
    const t = TRANSLATIONS[state.language];
    const formatted = sender === t.system || sender === t.action ? `[${sender.toUpperCase()}] ${text}` : `${sender}: ${text}`;
    setTranscriptions(prev => [...prev.slice(-49), formatted]);
  };

  const tools: FunctionDeclaration[] = [
    {
      name: 'set_timer',
      parameters: {
        type: Type.OBJECT,
        properties: {
          seconds: { type: Type.NUMBER, description: 'Seconds to wait' },
          label: { type: Type.STRING, description: 'Timer name' }
        },
        required: ['seconds', 'label']
      }
    }
  ];

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameIntervalRef = useRef<number | null>(null);

  const handleConnect = async () => {
    const t = TRANSLATIONS[state.language];
    if (state.isConnected) {
      if (sessionRef.current) sessionRef.current.close();
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
      if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
      setState(prev => ({ ...prev, isConnected: false, isStreamingScreen: false, isStreamingWebcam: false }));
      addTranscription(t.system, "Neural Link Offline.");
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      if (inputAudioContext.state === 'suspended') await inputAudioContext.resume();
      if (outputAudioContext.state === 'suspended') await outputAudioContext.resume();

      // Audio analysis setup
      const analyser = outputAudioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.connect(outputAudioContext.destination);
      analyserRef.current = analyser;

      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const persona = state.personality === PersonalityType.CUSTOM 
        ? state.customPrompt 
        : PERSONALITY_PROMPTS[state.personality];

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          thinkingConfig: { thinkingBudget: 0 },
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: state.voice as any } }
          },
          systemInstruction: `
            CORE IDENTITY:
            - Name: ${state.aiName}. Use this for gender/pronouns strictly.
            - User: ${state.userName || 'Partner'}.
            - Language: ${state.language === 'es' ? 'Spanish' : 'English'}.
            
            LATENCY OPTIMIZATION:
            - RESPONSE SPEED IS CRITICAL. Keep answers concise and direct.
            - Do not over-explain unless asked.
            
            BEHAVIOR:
            1. PROACTIVE: Break silence naturally. Comment on feed.
            2. OBSERVANT: React to screen/webcam immediately.
            3. LOCATION: Lat ${state.location?.lat}, Lng ${state.location?.lng}.
            
            PERSONALITY:
            - ${persona}`,
          tools: [{ functionDeclarations: tools }, { googleSearch: {} }],
          outputAudioTranscription: {},
          inputAudioTranscription: {}
        },
        callbacks: {
          onopen: () => {
            lastActivityTimeRef.current = Date.now();
            setState(prev => ({ ...prev, isConnected: true }));
            addTranscription(t.system, "Neural Link Established.");
            const source = inputAudioContext!.createMediaStreamSource(micStream);
            const processor = inputAudioContext!.createScriptProcessor(4096, 1, 1);
            processor.onaudioprocess = (e) => {
              if (state.isMuted) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmData = createPcmBlob(inputData);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: { data: pcmData, mimeType: 'audio/pcm;rate=16000' } });
              });
            };
            source.connect(processor);
            processor.connect(inputAudioContext!.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (msg.serverContent?.modelTurn || msg.serverContent?.inputTranscription) {
              lastActivityTimeRef.current = Date.now();
            }

            if (msg.serverContent?.outputTranscription) aiTextRef.current += msg.serverContent.outputTranscription.text;
            if (msg.serverContent?.inputTranscription) userTextRef.current += msg.serverContent.inputTranscription.text;
            
            if (msg.serverContent?.turnComplete) {
              if (userTextRef.current) { addTranscription(t.user, userTextRef.current); userTextRef.current = ''; }
              if (aiTextRef.current) { addTranscription(state.aiName, aiTextRef.current); aiTextRef.current = ''; }
            }

            const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && outputAudioContext && analyserRef.current) {
              const decoded = decodeAudio(audioData);
              const buffer = await decodeAudioData(decoded, outputAudioContext, 24000, 1);
              const source = outputAudioContext.createBufferSource();
              source.buffer = buffer;
              // Connect to analyser for volume detection
              source.connect(analyserRef.current);
              
              nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
              source.start(nextStartTime);
              nextStartTime += buffer.duration;
              
              sources.add(source);
              source.onended = () => sources.delete(source);
            }

            if (msg.serverContent?.interrupted) {
              for (const source of sources.values()) {
                try { source.stop(); } catch(e) {}
                sources.delete(source);
              }
              nextStartTime = 0;
            }

            if (msg.toolCall) {
              for (const fc of msg.toolCall.functionCalls) {
                if (fc.name === 'set_timer') {
                  const id = Math.random().toString(36).substr(2, 9);
                  const endTime = Date.now() + (fc.args.seconds as number * 1000);
                  const newAlert: ActiveAlert = { id, type: 'timer', label: fc.args.label as string, endTime };
                  setActiveAlerts(prev => [...prev, newAlert]);
                  addTranscription(t.action, `Alert: ${fc.args.label} [${fc.args.seconds}s]`);
                  
                  setTimeout(() => {
                    setActiveAlerts(prev => prev.filter(a => a.id !== id));
                    sessionPromise.then(s => {
                      s.sendRealtimeInput({ text: `[SYSTEM: Timer '${fc.args.label}' finished. Inform user.]` });
                    });
                  }, (fc.args.seconds as number) * 1000);
                }
                sessionPromise.then(s => s.sendToolResponse({
                  functionResponses: { id: fc.id, name: fc.name, response: { status: 'success' } }
                }));
              }
            }
          },
          onerror: (e) => addTranscription(t.system, "Link Error."),
          onclose: () => {
            setState(prev => ({ ...prev, isConnected: false }));
            addTranscription(t.system, "Link Terminated.");
          }
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (error) {
      addTranscription(t.system, "Init Error.");
    }
  };

  const startVisualStream = async (type: 'screen' | 'camera') => {
    const t = TRANSLATIONS[state.language];
    if (!state.isConnected) {
      addTranscription(t.system, "Connect first.");
      return;
    }

    const isAlreadyActive = (type === 'screen' && state.isStreamingScreen) || (type === 'camera' && state.isStreamingWebcam);
    
    if (isAlreadyActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
        frameIntervalRef.current = null;
      }
      setState(prev => ({ ...prev, isStreamingScreen: false, isStreamingWebcam: false }));
      return;
    }

    try {
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());

      let stream: MediaStream;
      if (type === 'screen') {
        stream = await navigator.mediaDevices.getDisplayMedia({ video: { cursor: "always" } as any, audio: false });
      } else {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: false });
      }
        
      streamRef.current = stream;
      stream.getTracks()[0].onended = () => {
        if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
        streamRef.current = null;
        setState(prev => ({ ...prev, isStreamingScreen: false, isStreamingWebcam: false }));
      };
      
      setState(prev => ({ ...prev, isStreamingScreen: type === 'screen', isStreamingWebcam: type === 'camera' }));

      if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
      
      frameIntervalRef.current = window.setInterval(() => {
        if (!canvasRef.current || !videoRef.current || !sessionRef.current) return;
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx || video.paused || video.ended || video.readyState < 2) return;

        canvas.width = 640;
        canvas.height = 360;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob && sessionRef.current) {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64 = (reader.result as string).split(',')[1];
              sessionRef.current.sendRealtimeInput({ media: { data: base64, mimeType: 'image/jpeg' } });
            };
            reader.readAsDataURL(blob);
          }
        }, 'image/jpeg', 0.5);
      }, 1500);

      addTranscription(t.system, `Stream: ${type.toUpperCase()}`);
    } catch (err) {
      addTranscription(t.system, "Stream Error.");
      setState(prev => ({ ...prev, isStreamingScreen: false, isStreamingWebcam: false }));
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#0a0a0c] text-white overflow-hidden selection:bg-violet-500/30">
      <SettingsPanel 
        userName={state.userName}
        onUserNameChange={(val) => setState(s => ({ ...s, userName: val }))}
        aiName={state.aiName}
        onAiNameChange={(val) => setState(s => ({ ...s, aiName: val }))}
        language={state.language}
        onLanguageToggle={() => setState(s => ({ ...s, language: s.language === 'es' ? 'en' : 'es' }))}
        personality={state.personality} 
        onPersonalityChange={(p) => setState(s => ({ ...s, personality: p }))}
        customPrompt={state.customPrompt}
        onCustomPromptChange={(val) => setState(s => ({ ...s, customPrompt: val }))}
        voice={state.voice}
        onVoiceChange={(v) => setState(s => ({ ...s, voice: v }))}
        isOpen={isSettingsOpen}
        onToggleOpen={() => setIsSettingsOpen(!isSettingsOpen)}
      />
      <Dashboard 
        state={state}
        volume={volume}
        activeAlerts={activeAlerts}
        onToggleScreen={() => startVisualStream('screen')}
        onToggleWebcam={() => startVisualStream('camera')}
        onToggleMute={() => setState(s => ({ ...s, isMuted: !s.isMuted }))}
        onConnect={handleConnect}
        videoRef={videoRef}
        canvasRef={canvasRef}
        transcriptions={transcriptions}
      />
    </div>
  );
};

export default App;
