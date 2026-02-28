import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Layers } from 'lucide-react';

interface ImageModalProps {
  src: string;
  alt: string;
  overlaySrc?: string;
  onClose: () => void;
}

export default function ImageModal({ src, alt, overlaySrc, onClose }: ImageModalProps) {
  const [showOverlay, setShowOverlay] = useState(false);
  const activeSrc = showOverlay && overlaySrc ? overlaySrc : src;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center"
        onClick={e => e.stopPropagation()}
      >
        <img
          src={activeSrc}
          alt={alt}
          className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
        />
        <div className="absolute top-3 right-3 flex gap-2">
          {overlaySrc && (
            <button
              onClick={() => setShowOverlay(!showOverlay)}
              className={`p-2 rounded-full backdrop-blur-md transition-all ${showOverlay ? 'bg-accent-green/30 text-accent-green' : 'bg-black/50 text-white/70 hover:text-white'}`}
              title="Toggle overlay"
            >
              <Layers size={18} />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/50 text-white/70 hover:text-white backdrop-blur-md transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Reusable thumbnail component
export function ImageThumbnail({ src, alt, overlaySrc, className = '' }: {
  src: string;
  alt: string;
  overlaySrc?: string;
  className?: string;
}) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <img
        src={src}
        alt={alt}
        onClick={() => setModalOpen(true)}
        className={`cursor-pointer rounded-lg border border-border/30 hover:border-primary/30 transition-all hover:shadow-lg ${className}`}
      />
      <AnimatePresence>
        {modalOpen && (
          <ImageModal src={src} alt={alt} overlaySrc={overlaySrc} onClose={() => setModalOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
