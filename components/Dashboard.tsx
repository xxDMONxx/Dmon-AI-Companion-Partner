
import React, { useRef } from 'react';
import { DMonState, ActiveAlert } from '../types';
import { TRANSLATIONS } from '../constants';
import Visualizer from './Visualizer';

interface DashboardProps {
  state: DMonState;
  volume: number;
  onToggleScreen: () => void;
  onToggleWebcam: () => void;
  onToggleMute: () => void;
  onConnect: () => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  transcriptions: string[];
  activeAlerts: ActiveAlert[];
}

const Dashboard: React.FC<DashboardProps> = ({ 
  state, 
  volume,
  onToggleScreen, 
  onToggleWebcam, 
  onToggleMute,
  onConnect,
  videoRef,
  canvasRef,
  transcriptions,
  activeAlerts
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[state.language];

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcriptions]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0d0d0f] relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(rgba(139,92,246,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.2) 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
      </div>

      {/* Active Alerts Overlay */}
      {activeAlerts.length > 0 && (
        <div className="absolute top-20 md:top-6 left-6 z-20 flex flex-col gap-2">
          {activeAlerts.map(alert => (
            <div key={alert.id} className="bg-violet-950/80 border border-violet-500/50 rounded-lg px-4 py-2 flex items-center gap-3 animate-pulse shadow-lg">
               <div className="w-2 h-2 rounded-full bg-red-500"></div>
               <span className="text-[10px] md:text-xs font-orbitron text-white uppercase tracking-tighter">
                 {alert.type}: {alert.label} 
                 <span className="ml-2 opacity-50">[{new Date(alert.endTime).toLocaleTimeString()}]</span>
               </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 z-10 gap-6 md:gap-10 overflow-y-auto custom-scrollbar">
        {/* Visualizer and Title Area */}
        <div className="flex flex-col items-center justify-center min-h-[300px] md:min-h-[400px]">
          <Visualizer isActive={state.isConnected} volume={volume} />
          <div className="text-center mt-2 relative z-20">
            <h1 className="font-orbitron text-3xl md:text-4xl font-bold tracking-tighter text-white drop-shadow-2xl">
              {state.aiName?.toUpperCase() || 'D-MON'} <span className="text-violet-500">AI</span>
            </h1>
            <p className="text-white/40 text-[9px] md:text-xs font-light mt-1 md:mt-2 tracking-[0.2em] md:tracking-[0.3em] uppercase">
              {state.personality} 
              {state.userName ? ` / LINK: ${state.userName.toUpperCase()}` : ''}
              {state.location ? ` / LOC: ACTIVA` : ''}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full max-w-5xl md:h-[35vh]">
          {/* Visual Feed */}
          <div className="bg-black/40 border border-violet-900/30 rounded-2xl overflow-hidden relative group aspect-video md:aspect-auto">
            {!state.isStreamingScreen && !state.isStreamingWebcam ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20">
                 <svg className="w-10 h-10 md:w-12 md:h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                 <span className="text-[10px] uppercase tracking-widest font-bold">{t.feedOffline}</span>
              </div>
            ) : (
              <>
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 bg-red-500 w-2 h-2 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 scanning-line pointer-events-none opacity-20"></div>
                <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded-full border border-white/10 text-[9px] md:text-[10px] text-white/80 font-bold uppercase">
                   {t.opticStreamActive}
                </div>
              </>
            )}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>

          {/* Chat Section */}
          <div className="bg-black/40 border border-violet-900/30 rounded-2xl p-4 md:p-6 flex flex-col font-mono text-xs overflow-hidden h-[25vh] md:h-auto">
            <div className="flex items-center gap-2 mb-4 text-violet-400">
               <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_5px_#a78bfa]"></span>
               <span className="font-orbitron text-[9px] font-bold uppercase tracking-widest">{t.neuralLog}</span>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto pr-2 flex flex-col gap-2.5 custom-scrollbar">
               {transcriptions.length === 0 ? (
                 <div className="text-white/10 text-center italic mt-12 text-[10px]">{t.waitingActivity}</div>
               ) : (
                 transcriptions.map((text, i) => {
                    const isSystem = text.startsWith(`[${t.system}]`);
                    const isAction = text.startsWith(`[${t.action}]`);
                    const isUser = text.startsWith(`${t.user}:`);
                    return (
                      <div key={i} className={`p-2.5 rounded-lg leading-relaxed text-[11px] ${
                        isUser ? 'bg-white/5 text-white/70 self-end max-w-[85%] text-right' : 
                        isSystem || isAction ? 'bg-violet-900/10 text-violet-400 text-[9px] uppercase border border-violet-900/20 text-center' :
                        'bg-violet-950/20 text-violet-200 self-start max-w-[85%] border-l-2 border-violet-500'
                      }`}>
                        {text}
                      </div>
                    );
                 })
               )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 bg-[#1a1a1e] p-2 md:p-3 rounded-2xl md:rounded-full border border-violet-900/30 shadow-2xl z-20 w-full max-w-fit mt-4">
          <button 
            onClick={onToggleScreen}
            className={`p-3 md:p-4 rounded-full transition-all ${state.isStreamingScreen ? 'bg-violet-600 text-white' : 'hover:bg-white/5 text-white/60'}`}
            title={t.shareScreen}
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
          </button>
          
          <button 
            onClick={onToggleWebcam}
            className={`p-3 md:p-4 rounded-full transition-all ${state.isStreamingWebcam ? 'bg-violet-600 text-white' : 'hover:bg-white/5 text-white/60'}`}
            title={t.toggleWebcam}
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
          </button>

          <button 
            onClick={onToggleMute}
            className={`p-3 md:p-4 rounded-full transition-all ${state.isMuted ? 'bg-red-500 text-white' : 'hover:bg-white/5 text-white/60'}`}
            title={state.isMuted ? t.unmuteMic : t.muteMic}
          >
            {state.isMuted ? (
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6"></path></svg>
            ) : (
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
            )}
          </button>

          <div className="hidden md:block w-px h-8 bg-white/10 mx-2"></div>

          <button 
            onClick={onConnect}
            className={`px-6 md:px-8 py-3 md:py-4 rounded-full font-orbitron font-bold text-xs md:text-sm tracking-widest transition-all ${
              state.isConnected 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(124,58,237,0.3)]'
            }`}
          >
            {state.isConnected ? t.terminateLink : t.establishLink}
          </button>
        </div>

        {/* Footer Area */}
        <footer className="mt-8 mb-4 flex flex-col items-center gap-3 py-4 border-t border-white/5 w-full max-w-lg z-20">
          <div className="flex items-center gap-2">
            <span className="text-white/20 text-[10px] tracking-widest font-bold uppercase">Created by</span>
            <span className="text-white/60 text-xs font-orbitron tracking-tight">Gerónimo Moreira</span>
          </div>
          <div className="flex gap-4">
            <a 
              href="https://github.com/xxDMONxx" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-violet-500/50 transition-all duration-300"
            >
              <svg className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              <span className="text-[10px] font-bold text-white/40 group-hover:text-white uppercase tracking-widest transition-colors">GitHub</span>
            </a>
            <a 
              href="https://www.linkedin.com/in/moreiragf/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-[#0077b5]/20 hover:border-[#0077b5]/50 transition-all duration-300"
            >
              <svg className="w-4 h-4 text-white/40 group-hover:text-[#0077b5] transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              <span className="text-[10px] font-bold text-white/40 group-hover:text-white uppercase tracking-widest transition-colors">LinkedIn</span>
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
