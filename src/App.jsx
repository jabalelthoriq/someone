import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Pause, Play, X, ChevronLeft, ChevronRight, Download, RefreshCw, Camera } from 'lucide-react';

// ─── TARGET DATE ───────────────────────────────────────────────────
// ✅ Set waktu target: 7 September 2026, pukul 00:01 MYT (Zona Waktu Malaysia, UTC+8)
const TARGET_TIME = new Date('2026-09-06T20:03:00+08:00');

function getTargetDate() {
  const now = new Date();
  if (now >= TARGET_TIME) return null;
  return TARGET_TIME;
}

// ─── FLOATING HEARTS (main bg) ─────────────────────────────────────
const BG_HEARTS = [...Array(18)].map((_, i) => ({
  id: i,
  x: Math.random() * 100,
  delay: Math.random() * 16,
  duration: Math.random() * 14 + 16,
  size: Math.random() * 18 + 10,
  drift: (Math.random() - 0.5) * 120,
}));

function FloatingHeart({ h }) {
  return (
    <motion.div
      className="fixed pointer-events-none z-0 select-none"
      style={{ left: `${h.x}%`, bottom: -50, fontSize: h.size }}
      animate={{ y: [0, -(window.innerHeight + 80)], x: [0, h.drift], opacity: [0.5, 0.05] }}
      transition={{ duration: h.duration, repeat: Infinity, ease: 'linear', delay: h.delay }}
    >❤️</motion.div>
  );
}

// ─── RAIN HEARTS (countdown, sedikit & pelan) ──────────────────────
const RAIN_HEARTS = [...Array(10)].map((_, i) => ({
  id: i, x: 5 + i * 10, delay: i * 0.9,
  duration: 5 + (i % 3) * 2, size: 14 + (i % 4) * 5,
  drift: (i % 2 === 0 ? 1 : -1) * 20,
}));

function RainHeart({ h }) {
  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{ left: `${h.x}%`, top: -40, fontSize: h.size, zIndex: 1 }}
      animate={{ y: [0, window.innerHeight + 60], x: [0, h.drift], opacity: [0, 0.85, 0.85, 0] }}
      transition={{ duration: h.duration, repeat: Infinity, ease: 'linear', delay: h.delay }}
    >❤️</motion.div>
  );
}

// ─── UNLOCK SPLASH ─────────────────────────────────────────────────
function UnlockSplash({ onDone }) {
  const hearts = useRef(
    [...Array(55)].map((_, i) => ({
      id: i, x: Math.random() * window.innerWidth,
      size: Math.random() * 34 + 14,
      drift: (Math.random() - 0.5) * 260,
      dur: Math.random() * 1.2 + 1.0,
      delay: Math.random() * 0.7,
    }))
  ).current;

  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[305] pointer-events-none overflow-hidden">
      {hearts.map(h => (
        <motion.div
          key={h.id}
          className="absolute select-none"
          style={{ left: h.x, top: window.innerHeight, fontSize: h.size }}
          animate={{ y: -(window.innerHeight * 1.25), x: h.drift, opacity: [0, 1, 0] }}
          transition={{ duration: h.dur, ease: 'easeOut', delay: h.delay }}
        >❤️</motion.div>
      ))}
    </div>
  );
}

// ─── HEART TAP SPLASH ──────────────────────────────────────────────
function HeartSplash({ splashes }) {
  return (
    <>
      {splashes.map(s => (
        <motion.div
          key={s.id}
          className="fixed pointer-events-none z-[9998] select-none"
          style={{ left: s.x - 14, top: s.y - 14, fontSize: 20 }}
          initial={{ opacity: 1, scale: 0.4, y: 0 }}
          animate={{ opacity: 0, scale: 1.6, y: -80 }}
          transition={{ duration: 0.85, ease: 'easeOut' }}
        >❤️</motion.div>
      ))}
    </>
  );
}

