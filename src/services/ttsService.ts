// Text-to-Speech Service using Web Speech API
// Can be swapped for ElevenLabs or other TTS services later

let currentUtterance: SpeechSynthesisUtterance | null = null;

export const speak = (text: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Cancel any ongoing speech
    stop();

    if (!('speechSynthesis' in window)) {
      reject(new Error('Text-to-speech not supported in this browser'));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    currentUtterance = utterance;

    // Configure voice settings
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.1; // Slightly higher for friendly tone
    utterance.volume = 1;

    // Try to use a child-friendly voice
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      voice => voice.lang.startsWith('en') && voice.name.includes('Female')
    ) || voices.find(voice => voice.lang.startsWith('en'));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => {
      currentUtterance = null;
      resolve();
    };

    utterance.onerror = (event) => {
      currentUtterance = null;
      reject(new Error(`Speech synthesis error: ${event.error}`));
    };

    speechSynthesis.speak(utterance);
  });
};

export const stop = (): void => {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
  }
  currentUtterance = null;
};

export const isSpeaking = (): boolean => {
  return 'speechSynthesis' in window && speechSynthesis.speaking;
};

// Preload voices (some browsers need this)
export const preloadVoices = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve([]);
      return;
    }

    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    speechSynthesis.onvoiceschanged = () => {
      resolve(speechSynthesis.getVoices());
    };
  });
};
