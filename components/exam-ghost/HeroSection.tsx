"use client";

import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <div className="flex items-start justify-between gap-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-xl"
      >
        <h1 className="text-4xl md:text-5xl font-bold leading-tight text-foreground">
          Turn your study material into a{" "}
          <span className="bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">
            real exam.
          </span>
        </h1>
        <p className="mt-4 text-muted-foreground text-base md:text-lg leading-relaxed">
          Upload your notes, PDFs, slides or textbook pages and get a timed exam with AI-generated questions.
        </p>
      </motion.div>

      <motion.img
        src="/ghost-mascot.png"
        alt="ExamGhost mascot"
        width={220}
        height={220}
        className="hidden md:block h-44 w-44 lg:h-52 lg:w-52 object-contain drop-shadow-[0_0_32px_oklch(0.62_0.22_260/0.5)]"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}