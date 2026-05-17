"use client";

import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Loader2 } from "lucide-react";

interface GenerateButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  error?: string;
}

export function GenerateButton({ onClick, loading = false, disabled = false, error }: GenerateButtonProps) {
  return (
    <div>
      <motion.button
        whileHover={{ scale: disabled || loading ? 1 : 1.01 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.99 }}
        onClick={onClick}
        disabled={disabled || loading}
        className="relative w-full overflow-hidden rounded-2xl bg-[image:var(--gradient-primary)] py-5 text-lg font-semibold text-primary-foreground shadow-[var(--shadow-glow)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <span className="relative z-10 inline-flex items-center justify-center gap-2">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
          {loading ? "Generating..." : "Generate Exam"}
        </span>
        {!loading && (
          <motion.span
            aria-hidden
            className="absolute inset-y-0 -left-1/3 w-1/3 bg-white/20 blur-md"
            animate={{ x: ["0%", "400%"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          />
        )}
      </motion.button>
      {error && <p className="mt-2 text-center text-sm text-danger">{error}</p>}
      <p className="mt-3 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
        <ShieldCheck className="h-4 w-4 text-primary" />
        Your exam will be generated securely and saved locally for offline access.
      </p>
    </div>
  );
}