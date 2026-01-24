
export enum PersonalityType {
  FRIENDLY = 'FRIENDLY',
  PROFESSIONAL = 'PROFESSIONAL',
  GAMER = 'GAMER',
  SARCASTIC = 'SARCASTIC',
  ZEN = 'ZEN',
  WHEATLEY = 'WHEATLEY',
  GLADOS = 'GLADOS',
  CUSTOM = 'CUSTOM'
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
  facingMode: 'user' | 'environment';
  location?: { lat: number; lng: number };
}

export interface ActiveAlert {
  id: string;
  type: 'timer' | 'alarm' | 'reminder';
  label: string;
  endTime: number;
}
