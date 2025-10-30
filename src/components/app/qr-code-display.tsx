'use client';

import { QRCodeCanvas } from 'qrcode.react';
import { Copy, Share2, Check, Smartphone, Link as LinkIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

interface QRCodeDisplayProps {
  url: string;
  size?: number;
  className?: string;
}

export function QRCodeDisplay({ url, size = 140, className = '' }: QRCodeDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Check if Web Share API is supported (client-side only)
  useEffect(() => {
    setMounted(true);
    setCanShare(!!navigator.share);
  }, []);

  const handleCopyLink = async () => {
    try {
      // Primary method: Clipboard API
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch (err) {
      console.error('Failed to copy link:', err);
      try {
        // Fallback method for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          setCopied(true);
        } else {
          throw new Error('execCommand failed');
        }
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
        // Last resort: prompt user to copy manually
        prompt('Copy this link:', url);
        return;
      }
    }
    
    // Reset copied state after 2 seconds
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!navigator.share) return;

    try {
      await navigator.share({
        title: 'Join Meeting Room - LISN',
        text: 'Join my meeting room on LISN',
        url: url,
      });
    } catch (err) {
      // Ignore abort errors (user cancelled share)
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Error sharing:', err);
      }
    }
  };

  const handleEmailShare = () => {
    const subject = 'Join my meeting';
    const body = `Join my meeting room: ${url}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  const handleWhatsAppShare = () => {
    const text = `Join my meeting room: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Don't render until mounted to avoid hydration issues
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
    <div className={`bg-white rounded-xl border border-gray-200 p-4 shadow-sm max-w-md mx-auto ${className}`}>
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Left Side - QR Code */}
        <div className="flex flex-col items-center sm:items-start">
          <div className="p-3 bg-white rounded-lg border border-gray-100 mb-2 flex-shrink-0">
            <QRCodeCanvas 
              value={url} 
              size={size}
              fgColor="#1e40af"
              bgColor="#ffffff"
              level="H"
              includeMargin={false}
              imageSettings={{
                src: '/logo.png', // Optional: Add your logo
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

        {/* Right Side - Content */}
        <div className="flex-1 space-y-3 min-w-0">
          {/* Header */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Share Meeting</h3>
            <p className="text-xs text-gray-500">Share this link with participants</p>
          </div>

          {/* Link Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                <LinkIcon className="h-3 w-3 text-blue-600" />
                Meeting Link
              </label>
            </div>
            
            <div 
              className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors group"
              onClick={handleCopyLink}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCopyLink();
                }
              }}
              aria-label="Copy meeting link to clipboard"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600 break-words font-medium line-clamp-2">
                  {url}
                </p>
              </div>
              <button
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors flex-shrink-0 ${
                  copied 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 group-hover:bg-blue-700'
                }`}
                aria-label={copied ? "Link copied" : "Copy link"}
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="space-y-2">
            {canShare && (
              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                aria-label="Share via native sharing dialog"
              >
                <Share2 className="h-3 w-3" />
                Share via App
              </button>
            )}
            
            {/* Alternative Share Options */}
            <div className="flex gap-2">
              <button
                onClick={handleEmailShare}
                className="flex-1 px-2 py-1.5 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors font-medium"
                aria-label="Share via email"
              >
                Email
              </button>
              <button
                onClick={handleWhatsAppShare}
                className="flex-1 px-2 py-1.5 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors font-medium"
                aria-label="Share via WhatsApp"
              >
                WhatsApp
              </button>
            </div>
          </div>

          {/* Tip */}
          <div className="p-2 bg-blue-50 rounded border border-blue-100">
            <p className="text-xs text-blue-700">
              💡 Quick tip: Scan QR code for instant mobile access
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}