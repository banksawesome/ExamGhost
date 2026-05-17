"use client";

import { motion } from "framer-motion";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-[99]">
      <div className="relative">
        <motion.img
          src="/ghost-logo.png"
          alt="ExamGhost"
          width={180}
          height={180}
          animate={{ x: -60 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="absolute left-20 top-1/2 -translate-y-1/2"
        >
          <span className="text-4xl font-bold bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">
            ExamGhost
          </span>
        </motion.div>
      </div>
    </div>
  );
}