// ─── COUNTDOWN PAGE ────────────────────────────────────────────────
function CountdownPage({ onUnlock, audioRef }) {
  const target = getTargetDate();
  const [timeLeft, setTimeLeft] = useState(() => (!target ? null : Math.max(0, target - Date.now())));
  const [phase, setPhase] = useState('counting');

  useEffect(() => {
    if (timeLeft === null) { onUnlock(); return; }
    const t = setInterval(() => {
      const rem = target - Date.now();
      if (rem <= 0) {
        clearInterval(t);
        setTimeLeft(0);
        setPhase('splash');
        if (audioRef.current) audioRef.current.play().catch(() => {});
      } else {
        setTimeLeft(rem);
      }
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const totalSec = Math.floor((timeLeft || 0) / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = n => String(n).padStart(2, '0');

  return (
    <>
      {phase === 'splash' && <UnlockSplash onDone={onUnlock} />}
      <motion.div
        className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-gradient-to-br from-red-950 via-red-900 to-red-800 overflow-hidden"
        animate={phase === 'splash' ? { opacity: 0, scale: 1.04 } : { opacity: 1 }}
        transition={{ duration: 1, delay: phase === 'splash' ? 0.9 : 0 }}
      >
        {RAIN_HEARTS.map(h => <RainHeart key={h.id} h={h} />)}
        {[...Array(5)].map((_, i) => (
          <div key={i} className="absolute text-white/5 select-none pointer-events-none"
            style={{ fontSize: 110 + i * 40, left: `${(i * 38) % 80}%`, top: `${(i * 41) % 70}%` }}>
            ❤️
          </div>
        ))}

        <div className="relative z-10 text-center px-6">
          <div className="text-7xl mb-5">❤️</div>
          <p className="text-red-200 text-[11px] tracking-[0.4em] uppercase mb-2 font-medium">
            Menunggu hari spesial endutt
          </p>
          <h1 className="text-white text-4xl font-black mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
            7 September
          </h1>
          <p className="text-red-300 text-sm mb-10">pukul 00:01</p>

          <div className="flex items-center justify-center gap-2 mb-10">
            {[{ v: d, l: 'Hari' }, { v: h, l: 'Jam' }, { v: m, l: 'Menit' }, { v: s, l: 'Detik' }].map((item, i) => (
              <React.Fragment key={item.l}>
                <div className="flex flex-col items-center">
                  <div className="w-[66px] h-[66px] bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shadow-lg shadow-black/30">
                    <span className="text-white text-3xl font-black tabular-nums">{pad(item.v)}</span>
                  </div>
                  <span className="text-red-300 text-[10px] mt-2 tracking-widest uppercase font-medium">{item.l}</span>
                </div>
                {i < 3 && <span className="text-white/50 text-3xl font-black mb-6">:</span>}
              </React.Fragment>
            ))}
          </div>

          <p className="text-red-200/50 text-xs font-light max-w-[220px] mx-auto leading-relaxed">
            Sabar ya... ada sesuatu yang spesial untukmu
          </p>
        </div>
      </motion.div>
    </>
  );
}

// ─── PHOTO UTILS ───────────────────────────────────────────────────
const PHOTOS = [
  { src: '/image/foto7.jpg', caption: 'Endut yang cantik' },
  { src: '/image/foto8.jpg', caption: 'Mukbang bersama endut' },
  { src: '/image/foto10.jpg', caption: 'Foto dengan endut' },
  { src: '/image/foto11.jpg', caption: 'Selalu di hatiku' },
  { src: '/image/foto9.jpg', caption: 'Bukber dengan endut' },
];
const FALLBACK = 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=600&auto=format&fit=crop';
function safeImg(e) { e.target.onerror = null; e.target.src = FALLBACK; }

// ─── POP bounce mantul ─────────────────────────────────────────────
function Pop({ children, delay = 0, className = '', style }) {
  return (
    <motion.div
      className={className} style={style}
      initial={{ opacity: 0, scale: 0.55, y: 30 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: '-16px' }}
      transition={{ delay, type: 'spring', stiffness: 380, damping: 14, mass: 0.7 }}
    >{children}</motion.div>
  );
}

// ─── LIGHTBOX ──────────────────────────────────────────────────────
function Lightbox({ photos, index, onClose, onPrev, onNext }) {
  useEffect(() => {
    const h = e => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose, onPrev, onNext]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.6, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="relative w-full max-w-sm mx-4"
        onClick={e => e.stopPropagation()}
      >
        <img src={photos[index].src} alt={photos[index].caption} onError={safeImg}
          className="w-full max-h-[75vh] object-contain rounded-3xl shadow-2xl" />
        <div className="mt-4 text-center">
          <p className="text-white/80 text-sm font-light">{photos[index].caption}</p>
          <p className="text-white/30 text-xs mt-1">{index + 1} / {photos.length}</p>
        </div>
        <button onClick={onClose} className="absolute -top-3 -right-3 bg-red-900/80 rounded-full p-2 text-white"><X size={18} /></button>
        <button onClick={onPrev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 rounded-full p-2.5 text-white"><ChevronLeft size={20} /></button>
        <button onClick={onNext} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 rounded-full p-2.5 text-white"><ChevronRight size={20} /></button>
      </motion.div>
    </motion.div>
  );
}

// ─── FRAME OVERLAY (standalone — jangan taruh di dalam component lain) ─────
function FrameOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
      {/* Polaroid Outer White Bars */}
      <div className="absolute top-0 left-0 right-0 h-[7%] bg-[#f8f9fa] border-b border-gray-300/40" />
      <div className="absolute top-[7%] bottom-[22%] left-0 w-[7%] bg-[#f8f9fa]" />
      <div className="absolute top-[7%] bottom-[22%] right-0 w-[7%] bg-[#f8f9fa]" />
      
      {/* Polaroid Bottom White Chin with Text */}
      <div className="absolute bottom-0 left-0 right-0 h-[22%] bg-[#f8f9fa] flex flex-col justify-center px-6 border-t border-gray-300/50">
        <h3 className="text-[#ea3840] font-black text-xl tracking-wide leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
          Happy Birthday
        </h3>
        <p className="text-[#ea3840] text-xs font-semibold tracking-wide mt-1">
          7 September 2026 • selalu di hatiku
        </p>
      </div>

      {/* Inner Photo Window Gray Outline */}
      <div className="absolute top-[7%] bottom-[22%] left-[7%] right-[7%] border-2 border-gray-400/80 pointer-events-none" />

      {/* Top-Left 3D Red Hearts (folded paper style) */}
      <div className="absolute top-[1.5%] left-[1.5%] z-20 flex items-center pointer-events-none">
        {/* Small 3D Heart */}
        <svg className="w-8 h-8 -mr-2 drop-shadow-md" viewBox="-24 -24 48 48">
          <path d="M 0,-14 C -7,-24 -20,-20 -20,-8 C -20,4 -7,12 0,20 Z" fill="#bd1c24" />
          <path d="M 0,-14 C 7,-24 20,-20 20,-8 C 20,4 7,12 0,20 Z" fill="#ea3840" />
        </svg>
        {/* Big 3D Heart */}
        <svg className="w-14 h-14 drop-shadow-lg" viewBox="-24 -24 48 48">
          <path d="M 0,-14 C -7,-24 -20,-20 -20,-8 C -20,4 -7,12 0,20 Z" fill="#bd1c24" />
          <path d="M 0,-14 C 7,-24 20,-20 20,-8 C 20,4 7,12 0,20 Z" fill="#ea3840" />
        </svg>
      </div>

      {/* Bottom-Right Dotted Red Hearts */}
      <div className="absolute bottom-[8%] right-[1%] z-20 flex items-end pointer-events-none">
        {/* Big Dotted Heart */}
        <svg className="w-22 h-22 drop-shadow-lg" viewBox="-26 -26 52 52">
          <path d="M 0,-14 C -7,-24 -22,-20 -22,-7 C -22,6 -7,13 0,22 C 7,13 22,6 22,-7 C 22,-20 7,-24 0,-14 Z" fill="#ea3840" />
          <path d="M 0,-11 C -5,-19 -17,-16 -17,-6 C -17,4 -5,10 0,17 C 5,10 17,4 17,-6 C 17,-16 5,-19 0,-11 Z" 
                fill="none" stroke="white" strokeWidth="2.5" strokeDasharray="3 2.5" />
        </svg>
        {/* Small Dotted Heart */}
        <svg className="w-13 h-13 -ml-4 drop-shadow-md" viewBox="-26 -26 52 52">
          <path d="M 0,-14 C -7,-24 -22,-20 -22,-7 C -22,6 -7,13 0,22 C 7,13 22,6 22,-7 C 22,-20 7,-24 0,-14 Z" fill="#ea3840" />
          <path d="M 0,-11 C -5,-19 -17,-16 -17,-6 C -17,4 -5,10 0,17 C 5,10 17,4 17,-6 C 17,-16 5,-19 0,-11 Z" 
                fill="none" stroke="white" strokeWidth="2.5" strokeDasharray="3 2.5" />
        </svg>
      </div>
    </div>
  );
}

// ─── LIVE CAMERA FRAME ─────────────────────────────────────────────
function LoveFrameCamera() {
  const [phase, setPhase] = useState('idle'); // idle | camera | preview
  const [photoData, setPhotoData] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [facingMode, setFacingMode] = useState('user');
  const [savedUrl, setSavedUrl] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = async (facing = facingMode) => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      setPhase('camera');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 720 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      setPhase('idle');
      alert('Tidak bisa membuka kamera. Pastikan izin kamera sudah diberikan.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => () => stopCamera(), []);

  useEffect(() => {
    if (phase === 'camera' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [phase]);

  const flipCamera = () => {
    const next = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(next);
    startCamera(next);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    // Square crop
    const size = Math.min(vw, vh);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const ox = (vw - size) / 2;
    const oy = (vh - size) / 2;
    if (facingMode === 'user') {
      ctx.save();
      ctx.translate(size, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, ox, oy, size, size, 0, 0, size, size);
      ctx.restore();
    } else {
      ctx.drawImage(video, ox, oy, size, size, 0, 0, size, size);
    }
    setPhotoData(canvas.toDataURL('image/jpeg', 0.92));
    stopCamera();
    setPhase('preview');
  };

  const retake = () => {
    setPhotoData(null);
    startCamera(facingMode);
  };

  const draw3DHeart = (ctx, cx, cy, sz) => {
    ctx.save();
    ctx.translate(cx, cy);
    const scale = sz / 40;
    ctx.scale(scale, scale);

    // Left half (Dark Red)
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.bezierCurveTo(-7, -24, -20, -20, -20, -8);
    ctx.bezierCurveTo(-20, 4, -7, 12, 0, 20);
    ctx.closePath();
    ctx.fillStyle = '#bd1c24';
    ctx.fill();

    // Right half (Light Red)
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.bezierCurveTo(7, -24, 20, -20, 20, -8);
    ctx.bezierCurveTo(20, 4, 7, 12, 0, 20);
    ctx.closePath();
    ctx.fillStyle = '#ea3840';
    ctx.fill();

    ctx.restore();
  };

  const drawDottedHeart = (ctx, cx, cy, sz) => {
    ctx.save();
    ctx.translate(cx, cy);
    const scale = sz / 44;
    ctx.scale(scale, scale);

    // Red Heart Base
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.bezierCurveTo(-7, -24, -22, -20, -22, -7);
    ctx.bezierCurveTo(-22, 6, -7, 13, 0, 22);
    ctx.bezierCurveTo(7, 13, 22, 6, 22, -7);
    ctx.bezierCurveTo(22, -20, 7, -24, 0, -14);
    ctx.closePath();
    ctx.fillStyle = '#ea3840';
    ctx.fill();

    // Inner Dotted White Line
    ctx.beginPath();
    ctx.moveTo(0, -11);
    ctx.bezierCurveTo(-5, -19, -17, -16, -17, -6);
    ctx.bezierCurveTo(-17, 4, -5, 10, 0, 17);
    ctx.bezierCurveTo(5, 10, 17, 4, 17, -6);
    ctx.bezierCurveTo(17, -16, 5, -19, 0, -11);
    ctx.closePath();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([3, 2.5]);
    ctx.stroke();

    ctx.restore();
  };

  const drawFrameOnCanvas = (ctx, w, h) => {
    // 1. Temporarily save original captured photo content (1:1 full resolution)
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = w;
    tempCanvas.height = h;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(ctx.canvas, 0, 0);

    // 2. Clear canvas and fill with Polaroid white background (#f8f9fa)
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, w, h);

    // 3. Draw photo into inner window (exact same 1:1 sub-crop as live screen overlay)
    const wx = w * 0.07;
    const wy = h * 0.07;
    const ww = w * 0.86;
    const wh = h * 0.71;
    ctx.drawImage(tempCanvas, wx, wy, ww, wh, wx, wy, ww, wh);

    // 4. Subtle gray border line above chin and below top bar
    ctx.strokeStyle = 'rgba(209, 213, 219, 0.5)';
    ctx.lineWidth = Math.max(1, w * 0.0015);
    ctx.beginPath();
    ctx.moveTo(0, wy);
    ctx.lineTo(w, wy);
    ctx.moveTo(0, wy + wh);
    ctx.lineTo(w, wy + wh);
    ctx.stroke();

    // 5. Inner gray outline around photo window
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = Math.max(2, w * 0.0035);
    ctx.strokeRect(wx, wy, ww, wh);

    // 6. Polaroid Bottom Text (matching typography and alignment)
    const chinY = wy + wh;
    const chinH = h - chinY;

    ctx.fillStyle = '#ea3840';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = `900 ${h * 0.046}px Georgia, serif`;
    ctx.fillText('Happy Birthday', w * 0.06, chinY + chinH * 0.28);

    ctx.fillStyle = '#ea3840';
    ctx.font = `600 ${h * 0.026}px Arial, sans-serif`;
    ctx.fillText('7 September 2026 • selalu di hatiku', w * 0.06, chinY + chinH * 0.62);

    // 7. Top-Left 3D Hearts (exact matching positions as screen overlay)
    draw3DHeart(ctx, w * 0.045, h * 0.045, w * 0.08);
    draw3DHeart(ctx, w * 0.12, h * 0.045, w * 0.14);

    // 8. Bottom-Right Dotted Hearts (exact matching positions as screen overlay)
    drawDottedHeart(ctx, w * 0.86, h * 0.83, w * 0.22);
    drawDottedHeart(ctx, w * 0.72, h * 0.87, w * 0.13);
  };

  const handleDownload = () => {
    if (!photoData) return;
    setDownloading(true);
    const canvas = canvasRef.current;
    const img = new Image();
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      drawFrameOnCanvas(ctx, canvas.width, canvas.height);

      canvas.toBlob(blob => {
        if (!blob) { setDownloading(false); return; }
        const url = URL.createObjectURL(blob);
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

        if (isIOS || isSafari) {
          // Safari doesn't support download attr — show image for long-press save
          setSavedUrl(url);
        } else {
          const link = document.createElement('a');
          link.href = url; link.download = 'birthday-love-frame.jpg';
          document.body.appendChild(link); link.click(); document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(url), 3000);
        }
        setDownloading(false);
      }, 'image/jpeg', 0.92);
    };
    img.onerror = () => setDownloading(false);
    img.src = photoData;
  };

  // iOS save modal
  if (savedUrl) {
    return (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="fixed inset-0 z-[500] bg-black/92 flex flex-col items-center justify-center px-6 gap-5"
      >
        <p className="text-white text-sm font-semibold text-center">Tekan & tahan gambar untuk menyimpan ❤️</p>
        <img src={savedUrl} alt="frame" className="w-full max-w-xs rounded-2xl shadow-2xl" />
        <motion.button whileTap={{ scale: 0.95 }}
          onClick={() => { URL.revokeObjectURL(savedUrl); setSavedUrl(null); }}
          className="px-8 py-3 bg-white text-red-900 rounded-full font-bold text-sm">
          Selesai
        </motion.button>
      </motion.div>
    );
  }

  if (phase === 'idle') return (
    <Pop delay={0.28}>
      <motion.button whileTap={{ scale: 0.94 }} onClick={() => startCamera('user')}
        className="w-full flex flex-col items-center justify-center gap-3 py-8 rounded-3xl border-2 border-dashed border-red-300 bg-red-50 active:bg-red-100 transition-colors">
        <div className="w-14 h-14 rounded-full bg-red-900 flex items-center justify-center shadow-lg">
          <Camera size={26} className="text-white" />
        </div>
        <div className="text-center">
          <p className="font-bold text-red-900 text-sm">Ambil Foto</p>
          <p className="text-xs font-light text-red-400 mt-0.5">Klik untuk buka kamera</p>
        </div>
      </motion.button>
    </Pop>
  );

  if (phase === 'camera') return (
    <div className="w-full">
      <canvas ref={canvasRef} className="hidden" />
      <div className="relative overflow-hidden bg-black shadow-2xl" style={{ aspectRatio: '1/1' }}>
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"
          style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }} />
        <FrameOverlay />
      </div>
      <div className="flex items-center justify-between mt-3 gap-2">
        <motion.button whileTap={{ scale: 0.9 }} onClick={flipCamera}
          className="w-11 h-11 rounded-full bg-white border border-red-200 flex items-center justify-center text-red-700 shadow">
          <RefreshCw size={18} />
        </motion.button>
        <motion.button whileTap={{ scale: 0.9 }} onClick={capturePhoto}
          className="w-16 h-16 rounded-full bg-red-900 flex items-center justify-center shadow-xl shadow-red-900/40 border-4 border-white">
          <div className="w-10 h-10 rounded-full bg-white/25" />
        </motion.button>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => { stopCamera(); setPhase('idle'); }}
          className="w-11 h-11 rounded-full bg-white border border-red-200 flex items-center justify-center text-red-700 shadow">
          <X size={18} />
        </motion.button>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <canvas ref={canvasRef} className="hidden" />
      <Pop delay={0}>
        <div className="relative overflow-hidden shadow-2xl bg-black" style={{ aspectRatio: '1/1' }}>
          <img src={photoData} alt="preview" className="w-full h-full object-cover" />
          <FrameOverlay />
        </div>
      </Pop>
      <div className="flex gap-2 mt-3">
        <motion.button whileTap={{ scale: 0.94 }} onClick={retake}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 border border-red-200 text-red-500 rounded-2xl text-sm font-semibold active:bg-red-50">
          <Camera size={15} /> Foto Ulang
        </motion.button>
        <motion.button whileTap={{ scale: 0.94 }} onClick={handleDownload} disabled={downloading}
          className="flex-[2] flex items-center justify-center gap-1.5 py-3 bg-red-900 text-white rounded-2xl text-sm font-bold shadow-lg active:bg-red-800 disabled:opacity-60">
          <Download size={15} />
          {downloading ? 'Menyimpan...' : 'Simpan Foto ❤️'}
        </motion.button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// SLIDE 0 – COVER
// ═══════════════════════════════════════════════
function CoverSlide({ onOpen }) {
  return (
    <div className="min-h-[100dvh] flex flex-col relative overflow-hidden bg-white">
      <Pop delay={0} className="relative h-[55vmax] max-h-[65vh] w-full overflow-hidden flex-shrink-0">
        <img src="/image/foto1.jpg" onError={safeImg} alt="Cover" className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-white" />
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.9, type: 'spring', stiffness: 350, damping: 14 }}
          className="absolute top-5 left-5 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-xl flex items-center gap-2"
        >
          <span className="text-lg">❤️</span>
          <div>
            <p className="text-[10px] text-red-800 font-semibold tracking-wider uppercase">Hari Spesial Endutt</p>
            <p className="text-red-900 font-bold text-xs" style={{ fontFamily: 'Playfair Display, serif' }}>7 September 2026</p>
          </div>
        </motion.div>
      </Pop>
      <div className="flex flex-col flex-1 px-6 pt-4 pb-10 justify-center">
        <Pop delay={0.05}><p className="text-[10px] tracking-[0.4em] uppercase text-red-500 font-semibold mb-3">Sebuah ucapan untuk endutku</p></Pop>
        <Pop delay={0.13}>
          <h1 className="text-5xl font-black leading-tight text-red-950 mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            Happy<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-700 to-red-900">Birthday</span>
          </h1>
        </Pop>
        <Pop delay={0.21}><p className="text-gray-500 text-[15px] font-light leading-relaxed mb-8">Untuk endut yang mengisi hari-hariku dengan cahaya dan kebahagiaan yang tak ternilai</p></Pop>
        <Pop delay={0.29}>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }} onClick={onOpen}
            className="self-start flex items-center gap-2 px-8 py-4 bg-red-900 text-white rounded-full text-sm font-bold tracking-wide shadow-lg shadow-red-900/30">
            <span>Pesan Buat Endut</span><span>❤️</span>
          </motion.button>
        </Pop>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// SLIDE 1 – GREETING
// ═══════════════════════════════════════════════
function GreetingSlide() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-white">
      <Pop delay={0} className="bg-gradient-to-br from-red-950 to-red-800 px-6 pt-14 pb-16 relative overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="absolute text-white text-5xl" style={{ left: `${i * 25}%`, top: `${(i * 37) % 80}%` }}>❤️</div>
          ))}
        </div>
        <p className="text-red-300 text-[10px] tracking-[0.4em] uppercase font-semibold mb-2">Untuk endut</p>
        <h2 className="text-white text-4xl font-black leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
          Hari ini adalah<br /><span className="italic text-red-300">hari yang sangat</span><br />istimewa
        </h2>
      </Pop>

      <div className="px-6 -mt-8 mb-6 flex-shrink-0">
        <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {[
            '/image/foto2.jpg',
            '/image/foto3.jpg',
            '/image/foto4.jpg',
            '/image/foto5.jpg',
            '/image/foto14.jpg',
            '/image/foto15.jpg',
            '/image/foto16.jpg',
            '/image/foto17.jpg',
            '/image/foto18.jpg',
            '/image/foto19.jpg',
          ].map((src, i) => (
            <Pop key={i} delay={0.08 + i * 0.06}>
              <div className="w-36 h-44 rounded-3xl overflow-hidden shadow-2xl border-2 border-white flex-shrink-0"
                style={{ transform: `rotate(${[-2, 1, -1, 2, -1, 2, -2, 1, -1, 2][i]}deg)` }}>
                <img src={src} onError={safeImg} alt="" className="w-full h-full object-cover" />
              </div>
            </Pop>
          ))}
        </div>
      </div>

      <div className="px-6 pb-10 flex-1">
        <Pop delay={0.08} className="h-px bg-gradient-to-r from-red-200 to-transparent mb-6" />
        <Pop delay={0.16}><p className="text-gray-600 text-[15px] leading-[1.85] font-light">Selamat ulang tahun ndutt, buat endut yang jauh disana. Semoga endut selalu dikelilingi kebahagiaan di setiap langkahmu.</p></Pop>
        <Pop delay={0.24} className="mt-6 flex items-center gap-2">
          <span className="text-red-900 font-bold text-sm" style={{ fontFamily: 'Playfair Display, serif' }}>— dengan cinta</span>
          <span>❤️</span>
        </Pop>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// SLIDE 2 – LETTER
