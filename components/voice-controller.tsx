'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Volume2 } from 'lucide-react';
import { getVoiceController } from '@/lib/voice';

interface VoiceControllerProps {
  onAnswerDetected: (answerIndex: number) => void;
  onSpeakComplete?: () => void;
}

export function VoiceController({ onAnswerDetected, onSpeakComplete }: VoiceControllerProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');

  const voiceController = getVoiceController();

  const handleStartListening = useCallback(async () => {
    if (!voiceController.isSupported()) {
      setError('Voice recognition not supported in your browser');
      return;
    }

    setIsListening(true);
    setTranscript('');
    setError('');

    try {
      const text = await voiceController.startListening();
      setTranscript(text);

      const answerIndex = voiceController.mapVoiceToAnswer(text);
      if (answerIndex !== null) {
        onAnswerDetected(answerIndex);
      } else {
        setError('Could not understand answer. Please say A, B, C, or D');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsListening(false);
    }
  }, [voiceController, onAnswerDetected]);

  const handleReadQuestion = useCallback(
    async (text: string) => {
      try {
        await voiceController.speak(text);
        onSpeakComplete?.();
      } catch (err) {
        setError((err as Error).message);
      }
    },
    [voiceController, onSpeakComplete]
  );

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button
          onClick={handleStartListening}
          disabled={isListening}
          variant="outline"
          className="gap-2 flex-1"
          size="sm"
        >
          {isListening ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Listening...
            </>
          ) : (
            <>
              <span>🎤</span>
              Listen for Answer
            </>
          )}
        </Button>
        <Button
          onClick={() => handleReadQuestion('Listen to the question')}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Volume2 className="h-4 w-4" />
        </Button>
      </div>

      {transcript && (
        <div className="rounded-lg bg-blue-50 p-3 text-sm">
          <p className="text-gray-700">
            <span className="font-medium">You said:</span> {transcript}
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
