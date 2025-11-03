"use client";

import { QRCodeCanvas } from "qrcode.react";
import { Copy, Share2, Check, Smartphone, Link as LinkIcon, X } from "lucide-react";
import { useState, useEffect } from "react";

interface QRCodeDisplayProps {
  url: string;
  size?: number;
  className?: string;
  onClose?: () => void;
}

export function QRCodeDisplay({ url, size = 140, className = "", onClose }: QRCodeDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [qrSize, setQrSize] = useState(size);

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
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
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
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_blank");
  };

  const handleWhatsAppShare = () => {
    const text = `Join my meeting room: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  if (!mounted) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm animate-pulse">
        <div className="flex gap-4">
          <div className="w-[140px] h-[140px] bg-gray-200 rounded-lg"></div>
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-white rounded-xl border border-gray-200 p-6 shadow-lg w-full max-w-[320px] sm:max-w-[420px] mx-auto overflow-hidden ${className}`}>
      {/* Close Button (X) */}
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-red-600 transition-all duration-200"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <div className="flex flex-col items-center text-center space-y-5">
        {/* QR Code */}
        <div className="flex flex-col items-center">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 mb-2">
            <QRCodeCanvas
              value={url}
              size={qrSize}
              fgColor="#000000"
              bgColor="#ffffff"
              level="H"
              includeMargin={false}
              imageSettings={{
                src: "/logo.png",
                height: 24,
                width: 24,
                excavate: true,
              }}
            />
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Smartphone className="h-3 w-3" />
            <span>Scan to join</span>
          </div>
        </div>

        {/* Title */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Share Meeting</h3>
          <p className="text-xs text-gray-500">Share this link with participants</p>
        </div>

        {/* Link */}
        <div className="space-y-2 w-full">
          <label className="text-xs font-medium text-gray-600 flex items-center justify-center gap-1">
            <LinkIcon className="h-3 w-3 text-blue-600" />
            Meeting Link
          </label>
          <div onClick={handleCopyLink} className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors group">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-700 break-all font-mono leading-tight">{url}</p>
            </div>
            <button
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors flex-shrink-0 whitespace-nowrap ${
                copied ? "bg-green-100 text-green-700" : "bg-blue-600 text-white hover:bg-blue-700 group-hover:bg-blue-700"
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" /> Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* Share via App */}
        {canShare && (
          <button onClick={handleShare} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors text-sm font-medium">
            <Share2 className="h-3 w-3" />
            Share via App
          </button>
        )}

        {/* Email & WhatsApp */}
        <div className="grid grid-cols-2 gap-2 w-full">
          <button onClick={handleEmailShare} className="px-2 py-1.5 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors font-medium">
            Email
          </button>
          <button onClick={handleWhatsAppShare} className="px-2 py-1.5 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors font-medium">
            WhatsApp
          </button>
        </div>

        {/* Cancel Button - Sekarang Bekerja */}
        {onClose && (
          <button onClick={onClose} className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-100 transition-colors font-medium">
            Cancel
          </button>
        )}

        {/* Tip */}
        <div className="p-2 bg-blue-50 rounded border border-blue-100 w-full">
          <p className="text-xs text-blue-700 flex items-start gap-1">
            <span>💡 </span>
            <span>Quick tip: Scan QR code for instant mobile access</span>
          </p>
        </div>
      </div>
    </div>
  );
}