// ═══════════════════════════════════════════════
function LetterSlide() {
 const paragraphs = [
  { text: 'Aloo, endut kesayangan yang suka banget bikin aku ovt...', style: 'italic' },
  { text: 'Selamat ulang tahun, Sayangkuu. Terima kasih ya sudah seluas dan sesabar itu menghadapiku sampai detik ini. Kehadiran dan rasa sabarmu selalu jadi tempat paling hangat buat aku, bikin segalanya terasa jauh lebih indah.', style: 'normal' },
  { text: 'Terima kasih sudah selalu jadi dirimu sendiri—yang jujur, comel, dan selalu tahu cara bikin tiap momen sederhana terasa lebih berarti. Dunia ini jauh lebih berwarna karena ada endutkuu.', style: 'normal' },
  { text: 'Aku berdoa semoga semua mimpi manis yang pelan-pelan endut simpan bisa segera terwujud satu per satu. Endut berhak mendapatkan semua kebahagiaan terbaik di dunia ini.', style: 'normal' },
  { text: 'Dengan seluruh kasih sayangku — endut, yang selalu mencintaimu. ❤️', style: 'signature' },
];
  return (
    <div className="min-h-[100dvh] flex flex-col bg-gradient-to-b from-white to-red-50">
      <Pop delay={0} className="relative h-[45vmax] max-h-[50vh] flex-shrink-0 overflow-hidden">
        <img src="/image/foto6.jpg" onError={safeImg} alt="Letter" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-red-50" />
        <div className="absolute bottom-4 left-6">
          <div className="bg-white/90 backdrop-blur rounded-2xl px-4 py-2 inline-flex items-center gap-2 shadow-lg">
            <span className="text-red-900 text-xs font-semibold" style={{ fontFamily: 'Playfair Display, serif' }}>Sepatah kata</span>
          </div>
        </div>
      </Pop>
      <div className="flex-1 px-6 pt-6 pb-10">
        <div className="bg-white rounded-3xl shadow-sm border border-red-100 p-6 space-y-5">
          {paragraphs.map((p, i) => (
            <Pop key={i} delay={0.05 + i * 0.09}>
              <p className={
                p.style === 'italic' ? 'text-red-700 font-semibold text-base italic' :
                p.style === 'signature' ? 'text-red-900 font-bold text-sm pt-3 border-t border-red-100' :
                'text-gray-600 text-[14px] font-light leading-[1.9]'
              }>{p.text}</p>
            </Pop>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// SLIDE 3 – ALBUM
// ═══════════════════════════════════════════════
function AlbumSlide() {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const prev = () => setLightboxIndex(i => (i - 1 + PHOTOS.length) % PHOTOS.length);
  const next = () => setLightboxIndex(i => (i + 1) % PHOTOS.length);
  return (
    <>
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox photos={PHOTOS} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onPrev={prev} onNext={next} />
        )}
      </AnimatePresence>
      <div className="min-h-[100dvh] flex flex-col bg-white">
        <div className="px-6 pt-12 pb-6 flex-shrink-0">
          <Pop delay={0}><p className="text-[10px] tracking-[0.4em] uppercase text-red-400 font-semibold mb-2">Kenangan kita</p></Pop>
          <Pop delay={0.08}>
            <h2 className="text-4xl font-black text-red-950 leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
              Album<br /><span className="italic text-red-600">Foto Kita</span>
            </h2>
          </Pop>
          <Pop delay={0.14}><p className="text-gray-400 text-xs mt-2 font-light">Ketuk foto untuk melihat lebih dekat</p></Pop>
        </div>
        <div className="px-4 pb-10 flex-1">
          <div className="grid grid-cols-2 gap-3">
            <Pop delay={0.1} className="row-span-2 rounded-3xl overflow-hidden shadow-lg" style={{ height: '380px' }}>
              <div className="w-full h-full active:opacity-80 transition-opacity" onClick={() => setLightboxIndex(0)}>
                <img src={PHOTOS[0].src} onError={safeImg} alt="" className="w-full h-full object-cover" />
              </div>
            </Pop>
            {[1, 2].map((idx, i) => (
              <Pop key={idx} delay={0.16 + i * 0.08} className="rounded-3xl overflow-hidden shadow-lg" style={{ height: '180px' }}>
                <div className="w-full h-full active:opacity-80 transition-opacity" onClick={() => setLightboxIndex(idx)}>
                  <img src={PHOTOS[idx].src} onError={safeImg} alt="" className="w-full h-full object-cover" />
                </div>
              </Pop>
            ))}
            {[3, 4].map((idx, i) => (
              <Pop key={idx} delay={0.28 + i * 0.08} className="rounded-3xl overflow-hidden shadow-lg" style={{ height: '160px' }}>
                <div className="w-full h-full active:opacity-80 transition-opacity" onClick={() => setLightboxIndex(idx)}>
                  <img src={PHOTOS[idx].src} onError={safeImg} alt="" className="w-full h-full object-cover" />
                </div>
              </Pop>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════
// SLIDE 4 – WISHES
// ═══════════════════════════════════════════════
function WishesSlide() {
  const wishes = [
    { label: 'Selalu sehat', desc: 'Jaga kesehatan yaa dan jangan lupa olahraga.' },
    { label: 'Bahagia selalu', desc: 'Semoga endut selalu bahagia disana.' },
    { label: 'Impian terwujud', desc: 'Semoga impian yang endut impikan cepat terwujud.' },
    { label: 'Rezeki berlimpah', desc: 'Semoga endut diberi rezeki yang melimpah.' },
    { label: 'Dikasihi banyak', desc: 'Semoga endut dikelilingi orang-orang peduli dan sayang sama endut.' },
    { label: 'Terus berkembang', desc: 'Jangan lupa untuk terus berkembang yaa di semua aspek kehidupan.' },
  ];
  return (
    <div className="min-h-[100dvh] flex flex-col bg-white">
      <Pop delay={0} className="relative h-[40vmax] max-h-[45vh] flex-shrink-0 overflow-hidden">
        <img src="/image/foto12.jpg" onError={safeImg} alt="Wishes" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-red-900/40 to-white" />
        <div className="absolute inset-x-0 bottom-5 px-6">
          <p className="text-[10px] tracking-[0.4em] uppercase text-red-200 font-semibold mb-1">Doa buat endut</p>
          <h2 className="text-white text-3xl font-black leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
            Harapan<br /><span className="italic text-red-200">yang kupanjatkan</span>
          </h2>
        </div>
      </Pop>
      <div className="flex-1 px-5 py-6">
        <div className="grid grid-cols-2 gap-3">
          {wishes.map((w, i) => (
            <Pop key={i} delay={0.05 + i * 0.07} className="bg-gradient-to-br from-red-50 to-white rounded-3xl p-4 border border-red-100 shadow-sm">
              <div className="w-6 h-6 bg-red-900 rounded-full mb-2 flex items-center justify-center">
                <span className="text-white text-xs">❤️</span>
              </div>
              <p className="text-red-900 font-bold text-[13px] mb-1">{w.label}</p>
              <p className="text-gray-400 text-[11px] font-light leading-relaxed">{w.desc}</p>
            </Pop>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// SLIDE 5 – CLOSING
// ═══════════════════════════════════════════════
function ClosingSlide({ isPlaying, toggleMusic }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-gradient-to-b from-red-950 to-red-900 overflow-hidden">
      <Pop delay={0} className="relative h-[38vmax] max-h-[42vh] flex-shrink-0 overflow-hidden">
        <img src="/image/foto13.jpg" onError={safeImg} alt="Closing" className="w-full h-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-red-900" />
      </Pop>

      <div className="flex-1 flex flex-col px-6 pb-8 pt-3">
        <Pop delay={0.05}><p className="text-red-300 text-[10px] tracking-[0.4em] uppercase font-semibold mb-3">Penutup</p></Pop>
        <Pop delay={0.12}>
          <h2 className="text-white text-4xl font-black leading-tight mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            Selamat<br /><span className="italic text-red-300">Ulang Tahun</span>
          </h2>
        </Pop>
        <Pop delay={0.19}>
          <p className="text-red-200 text-[13px] font-light leading-relaxed mb-5 max-w-xs">
            Semoga hari ini menjadi hari yang paling berkesan. semoga endut bahagia selamanyaa. ❤️
          </p>
        </Pop>

        <LoveFrameCamera />

        <Pop delay={0.48} className="mt-4">
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} onClick={toggleMusic}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-white/30 text-white rounded-full text-sm font-semibold active:bg-white/10 transition-colors">
            {isPlaying ? <><Pause size={15} /> Jeda Musik</> : <><Play size={15} /> Putar Musik</>}
          </motion.button>
        </Pop>
        <Pop delay={0.54}>
          <p className="text-red-400/50 text-xs mt-5 font-light text-center">dibuat dengan sepenuh hati — dariku ❤️</p>
        </Pop>
      </div>
    </div>
  );
}

// ─── PROGRESS DOTS ─────────────────────────────────────────────────
function ProgressDots({ total, current, onGo }) {
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2">
      {[...Array(total)].map((_, i) => (
        <motion.button
          key={i} onClick={() => onGo(i)}
          animate={{ width: current === i ? 24 : 6, backgroundColor: current === i ? '#991b1b' : '#fecaca' }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="h-1.5 rounded-full"
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════
const SLIDES = ['cover', 'greeting', 'letter', 'album', 'wishes', 'closing'];

export default function App() {
  const [unlocked, setUnlocked] = useState(() => getTargetDate() === null);
  const [opened, setOpened] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrollLocked, setScrollLocked] = useState(false);
  const [splashes, setSplashes] = useState([]);
  const audioRef = useRef(null);
  const total = SLIDES.length;

  const handleUnlock = useCallback(() => {
    setUnlocked(true);
    setIsPlaying(true);
  }, []);

  useEffect(() => {
    const handler = e => {
      if (Math.random() > 0.25) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const y = e.touches ? e.touches[0].clientY : e.clientY;
      const id = Date.now() + Math.random();
      setSplashes(prev => [...prev, { id, x, y }]);
      setTimeout(() => setSplashes(prev => prev.filter(s => s.id !== id)), 1200);
    };
    window.addEventListener('click', handler);
    window.addEventListener('touchstart', handler);
    return () => {
      window.removeEventListener('click', handler);
      window.removeEventListener('touchstart', handler);
    };
  }, []);

  const goTo = useCallback(idx => {
    if (idx < 0 || idx >= total || scrollLocked) return;
    setDirection(idx > currentSlide ? 1 : -1);
    setCurrentSlide(idx);
    setScrollLocked(true);
    setTimeout(() => setScrollLocked(false), 950);
  }, [currentSlide, total, scrollLocked]);

  const handleOpen = () => {
    setOpened(true);
    setCurrentSlide(1);
    if (audioRef.current) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const slideContainerRef = useRef(null);

  const toggleMusic = () => {
    if (isPlaying) { audioRef.current?.pause(); setIsPlaying(false); }
    else { audioRef.current?.play(); setIsPlaying(true); }
  };

  useEffect(() => {
    if (!opened) return;
    let startY = 0;
    let startX = 0;
    const onTouchStart = e => {
      startY = e.touches[0].clientY;
      startX = e.touches[0].clientX;
    };
    const onTouchEnd = e => {
      const diffY = startY - e.changedTouches[0].clientY;
      const diffX = startX - e.changedTouches[0].clientX;
      if (Math.abs(diffX) > Math.abs(diffY)) return;
      if (Math.abs(diffY) < 100) return;

      const container = slideContainerRef.current;
      if (container) {
        const isScrollable = container.scrollHeight > container.clientHeight + 15;
        if (isScrollable) {
          const isAtTop = container.scrollTop <= 10;
          const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 15;

          if (diffY > 0 && !isAtBottom) return;
          if (diffY < 0 && !isAtTop) return;
        }
      }
      goTo(currentSlide + (diffY > 0 ? 1 : -1));
    };
    const onWheel = e => {
      if (Math.abs(e.deltaY) < 70) return;
      const container = slideContainerRef.current;
      if (container) {
        const isScrollable = container.scrollHeight > container.clientHeight + 15;
        if (isScrollable) {
          const isAtTop = container.scrollTop <= 10;
          const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 15;

          if (e.deltaY > 0 && !isAtBottom) return;
          if (e.deltaY < 0 && !isAtTop) return;
        }
      }
      goTo(currentSlide + (e.deltaY > 0 ? 1 : -1));
    };
    const onKey = e => {
      if (e.key === 'ArrowDown') goTo(currentSlide + 1);
      if (e.key === 'ArrowUp') goTo(currentSlide - 1);
    };
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
    };
  }, [opened, currentSlide, goTo]);

  const variants = {
    enter: d => ({ y: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { y: 0, opacity: 1 },
    exit: d => ({ y: d > 0 ? '-100%' : '100%', opacity: 0 }),
  };

  const renderSlide = id => {
    switch (id) {
      case 'cover': return <CoverSlide onOpen={handleOpen} />;
      case 'greeting': return <GreetingSlide />;
      case 'letter': return <LetterSlide />;
      case 'album': return <AlbumSlide />;
      case 'wishes': return <WishesSlide />;
      case 'closing': return <ClosingSlide isPlaying={isPlaying} toggleMusic={toggleMusic} />;
      default: return null;
    }
  };

  return (
    <div className="w-screen h-[100dvh] overflow-hidden relative">
      {BG_HEARTS.map(h => <FloatingHeart key={h.id} h={h} />)}
      <HeartSplash splashes={splashes} />
      <audio ref={audioRef} src="/song/lagu.mp3" loop />

      <AnimatePresence>
        {!unlocked && <CountdownPage onUnlock={handleUnlock} audioRef={audioRef} />}
      </AnimatePresence>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          ref={slideContainerRef}
          key={currentSlide} custom={direction} variants={variants}
          initial="enter" animate="center" exit="exit"
          transition={{ duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }}
          className="absolute inset-0 overflow-y-auto overscroll-contain"
        >
          {renderSlide(SLIDES[currentSlide])}
        </motion.div>
      </AnimatePresence>

      {opened && <ProgressDots total={total} current={currentSlide} onGo={goTo} />}

      {opened && (
        <motion.button
          whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={toggleMusic}
          className="fixed bottom-5 left-5 z-50 bg-white/90 backdrop-blur border border-red-100 shadow-lg text-red-700 p-3 rounded-full"
        >
          {isPlaying ? <Pause size={18} /> : <Music size={18} />}
        </motion.button>
      )}
    </div>
  );
}
