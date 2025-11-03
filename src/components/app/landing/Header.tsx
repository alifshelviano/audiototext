"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes"; // 🌗 Tambah ini

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme(); // 🌗 Tambah ini

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 ${
        scrolled
          ? "bg-white/50 backdrop-blur-xl shadow-md border-white/30 dark:bg-gray-900/70 dark:border-gray-700"
          : "bg-gradient-to-r from-cyan-100/40 via-white/20 to-cyan-200/40 backdrop-blur-lg dark:from-gray-800/40 dark:via-gray-900/20 dark:to-gray-800/40"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center space-x-2 hover:opacity-80 transition"
        >
          <Image
            src="/logo.png"
            alt="LISN Logo"
            width={40}
            height={40}
            className="object-contain"
          />
          <span className="text-cyan-600 dark:text-cyan-400 font-extrabold text-3xl tracking-tight">
            LISN<span className="text-cyan-400 dark:text-cyan-300">.</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-10">
          {["About", "Pricing", "Testimonials", "Team", "Contact"].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-gray-800/80 hover:text-cyan-600 dark:text-gray-200/80 dark:hover:text-cyan-400 transition duration-300 font-medium"
            >
              {item}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {/* CTA Button */}
          <Link href="/auth/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="hidden md:block bg-gradient-to-r from-cyan-400 to-cyan-600 text-white px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              Get Started
            </motion.button>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-cyan-700 dark:text-cyan-400 p-2 rounded-lg hover:bg-white/20 transition"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white/40 dark:bg-gray-800/60 backdrop-blur-xl border-t border-white/20 dark:border-gray-700 shadow-sm"
          >
            <div className="flex flex-col items-center py-6 space-y-4">
              {["About", "Pricing", "Testimonials", "Team", "Contact"].map(
                (item) => (
                  <Link
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    onClick={() => setMenuOpen(false)}
                    className="text-cyan-700 dark:text-cyan-300 hover:text-cyan-500 text-lg transition font-medium"
                  >
                    {item}
                  </Link>
                )
              )}
              <Link href="/auth/login">
                <button className="bg-gradient-to-r from-cyan-400 to-cyan-600 text-white px-6 py-2 rounded-xl hover:scale-105 transition-all">
                  Get Started
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
