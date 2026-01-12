
import React from 'react';
import { PersonalityType, Language } from '../types';
import { VOICES, TRANSLATIONS } from '../constants';

interface SettingsPanelProps {
  userName: string;
  onUserNameChange: (name: string) => void;
  aiName: string;
  onAiNameChange: (name: string) => void;
  language: Language;
  onLanguageToggle: () => void;
  personality: PersonalityType;
  onPersonalityChange: (p: PersonalityType) => void;
  customPrompt: string;
  onCustomPromptChange: (val: string) => void;
  voice: string;
  onVoiceChange: (v: string) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  userName,
  onUserNameChange,
  aiName,
  onAiNameChange,
  language,
  onLanguageToggle,
  personality, 
  onPersonalityChange, 
  customPrompt,
  onCustomPromptChange,
  voice, 
  onVoiceChange,
  isOpen,
  onToggleOpen
}) => {
  const t = TRANSLATIONS[language];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={onToggleOpen}
        className="md:hidden fixed top-4 right-4 z-50 p-3 bg-violet-600 rounded-full shadow-lg"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
        </svg>
      </button>

      <div className={`
        fixed inset-y-0 left-0 z-40 w-80 bg-[#111114] border-r border-violet-900/30 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}>
        {/* Language Toggle */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-bold text-white/30 tracking-widest uppercase">Global Interface</span>
          <button 
            onClick={onLanguageToggle}
            className="px-3 py-1 rounded bg-violet-600/20 border border-violet-500/50 text-violet-400 text-xs font-bold hover:bg-violet-600/40 transition-colors"
          >
            {t.langToggle}
          </button>
        </div>

        {/* User Profile */}
        <div>
          <h2 className="text-violet-400 font-orbitron text-sm mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            {t.userProfile}
          </h2>
          <input
            type="text"
            value={userName}
            onChange={(e) => onUserNameChange(e.target.value)}
            placeholder={t.userNamePlaceholder}
            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-violet-500 outline-none"
          />
        </div>

        {/* AI Identity */}
        <div>
          <h2 className="text-violet-400 font-orbitron text-sm mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
            {t.aiProfile}
          </h2>
          <input
            type="text"
            value={aiName}
            onChange={(e) => onAiNameChange(e.target.value)}
            placeholder={t.aiNamePlaceholder}
            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-violet-500 outline-none"
          />
        </div>

        {/* Personality */}
        <div>
          <h2 className="text-violet-400 font-orbitron text-sm mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></span>
            {t.personalityMatrix}
          </h2>
          <div className="grid grid-cols-1 gap-1.5 mb-3">
            {Object.values(PersonalityType).map((p) => (
              <button
                key={p}
                onClick={() => onPersonalityChange(p)}
                className={`text-left px-3 py-2 rounded-lg border text-xs transition-all ${
                  personality === p 
                    ? 'bg-violet-900/20 border-violet-500 text-violet-100 shadow-[0_0_10px_rgba(139,92,246,0.1)]' 
                    : 'bg-transparent border-white/5 text-white/50 hover:border-white/20'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {personality === PersonalityType.CUSTOM && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-[9px] text-violet-400 uppercase tracking-widest mb-1.5 block font-bold">{t.customDirectives}</label>
              <textarea
                value={customPrompt}
                onChange={(e) => onCustomPromptChange(e.target.value)}
                placeholder={t.customPlaceholder}
                className="w-full h-24 bg-black/40 border border-violet-500/30 rounded-lg p-3 text-xs text-white focus:border-violet-500 outline-none resize-none custom-scrollbar"
              />
            </div>
          )}
        </div>

        {/* Voice Selection */}
        <div>
          <h2 className="text-violet-400 font-orbitron text-sm mb-3 flex items-center gap-2">
             {t.voiceCore}
          </h2>
          <select
            value={voice}
            onChange={(e) => onVoiceChange(e.target.value)}
            className="w-full bg-[#1a1a1e] border border-white/10 rounded-lg p-2.5 text-xs text-white outline-none focus:border-violet-500"
          >
            {VOICES.map((v) => (
              <option key={v.voiceId} value={v.voiceId}>{v.name}</option>
            ))}
          </select>
        </div>

        {/* Info */}
        <div className="mt-auto pt-4 border-t border-white/5">
          <div className="text-[9px] text-white/30 uppercase tracking-widest mb-3 font-bold">{t.protocolVersion}</div>
          <div className="p-2.5 bg-white/5 rounded-lg border border-white/5">
            <div className="flex justify-between text-[9px] text-white/40 mb-1">
               <span>ENGINE:</span>
               <span className="text-violet-400">GEMINI-2.5-LIVE</span>
            </div>
            <div className="flex justify-between text-[9px] text-white/40">
               <span>UI:</span>
               <span className="text-violet-400">D-MON-PRO-V2</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={onToggleOpen}
        />
      )}
    </>
  );
};

export default SettingsPanel;
