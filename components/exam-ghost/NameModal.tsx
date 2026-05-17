"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function NameModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("examghost:name");
    if (!stored) setIsOpen(true);
  }, []);

  const handleSubmit = () => {
    if (name.trim()) {
      localStorage.setItem("examghost:name", name.trim());
      setIsOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-card rounded-2xl p-6 w-full max-w-sm border border-border"
          >
            <h2 className="text-xl font-bold text-foreground mb-4">Welcome to ExamGhost</h2>
            <p className="text-muted-foreground mb-4">Please enter your full name to continue</p>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="mb-4 bg-background border-border"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            <Button onClick={handleSubmit} className="w-full bg-[image:var(--gradient-primary)] text-primary-foreground">
              Save Name
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}