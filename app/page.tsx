"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/exam-ghost/PageShell";
import { HeroSection } from "@/components/exam-ghost/HeroSection";
import { UploadDropzone } from "@/components/exam-ghost/UploadDropzone";
import { ExamSettings } from "@/components/exam-ghost/ExamSettings";
import { GenerateButton } from "@/components/exam-ghost/GenerateButton";
import { ProgressPanel } from "@/components/exam-ghost/ProgressPanel";
import { useState } from "react";
import type { ExamSettings as ExamSettingsType } from "@/types";

export default function HomePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [questions, setQuestions] = useState(20);
  const [duration, setDuration] = useState(60);
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [voice, setVoice] = useState(true);

  const handleGenerateExam = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const settings: ExamSettingsType = {
        numberOfQuestions: questions,
        difficulty,
        duration,
        voiceEnabled: voice,
      };
      formData.append("settings", JSON.stringify(settings));

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await response.json();
      router.push(`/processing/${data.examId}?title=${encodeURIComponent(data.examTitle)}`);
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  return (
    <PageShell rightPanel={<ProgressPanel />}>
      <div className="flex flex-col gap-8">
        <HeroSection />
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <UploadDropzone onFileSelect={setFile} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <ExamSettings
            questions={questions}
            setQuestions={setQuestions}
            duration={duration}
            setDuration={setDuration}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            voice={voice}
            setVoice={setVoice}
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
          <GenerateButton onClick={handleGenerateExam} loading={loading} disabled={!file || loading} error={error} />
        </motion.div>
      </div>
    </PageShell>
  );
}