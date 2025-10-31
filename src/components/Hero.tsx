'use client';

import { useState, MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

const Hero: React.FC = () => {
  const [showVideo, setShowVideo] = useState<boolean>(false);
  const router = useRouter();

  const handleOverlayClick = () => setShowVideo(false);
  const handleVideoClick = (e: MouseEvent<HTMLDivElement>) => e.stopPropagation();

  return (
    <motion.section
      style={{ perspective: 1000 }} // Set perspective for 3D effects
      className="relative bg-gray-50 pt-24 pb-20 overflow-hidden"
    >
      <div className="container mx-auto px-6 flex flex-col-reverse lg:flex-row items-center justify-between gap-12">
        {/* ==== LEFT CONTENT ==== */}
        <div className="lg:w-1/2 text-center lg:text-left">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            whileHover={{ y: -5, transition: { type: "spring", stiffness: 300 } }} // Subtle lift on hover
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6"
          >
            Meeting Summaries, <span className="text-indigo-600">Made Simple</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            whileHover={{ y: -5, transition: { type: "spring", stiffness: 300 } }}
            className="text-lg text-gray-600 mb-8 max-w-md mx-auto lg:mx-0"
          >
            LISN AI automatically summarizes your meetings in real-time. Record, transcribe, and get instant meeting insights.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
          >
            <motion.button
              onClick={() => router.push('/login')}
              whileHover={{ scale: 1.05, y: -5, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)" }}
              whileTap={{ scale: 0.97 }}
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition text-lg shadow-md"
            >
              Start Free Trial
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -5, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowVideo(true)}
              className="border border-indigo-600 text-indigo-600 px-8 py-3 rounded-lg hover:bg-indigo-50 transition text-lg shadow-sm"
            >
              Watch Demo
            </motion.button>
          </motion.div>
        </div>

        {/* ==== RIGHT ILLUSTRATION ==== */}
        <motion.div
          initial={{ opacity: 0, x: 50, rotateY: -30 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.3 }}
          whileHover={{
            scale: 1.05,
            rotateY: 10, // Rotate in 3D space on hover
            boxShadow: "0px 20px 40px rgba(0, 0, 0, 0.2)",
          }}
          className="lg:w-1/2 flex justify-center"
        >
          <Image src="/assets/ilustrasi3.png" alt="Team collaboration" width={500} height={500} className="max-w-full w-[480px] drop-shadow-lg" />
        </motion.div>
      </div>

      {/* ==== POPUP VIDEO ==== */}
      <AnimatePresence>
        {showVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={handleOverlayClick}
          >
            <motion.div
              initial={{ scale: 0.8, rotateX: 30 }}
              animate={{ scale: 1, rotateX: 0 }}
              exit={{ scale: 0.8, rotateX: 30 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="relative bg-black rounded-2xl shadow-2xl overflow-hidden w-[90%] max-w-3xl"
              onClick={handleVideoClick}
            >
              <video src="/videos/demo.mp4" controls autoPlay className="w-full h-auto rounded-xl" />
              <button onClick={() => setShowVideo(false)} className="absolute top-3 right-3 text-white bg-white/20 hover:bg-white/40 rounded-full w-10 h-10 flex items-center justify-center text-xl">
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default Hero;
