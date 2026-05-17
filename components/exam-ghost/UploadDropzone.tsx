"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { FileUp } from "lucide-react";

export function UploadDropzone({ onFileSelect }: { onFileSelect?: (file: File | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOver, setIsOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = (f: File | null) => {
    if (f) {
      setFileName(f.name);
      onFileSelect?.(f);
    }
  };

  return (
    <motion.div
      onDragOver={(e) => {
        e.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsOver(false);
        handleFile(e.dataTransfer.files?.[0] ?? null);
      }}
      onClick={() => inputRef.current?.click()}
      animate={{ scale: isOver ? 1.01 : 1 }}
      className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-colors ${
        isOver
          ? "border-primary bg-primary/10 shadow-[var(--shadow-glow)]"
          : "border-primary/40 bg-card/40 hover:border-primary/70"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".pdf,.txt,.docx,.pptx,.jpg,.jpeg,.png"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <FileUp className="h-8 w-8" />
      </div>
      <p className="text-foreground font-medium text-lg">
        {fileName ?? "Drag & drop your files here"}
      </p>
      <p className="text-primary mt-1">
        or <span className="underline underline-offset-4 cursor-pointer">click to browse</span>
      </p>
      <p className="text-xs text-muted-foreground mt-4">
        Supports: PDF, TXT, DOCX, PPTX, Images (JPG, PNG)
      </p>
    </motion.div>
  );
}