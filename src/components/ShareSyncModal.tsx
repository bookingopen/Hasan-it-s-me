import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { X, QrCode, Copy, Check, Smartphone, Wifi, RefreshCw, RotateCcw } from 'lucide-react';

interface ShareSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetDemo: () => void;
}

export const ShareSyncModal: React.FC<ShareSyncModalProps> = ({
  isOpen,
  onClose,
  onResetDemo
}) => {
  if (!isOpen) return null;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    const url = window.location.href;
    setCurrentUrl(url);

    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        url,
        {
          width: 220,
          margin: 2,
          color: {
            dark: '#0f172a',
            light: '#ffffff'
          }
        },
        (error) => {
          if (error) console.error('QR code generation error:', error);
        }
      );
    }
  }, [isOpen]);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl text-slate-100 my-auto overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-indigo-950/70 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/40">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Instant Multi-Device Phone Sync
              </h2>
              <p className="text-xs text-indigo-200">
                Sync 32-bed ward in real time with all surgical team phones
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center space-y-5 text-xs">
          
          {/* QR Code Container */}
          <div className="inline-block p-3 bg-white rounded-2xl shadow-xl">
            <canvas ref={canvasRef} className="rounded-lg" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-white">
              Scan with your Phone Camera
            </h3>
            <p className="text-slate-400 mt-1 max-w-sm mx-auto">
              Any team member (Consultants, Registrars, Residents, Nurses) can scan this QR code to join this ward session on their phone.
            </p>
          </div>

          {/* Direct Link Box */}
          <div className="flex items-center gap-2 p-2 bg-slate-950 rounded-xl border border-slate-800 text-left">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="bg-transparent flex-1 text-slate-300 text-xs px-2 truncate font-mono focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 transition-colors shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Link'}</span>
            </button>
          </div>

          {/* Sync Information */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-left space-y-1.5 text-[11px] text-slate-300">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <Wifi className="w-3.5 h-3.5" />
              <span>Real-Time SSE Live Synchronization Active</span>
            </div>
            <p className="text-slate-400">
              • Changes made on any phone immediately reflect across all devices in under 100ms.
            </p>
            <p className="text-slate-400">
              • Cached locally on devices so you never lose ward data even in hospital elevators or basements.
            </p>
          </div>

          {/* Reset Demo Data Button */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">Need fresh call day mock data?</span>
            <button
              onClick={() => {
                if (confirm('Reset ward to initial ER call day demo data?')) {
                  onResetDemo();
                  onClose();
                }
              }}
              className="flex items-center gap-1 text-slate-400 hover:text-rose-400 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo Ward</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
