'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

export interface ConfirmProps {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, body, confirmLabel = 'Continue', onConfirm, onCancel }: ConfirmProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            className="w-full max-w-md slab-shell"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="slab-core p-6">
              <div className="flex items-start justify-between">
                <h3 className="font-display text-xl text-ink">{title}</h3>
                <button onClick={onCancel} aria-label="Cancel" className="text-faint hover:text-ink">
                  <X size={18} />
                </button>
              </div>
              <p className="mt-3 font-body text-[14px] leading-relaxed text-muted">{body}</p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={onCancel}
                  className="rounded-sm border border-white/10 px-4 py-2 font-mono text-[12px] text-muted transition-colors hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className="rounded-sm border border-gold/40 bg-gold/15 px-4 py-2 font-mono text-[12px] uppercase tracking-[0.14em] text-gold transition-all hover:bg-gold/25 active:scale-[0.98]"
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
