/**
 * Web Speech API wrapper for Text-to-Speech and Speech-to-Text
 * Client-side only
 */

export class VoiceController {
  private synth: SpeechSynthesis | null = null;
  private recognition: any | null = null;
  private isListening = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.synth = window.speechSynthesis;
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.setupRecognition();
      }
    }
  }

  /**
   * Speak text aloud using Text-to-Speech
   */
  speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth) {
        resolve();
        return;
      }

      // Cancel any ongoing speech
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onend = () => {
        resolve();
      };

      utterance.onerror = () => {
        resolve(); // Still resolve on error
      };

      this.synth.speak(utterance);
    });
  }

  /**
   * Start listening for voice input
   */
  startListening(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      if (this.isListening) {
        reject(new Error('Already listening'));
        return;
      }

      this.isListening = true;
      let transcript = '';

      this.recognition.onstart = () => {
        // Listening started
      };

      this.recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          transcript += t;

          if (event.results[i].isFinal) {
            this.isListening = false;
            resolve(transcript.toLowerCase().trim());
          }
        }
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (transcript) {
          resolve(transcript.toLowerCase().trim());
        }
      };

      this.recognition.start();

      // Timeout after 10 seconds
      setTimeout(() => {
        if (this.isListening) {
          this.recognition.stop();
          this.isListening = false;
          resolve(transcript.toLowerCase().trim());
        }
      }, 10000);
    });
  }

  /**
   * Stop listening
   */
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Map voice input to answer (A, B, C, D)
   */
  mapVoiceToAnswer(voiceInput: string): number | null {
    const input = voiceInput.toLowerCase().trim();

    // Check for direct answer letters
    if (['a', 'b', 'c', 'd'].includes(input)) {
      return input.charCodeAt(0) - 97; // a=0, b=1, c=2, d=3
    }

    // Check for spoken numbers
    const numberMap: Record<string, number> = {
      'one': 0,
      'first': 0,
      'two': 1,
      'second': 1,
      'three': 2,
      'third': 2,
      'four': 3,
      'fourth': 3,
    };

    for (const [word, index] of Object.entries(numberMap)) {
      if (input.includes(word)) {
        return index;
      }
    }

    return null;
  }

  /**
   * Check if speech recognition is supported
   */
  isSupported(): boolean {
    return this.recognition !== null;
  }

  /**
   * Setup recognition event handlers
   */
  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
  }
}

// Create singleton instance
let voiceController: VoiceController | null = null;

export function getVoiceController(): VoiceController {
  if (!voiceController) {
    voiceController = new VoiceController();
  }
  return voiceController;
}
