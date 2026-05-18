'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, Loader2 } from 'lucide-react';
import type { ExamSettings } from '@/types';

export function UploadCard() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Settings state
  const [numberOfQuestions, setNumberOfQuestions] = useState(15);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [duration, setDuration] = useState(60);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const droppedFile = files[0];
      if (['application/pdf', 'text/plain', 'image/jpeg', 'image/png'].includes(droppedFile.type)) {
        setFile(droppedFile);
        setError('');
      } else {
        setError('Please upload a PDF, text file, or image');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      if (['application/pdf', 'text/plain', 'image/jpeg', 'image/png'].includes(selectedFile.type)) {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please upload a PDF, text file, or image');
      }
    }
  };

  const handleGenerateExam = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const settings: ExamSettings = {
        numberOfQuestions,
        difficulty,
        duration,
        voiceEnabled,
      };
      formData.append('settings', JSON.stringify(settings));

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();

      // Redirect to processing
      const params = new URLSearchParams({
        title: data.examTitle,
        duration: data.duration.toString(),
        difficulty: data.difficulty,
        numQuestions: (data.totalQuestions || 15).toString(),
        voice: data.voiceEnabled ? 'true' : 'false',
      });
      router.push(`/processing/${data.examId}?${params.toString()}`);
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero section */}
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold text-gray-900">Turn your study material into a real exam</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Upload PDFs, notes, slides, or textbook pages
        </p>
      </div>

      {/* Main upload card */}
      <Card className="border-border bg-white shadow-sm">
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900">Upload Study Material</h2>
            <p className="text-sm text-gray-600">Get exam ready in minutes with AI-generated questions</p>
          </div>

          {/* Upload box */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 cursor-pointer transition-colors hover:border-blue-500 hover:bg-blue-50"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.png,.jpg,.jpeg"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Upload className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-center text-gray-700 font-medium">Drag and drop your files here</p>
            <p className="text-center text-sm text-gray-600 mt-1">or click to browse (PDF, TXT, Images)</p>
            {file && <p className="text-center text-sm text-blue-600 mt-3 font-medium">Selected: {file.name}</p>}
          </div>

          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          {/* Settings section */}
          <div className="space-y-6 border-t border-gray-200 pt-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900">
                Number of Questions: <span className="font-bold text-blue-600">{numberOfQuestions}</span>
              </Label>
              <Slider
                value={[numberOfQuestions]}
                onValueChange={(val) => setNumberOfQuestions(val[0])}
                min={5}
                max={50}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-gray-600">5 to 50 questions</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-900">Difficulty</Label>
                <div className="flex gap-2">
                  {(['Easy', 'Medium', 'Hard'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`flex-1 rounded px-3 py-2 text-sm font-medium transition-colors ${
                        difficulty === level
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration" className="text-sm font-medium text-gray-900">
                  Duration: <span className="font-bold text-blue-600">{duration} min</span>
                </Label>
                <Select value={duration.toString()} onValueChange={(val) => setDuration(parseInt(val))}>
                  <SelectTrigger id="duration" className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 15, 30, 45, 60, 90, 120, 180].map((mins) => (
                      <SelectItem key={mins} value={mins.toString()}>
                        {mins} minutes
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <Label htmlFor="voice-mode" className="text-sm font-medium text-gray-900 cursor-pointer">
                Enable Voice Mode
              </Label>
              <Switch
                id="voice-mode"
                checked={voiceEnabled}
                onCheckedChange={setVoiceEnabled}
              />
            </div>
          </div>

          {/* Generate button */}
          <Button
            onClick={handleGenerateExam}
            disabled={loading || !file}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-lg font-medium"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Exam...
              </>
            ) : (
              'Generate Exam'
            )}
          </Button>

          <p className="text-xs text-gray-600 text-center">Your exam will be generated and stored locally for offline use.</p>
        </CardContent>
      </Card>
    </div>
  );
}
