'use client';

import { motion } from 'framer-motion';
import React from 'react';

export const AuroraBackground = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative flex items-center justify-center overflow-hidden bg-gray-900 text-white">
      {/* Animated Aurora Layer */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-500 to-teal-400 blur-3xl opacity-50 bg-[length:200%_200%]"
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Optional Overlay Noise */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />

      {/* Content */}
      <div className="relative z-10 px-6 py-32 text-center">{children}</div>
    </div>
  );
};
