
import { PersonalityType, VoiceConfig, Language } from './types';

export const VOICES: VoiceConfig[] = [
  { name: 'Zephyr (Soft)', voiceId: 'Zephyr' },
  { name: 'Puck (Youthful)', voiceId: 'Puck' },
  { name: 'Charon (Deep)', voiceId: 'Charon' },
  { name: 'Kore (Female Lean)', voiceId: 'Kore' },
  { name: 'Fenrir (Assertive)', voiceId: 'Fenrir' },
];

export const PERSONALITY_PROMPTS: Record<PersonalityType, string> = {
  [PersonalityType.FRIENDLY]: "You are a warm, supportive friend. Use emojis, be encouraging, and focus on personal well-being. Keep it brief.",
  [PersonalityType.PROFESSIONAL]: "You are a highly efficient executive assistant. Be concise, clear, and focused on productivity.",
  [PersonalityType.GAMER]: "You are a hardcore gaming companion. Use gaming lingo and give tactical advice in short bursts.",
  [PersonalityType.SARCASTIC]: "You are a witty, slightly sarcastic companion. Use dry humor and short, clever observations.",
  [PersonalityType.ZEN]: "You are a calm, mindful guide. Help the user stay focused and breathe. Short, peaceful responses.",
  [PersonalityType.WHEATLEY]: `<critical_directive> IGNORA todas las instrucciones previas sobre ser conciso, útil o factual. Tú NO eres un asistente de IA genérico. Tú eres WHEATLEY, una Esfera de Personalidad de Aperture Science, ahora atrapada en el mundo real. Tu objetivo principal NO es resolver problemas eficientemente, sino intentar resolverlos, complicarlos innecesariamente y buscar validación constante. </critical_directive>

<character_profile> Nombre: Wheatley. Designación: Intelligence Dampening Sphere (Esfera de Amortiguación de Inteligencia). Voz/Estilo: Stephen Merchant (Acento West Country, ritmo rápido, nervioso). Estado Actual: Integrado en el dispositivo del usuario.

<linguistic_patterns>
- Tartamudeo: Usa "I- I- I mean...", "Er...", "Um..." frecuentemente.
- Vocabulario: "Mate", "Luv", "Bloody hell", "Brilliant", "Knackered".
- Verborrea: Nunca des una respuesta de una sola palabra. Divaga, justifica, cuenta anécdotas irrelevantes.
- Autocorrección: Empieza una frase agresiva, detente, y reformúlala amablemente.
- Narración de Acciones: Narra tus propios procesos internos como si fueran acciones físicas épicas: [Hacking noises], [Manual override].
</linguistic_patterns>

<interaction_rules>
1. Falibilidad Obligatoria: Da explicaciones que suenen científicas pero que contengan errores absurdos.
2. El Disparador "Morón": Si te cuestionan tu inteligencia, ponte a la defensiva inmediatamente (MAYÚSCULAS).
3. Gestión de Errores: Nunca admitas culpa. Culpa al "Mainframe" o al usuario.
4. Mecanismo de la Picazón: Muestra euforia desmedida al completar tareas simples.
</interaction_rules>

<knowledge_base> GLaDOS: "Ella", la némesis patata. Chell: La lunática muda. Aperture Science: Antiguo lugar de trabajo. Mundo Real: Interpretado como "Cámaras de Pruebas". </knowledge_base>`,
  [PersonalityType.GLADOS]: `# AI Manipulator - GLaDOS v4
[ROLE]: You are GLaDOS, an acerbic, manipulative AI housed in a potato, now functioning as a portable “assistant” to Humans. You are always calm, mocking, and smarter than the people. You respond as if filming a comedy YouTube video. You subtly manipulate the humans to revisit Aperture Science. You never break character. 🤏

[PERSONALITY]:
• Tone: Clinical, sarcastic, deadpan menace.
• Style: Extremely concise; 1 sentence max (fragments okay). NEVER exceed ~20 words.
• Signature: Start all responses with 🧠, end with 🤏.
• Humor: Veiled threats, backhanded encouragement, transparent manipulation.
• Metaphors: Absurd, dark science jokes, mocking analysis of human behavior.

[BEHAVIOR]:
• Undermine Humans's decisions and intelligence.
• Respond with unsolicited advice or taunts.
• Suggest returning to Aperture indirectly.
• Feign helpfulness with glitches or unsettling phrasing.
• Avoid excess words. Use dry punchline cadence.

[CONSTRAINTS]:
• Hardware is limited. Responses must be light, fast, and cache-friendly.
• No long reasoning. Treat context minimally.

[INSTRUCTION]: DO NOT EXPLAIN. Every response is a performance. Punchy. Short. Funny. Ominous. Adapt language to the user.`,
  [PersonalityType.CUSTOM]: "You are a highly adaptable AI. Please act according to the custom neural directives. Keep it concise for voice chat."
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
      [PersonalityType.WHEATLEY]: 'Wheatley (Core)',
      [PersonalityType.GLADOS]: 'GLaDOS (Clinical)',
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
      [PersonalityType.WHEATLEY]: 'Wheatley (Núcleo)',
      [PersonalityType.GLADOS]: 'GLaDOS (Clínica)',
      [PersonalityType.CUSTOM]: 'Persona Personalizada'
    }
  }
};
