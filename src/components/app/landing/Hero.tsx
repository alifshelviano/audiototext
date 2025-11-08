
// audiototext/src/components/app/landing/Hero.tsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

// Helper function to generate a smooth wave path string
const generateWavePath = (
  width: number,
  height: number,
  amplitude: number,
  frequency: number,
  phase: number,
  offsetY: number
) => {
  let path = `M0,${offsetY}`;
  // Ensure we don't try to generate path for invalid width
  if (width <= 0) return ''; 

  for (let i = 0; i <= width; i += 5) { // Iterate every 5 pixels
    const y = offsetY + Math.sin(i * frequency + phase) * amplitude;
    path += `L${i},${y}`;
  }
  path += `L${width},${height}L0,${height}Z`; // Close the path to form a shape
  return path;
};

const Hero = () => {
  const [showVideo, setShowVideo] = useState(false);
  const videoId = "5CkNjvk9nj8";

  // State for screen dimensions, initialized to 0
  const [screenWidth, setScreenWidth] = useState(0);
  const [screenHeight, setScreenHeight] = useState(0);

  // Set screen dimensions on mount
  useEffect(() => {
    // Only run on client-side
    if (typeof window !== 'undefined') {
      setScreenWidth(window.innerWidth);
      setScreenHeight(window.innerHeight);

      const handleResize = () => {
        setScreenWidth(window
.innerWidth);
        setScreenHeight(window.innerHeight);
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // State for wave animation properties
  const [wavePaths, setWavePaths]
 = useState<string[]>([]);
  const animationFrameId = useRef<number | null>(null);
  const phaseRef = useRef([0, 0, 0]); // Separate phase for each wave layer

  const animateWaves = useCallback(() => {
    // Use screenWidth and screenHeight from state
    if (screenWidth === 0 || screenHeight === 0) return; // Wait for dimensions to be set

    const width = screenWidth;
    const height = screenHeight * 0.4; // Waves take up bottom 40% of screen height

    // Adjust these values to control the look and movement
    const amplitudes = [20, 15, 25]; // Max height of the wave
    const frequencies = [0.005, 0.008, 0.006]; // How many waves across the screen
    const speeds = [0.005, 0.003, 0.007]; // How fast they move

    const newPaths = [];
    for (let i = 0; i < 3; i++) { // Generate 3 layers of waves
      phaseRef.current[i] += speeds[i]; // Increment phase for animation
      newPaths.push(
        generateWavePath(width, height, amplitudes[i], frequencies[i], phaseRef.current[i], height * 0.5) // offsetY is half of waveHeight
      );
    }
    setWavePaths(newPaths);
    animationFrameId.current = requestAnimationFrame(animateWaves);
  }, [screenWidth, screenHeight]); // Add screenWidth and screenHeight as dependencies

  useEffect(() => {
    // Only start animation if dimensions are available
    if (screenWidth > 0 && screenHeight > 0) {
      animateWaves();
    }
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [animateWaves, screenWidth, screenHeight]); // Add screenWidth and screenHeight as dependencies


  return (
    <section className="relative w-full h-screen flex items-center justify-center bg-gray-50 overflow-hidden">
      {/* Wave Backgrounds */}
      {/* Conditionally render SVG once screen dimensions are known */}
      {screenWidth > 0 && screenHeight > 0 && (
        <div className="absolute inset-x-0 bottom-0 z-0 h-[40vh]"> {/* Container for waves, takes bottom 40% of viewport height */}
          <svg
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
            // Use state variables for viewBox
            viewBox={`0 0 ${screenWidth} ${screenHeight * 0.4}`}
            preserveAspectRatio="none"
          >
            {wavePaths.map((path, index) => (
              <motion.path
                key={index}
                d={path}
                fill={
                  index === 0
                    ? "hsl(190, 80%, 70%)" // Slightly deeper cyan
                    : index === 1
                    ? "hsl(200, 70%, 60%)" // Blue
                    : "hsl(210, 60%, 50%)" // Even deeper blue
                }
                fillOpacity={0.3 + index * 0.1} // Vary opacity
                animate={{ d: path }} // Animate the path data
                transition={{ duration: 0.1, ease: "linear" }} // Smooth transition for wave shape
              />
            ))}
          </svg>
        </div>
      )}
      {/* End Wave Backgrounds */}

      <div className="relative z-10 text-center px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight mb-6"
        >
          Your AI Meeting Assistant
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto"
        >
          Lisnize transcribes, summarizes, and extracts key insights from your meetings, so you never miss a beat.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -5, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)" }}
            whileTap={{ scale: 0.97 }}
            className="bg-cyan-500 text-white px-8 py-3 rounded-lg hover:bg-cyan-600 transition text-lg shadow-lg"
          >
            Get Started Free
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -5, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowVideo(true)}
            className="border border-cyan-500 text-cyan-500 px-8 py-3 rounded-lg hover:bg-cyan-50 transition text-lg shadow-sm"
          >
            Watch Demo
          </motion.button>
        </motion.div>
      </div>

      {/* Video Modal (unchanged) */}
      {showVideo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setShowVideo(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative bg-white rounded-lg shadow-2xl p-2 md:p-4 w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowVideo(false)}
              className="absolute top-2 right-2 text-gray-700 hover:text-gray-900 text-2xl font-bold z-10"
              aria-label="Close video"
            >
              &times;
            </button>
            <div className="relative" style={{ paddingBottom: '56.25%', height: 0 }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full rounded-md"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
};

export default Hero;
