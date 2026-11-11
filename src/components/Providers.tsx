"use client";

import { MotionConfig } from "framer-motion";

export function Providers({ children }: { children: React.ReactNode }) {
  // respeita "reduzir movimento" do sistema operacional
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.25, ease: "easeOut" }}>
      {children}
    </MotionConfig>
  );
}
