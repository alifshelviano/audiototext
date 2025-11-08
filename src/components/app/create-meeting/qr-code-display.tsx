"use client";

import { QRCodeCanvas } from "qrcode.react";
import {
  Copy,
  Check,
  Share2,
  Mail,
  Link as LinkIcon,
  X,
  Smartphone,
  MessageCircle,
  ZoomIn,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface QRCodeDisplayProps {
  url: string;
  size?: number;
  className?: string;
  onClose?: () => void;
}

export function QRCodeDisplay({ url, size = 160, className = "", onClose }: QRCodeDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [qrSize, setQrSize] = useState(size);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCanShare(!!navigator.share);

    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 480) setQrSize(120);
      else if (width < 768) setQrSize(140);
      else setQrSize(size);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [size]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
    }
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({
        title: "Join Meeting Room - LISN",
        text: "Join my meeting room on LISN",
        url,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleEmailShare = () => {
    const subject = "Join my meeting";
    const body = `Join my meeting room: ${url}`;
    window.open(
      `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      "_blank"
    );
  };

  const handleWhatsAppShare = () => {
    const text = `Join my meeting room: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  if (!mounted) return null;

  return (
    <>
      <div
        className={`relative bg-white rounded-2xl shadow-xl border border-gray-200 max-w-lg mx-auto p-6 sm:p-8 text-center ${className}`}
      >
        {onClose && (
          <>
            <button
              onClick={onClose}
              type="button"
              className="absolute top-4 right-4 w-8 h-8 flex sm:hidden items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              type="button"
              className="absolute top-4 right-4 w-8 h-8 hidden sm:flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        )}

        <h2 className="text-xl font-semibold text-gray-900 mb-1">Join on Mobile</h2>
        <p className="text-sm text-gray-500 mb-6">Use your phone’s camera to scan the code.</p>

        {/* QR CODE SECTION */}
        <div
          className="flex flex-col items-center mb-6 relative group cursor-pointer"
          onClick={() => setExpanded(true)}
        >
          <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
            <Smartphone className="h-4 w-4 text-gray-600" />
            Scan to join
          </p>
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl shadow-sm relative transition-transform duration-200 group-hover:scale-105">
            <QRCodeCanvas
              value={url}
              size={qrSize}
              fgColor="#000000"
              bgColor="#ffffff"
              level="H"
              includeMargin={false}
              imageSettings={{
                src: "/logo.png",
                height: 32,
                width: 32,
                excavate: true,
              }}
            />
            <div className="absolute bottom-1 right-1 bg-white/80 rounded-full p-1">
              <ZoomIn className="w-4 h-4 text-gray-600" />
            </div>
          </div>
        </div>

        {/* SHARE SECTION */}
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Share Meeting</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 justify-items-center mb-4 max-w-sm mx-auto">
          {canShare && (
            <button
              onClick={handleShare}
              className="flex flex-col items-center text-gray-700 hover:text-cyan-600 transition"
            >
              <Share2 className="w-5 h-5 mb-1" />
              <span className="text-xs">Share via App</span>
            </button>
          )}

          <button
            onClick={handleCopyLink}
            className="flex flex-col items-center text-gray-700 hover:text-cyan-600 transition"
          >
            {copied ? (
              <Check className="w-5 h-5 mb-1 text-green-600" />
            ) : (
              <LinkIcon className="w-5 h-5 mb-1" />
            )}
            <span className="text-xs">{copied ? "Copied" : "Copy Link"}</span>
          </button>

          <button
            onClick={handleEmailShare}
            className="flex flex-col items-center text-gray-700 hover:text-cyan-600 transition"
          >
            <Mail className="w-5 h-5 mb-1" />
            <span className="text-xs">Share via Email</span>
          </button>

          <button
            onClick={handleWhatsAppShare}
            className="flex flex-col items-center text-gray-700 hover:text-cyan-600 transition"
          >
            <MessageCircle className="w-5 h-5 mb-1" />
            <span className="text-xs">Share via Chat</span>
          </button>
        </div>

        <p className="text-xs text-gray-400">Or send this link directly to participants.</p>
      </div>

      {/* EXPANDED QR VIEW (Desktop Style) */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpanded(false)}
          >
            <motion.div
              className="relative bg-white p-8 rounded-3xl shadow-2xl max-w-[500px] w-[90%] flex flex-col items-center"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setExpanded(false)}
                className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-semibold text-gray-800 mb-4">Scan QR to Join</h3>

              <QRCodeCanvas
                value={url}
                size={360}
                fgColor="#000000"
                bgColor="#ffffff"
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: "/logo.png",
                  height: 60,
                  width: 60,
                  excavate: true,
                }}
              />

              <p className="text-xs text-gray-500 mt-4">Click anywhere outside to close</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
