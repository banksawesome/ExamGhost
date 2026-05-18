"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export function PageHeader({ 
  title, 
  subtitle, 
  right 
}: { 
  title: ReactNode; 
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-between"
    >
      <div>
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {right}
    </motion.div>
  );
}