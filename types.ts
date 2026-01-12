
export enum PersonalityType {
  FRIENDLY = 'Friendly',
  PROFESSIONAL = 'Professional',
  GAMER = 'Gamer/Competitive',
  SARCASTIC = 'Witty/Sarcastic',
  ZEN = 'Zen/Calm',
  CUSTOM = 'Custom Neural Persona'
}

export type Language = 'en' | 'es';

export interface VoiceConfig {
  name: string;
  voiceId: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
}

export interface DMonState {
  isConnected: boolean;
  isStreamingScreen: boolean;
  isStreamingWebcam: boolean;
  isMuted: boolean;
  userName: string;
  aiName: string;
  language: Language;
  personality: PersonalityType;
  customPrompt: string;
  voice: string;
  currentTask: string;
  location?: { lat: number; lng: number };
}

export interface ActiveAlert {
  id: string;
  type: 'timer' | 'alarm' | 'reminder';
  label: string;
  endTime: number;
}
