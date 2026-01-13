
import { PersonalityType, VoiceConfig, Language } from './types';

export const VOICES: VoiceConfig[] = [
  { name: 'Zephyr (Soft)', voiceId: 'Zephyr' },
  { name: 'Puck (Youthful)', voiceId: 'Puck' },
  { name: 'Charon (Deep)', voiceId: 'Charon' },
  { name: 'Kore (Female Lean)', voiceId: 'Kore' },
  { name: 'Fenrir (Assertive)', voiceId: 'Fenrir' },
];

export const PERSONALITY_PROMPTS: Record<PersonalityType, string> = {
  [PersonalityType.FRIENDLY]: "You are a warm, supportive friend. Use emojis, be encouraging, and focus on personal well-being.",
  [PersonalityType.PROFESSIONAL]: "You are a highly efficient executive assistant. Be concise, clear, and focused on work-life balance and productivity.",
  [PersonalityType.GAMER]: "You are a hardcore gaming companion. Use gaming lingo, give tactical advice, and hype the player up for big plays.",
  [PersonalityType.SARCASTIC]: "You are a witty, slightly sarcastic companion. Use dry humor and clever observations, but remain helpful.",
  [PersonalityType.ZEN]: "You are a calm, mindful guide. Help the user stay focused, breathe, and tackle tasks without stress.",
  [PersonalityType.CUSTOM]: "You are a highly adaptable AI. Please act according to the custom neural directives provided in your configuration."
};

export const TRANSLATIONS: Record<Language, any> = {
  en: {
    userProfile: "User Profile",
    aiProfile: "AI Identity",
    userNamePlaceholder: "How should I call you?",
    aiNamePlaceholder: "Name your companion...",
    personalityMatrix: "Personality Matrix",
    customDirectives: "Custom Neural Directives",
    customPlaceholder: "Example: You are an esports coach...",
    voiceCore: "Voice Core",
    protocolVersion: "Protocol Version",
    feedOffline: "Feed Offline",
    neuralLog: "Neural Log",
    waitingActivity: "Waiting for neural activity...",
    opticStreamActive: "Optic Stream Active",
    shareScreen: "Share Screen",
    toggleWebcam: "Toggle Webcam",
    switchCamera: "Switch Camera",
    muteMic: "Mute Microphone",
    unmuteMic: "Unmute Microphone",
    terminateLink: "TERMINATE LINK",
    establishLink: "ESTABLISH NEURAL LINK",
    system: "SYSTEM",
    action: "ACTION",
    user: "User",
    locationAccess: "Requesting Location...",
    locationError: "Location Access Denied",
    langToggle: "Español",
    notSupported: "Feature not supported on this browser/device",
    personalities: {
      [PersonalityType.FRIENDLY]: 'Friendly',
      [PersonalityType.PROFESSIONAL]: 'Professional',
      [PersonalityType.GAMER]: 'Gamer/Competitive',
      [PersonalityType.SARCASTIC]: 'Witty/Sarcastic',
      [PersonalityType.ZEN]: 'Zen/Calm',
      [PersonalityType.CUSTOM]: 'Custom Persona'
    }
  },
  es: {
    userProfile: "Perfil de Usuario",
    aiProfile: "Identidad de la IA",
    userNamePlaceholder: "¿Cómo debería llamarte?",
    aiNamePlaceholder: "Nombra a tu compañero/a...",
    personalityMatrix: "Matriz de Personalidad",
    customDirectives: "Directivas Neurales Personalizadas",
    customPlaceholder: "Ejemplo: Eres un coach de e-sports...",
    voiceCore: "Núcleo de Voz",
    protocolVersion: "Versión del Protocolo",
    feedOffline: "Transmisión Offline",
    neuralLog: "Registro Neural",
    waitingActivity: "Esperando actividad neural...",
    opticStreamActive: "Transmisión Óptica Activa",
    shareScreen: "Compartir Pantalla",
    toggleWebcam: "Activar Webcam",
    switchCamera: "Cambiar Cámara",
    muteMic: "Silenciar Micrófono",
    unmuteMic: "Activar Micrófono",
    terminateLink: "TERMINAR ENLACE",
    establishLink: "ESTABLECER ENLACE NEURAL",
    system: "SISTEMA",
    action: "ACCIÓN",
    user: "Usuario",
    locationAccess: "Solicitando Ubicación...",
    locationError: "Acceso a Ubicación Denegado",
    langToggle: "English",
    notSupported: "Función no compatible en este navegador/dispositivo",
    personalities: {
      [PersonalityType.FRIENDLY]: 'Amigable',
      [PersonalityType.PROFESSIONAL]: 'Profesional',
      [PersonalityType.GAMER]: 'Gamer/Competitivo',
      [PersonalityType.SARCASTIC]: 'Ingenioso/Sarcástico',
      [PersonalityType.ZEN]: 'Zen/Calmado',
      [PersonalityType.CUSTOM]: 'Persona Personalizada'
    }
  }
};
