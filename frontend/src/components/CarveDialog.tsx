'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { LIMITS } from '@/lib/contract';

export interface CarveProps {
  open: boolean;
  side: 'A' | 'B';
  title: string;
  hint: string;
  placeholder: string;
  busy: boolean;
  onSubmit: (text: string) => void;
  onCancel: () => void;
}

export function CarveDialog({ open, side, title, hint, placeholder, busy, onSubmit, onCancel }: CarveProps) {
  const [text, setText] = useState('');
  const len = text.trim().length;
  const tooShort = len > 0 && len < LIMITS.party.min;
  const tooLong = len > LIMITS.party.max;
  const valid = len >= LIMITS.party.min && len <= LIMITS.party.max;
  const badge =
    side === 'A'
      ? 'border-ochre/40 bg-ochre/10 text-ochre'
      : 'border-cyan/40 bg-cyan/10 text-cyan';
  const submitBtn =
    side === 'A'
      ? 'border-ochre/40 bg-ochre/15 text-ochre hover:bg-ochre/25'
      : 'border-cyan/40 bg-cyan/15 text-cyan hover:bg-cyan/25';

  function handleClose() {
    if (busy) return;
    setText('');
    onCancel();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="w-full max-w-lg slab-shell"
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.98 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="slab-core p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-sm border font-mono text-[12px] ${badge}`}>
                    {side}
                  </span>
                  <h3 className="font-display text-xl text-ink">{title}</h3>
                </div>
                <button onClick={handleClose} aria-label="Cancel" className="text-faint hover:text-ink" disabled={busy}>
                  <X size={18} />
                </button>
              </div>

              <p className="mt-2 font-body text-[13.5px] leading-relaxed text-muted">{hint}</p>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={placeholder}
                rows={5}
                autoFocus
                disabled={busy}
                className="mt-4 w-full resize-none rounded-sm border border-white/10 bg-basalt/60 px-3.5 py-3 font-body text-[14px] leading-relaxed text-ink placeholder:text-faint focus:border-gold/40 focus:outline-none"
              />

              <div className="mt-1.5 flex items-center justify-between">
                <span className="font-body text-[12px] text-danger">
                  {tooShort ? `At least ${LIMITS.party.min} characters` : tooLong ? `At most ${LIMITS.party.max} characters` : ''}
                </span>
                <span className={`tabnum font-mono text-[11px] ${tooLong ? 'text-danger' : 'text-faint'}`}>
                  {len}/{LIMITS.party.max}
                </span>
              </div>

              <div className="mt-5 flex justify-end gap-3">
                <button
                  onClick={handleClose}
                  disabled={busy}
                  className="rounded-sm border border-white/10 px-4 py-2 font-mono text-[12px] text-muted transition-colors hover:text-ink disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => valid && onSubmit(text.trim())}
                  disabled={!valid || busy}
                  className={`rounded-sm border px-5 py-2 font-mono text-[12px] uppercase tracking-[0.14em] transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${submitBtn}`}
                >
                  {busy ? 'Confirm in wallet' : 'Carve onto the stone'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
