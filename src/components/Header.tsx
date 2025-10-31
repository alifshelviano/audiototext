"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
        scrolled ? "bg-white/50 backdrop-blur-xl shadow-md border-white/30" : "bg-gradient-to-r from-cyan-100/40 via-white/20 to-cyan-200/40 backdrop-blur-lg"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition">
          <Image src="/logo.png" alt="LISN Logo" width={40} height={40} className="object-contain" />
          <span className="text-cyan-600 font-extrabold text-3xl tracking-tight">
            LISN<span className="text-cyan-400">.</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-10">
          {["About", "Pricing", "Testimonials", "Team", "Contact"].map((item) => (
            <Link key={item} href={`#${item.toLowerCase()}`} className="text-gray-800/80 hover:text-cyan-600 transition duration-300 font-medium">
              {item}
            </Link>
          ))}
        </nav>

        {/* CTA Button */}
        <Link href="/login">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="hidden md:block bg-gradient-to-r from-cyan-400 to-cyan-600 text-white px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all">
            Get Started
          </motion.button>
        </Link>

        {/* Mobile Menu Button */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-cyan-700 p-2 rounded-lg hover:bg-white/20 transition">
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="md:hidden bg-white/40 backdrop-blur-xl border-t border-white/20 shadow-sm">
            <div className="flex flex-col items-center py-6 space-y-4">
              {["About", "Pricing", "Testimonials", "Team", "Contact"].map((item) => (
                <Link key={item} href={`#${item.toLowerCase()}`} onClick={() => setMenuOpen(false)} className="text-cyan-700 hover:text-cyan-500 text-lg transition font-medium">
                  {item}
                </Link>
              ))}
              <Link href="/login">
                <button className="bg-gradient-to-r from-cyan-400 to-cyan-600 text-white px-6 py-2 rounded-xl hover:scale-105 transition-all">Get Started</button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}