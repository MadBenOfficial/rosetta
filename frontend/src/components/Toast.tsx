'use client';

import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, CircleAlert, Info, Loader, X } from 'lucide-react';

export type ToastKind = 'loading' | 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
  href?: string;
  hrefLabel?: string;
}

interface ToastCtx {
  push: (t: Omit<Toast, 'id'>) => number;
  update: (id: number, t: Partial<Omit<Toast, 'id'>>) => void;
  dismiss: (id: number) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

export function useToast(): ToastCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const ICONS: Record<ToastKind, React.ReactNode> = {
  loading: <Loader size={16} className="animate-spin text-gold" />,
  success: <Check size={16} className="text-cyan" />,
  error: <CircleAlert size={16} className="text-danger" />,
  info: <Info size={16} className="text-muted" />,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seq = useRef(1);
  const timers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const schedule = useCallback(
    (id: number, kind: ToastKind) => {
      if (timers.current[id]) clearTimeout(timers.current[id]);
      if (kind === 'success' || kind === 'info') {
        timers.current[id] = setTimeout(() => dismiss(id), 8000);
      }
    },
    [dismiss],
  );

  const push = useCallback(
    (t: Omit<Toast, 'id'>) => {
      const id = seq.current++;
      setToasts((list) => [...list, { ...t, id }]);
      schedule(id, t.kind);
      return id;
    },
    [schedule],
  );

  const update = useCallback(
    (id: number, patch: Partial<Omit<Toast, 'id'>>) => {
      setToasts((list) => list.map((t) => (t.id === id ? { ...t, ...patch } : t)));
      if (patch.kind) schedule(id, patch.kind);
    },
    [schedule],
  );

  return (
    <Ctx.Provider value={{ push, update, dismiss }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[80] flex w-[min(92vw,380px)] flex-col gap-2">
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="slab-shell"
            >
              <div className="slab-core flex items-start gap-3 px-3.5 py-3">
                <span className="mt-0.5 shrink-0">{ICONS[t.kind]}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] leading-snug text-ink">{t.message}</p>
                  {t.href && (
                    <a
                      href={t.href}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block font-mono text-[11px] text-gold underline decoration-dotted underline-offset-2"
                    >
                      {t.hrefLabel ?? 'View on explorer'}
                    </a>
                  )}
                </div>
                <button
                  onClick={() => dismiss(t.id)}
                  aria-label="Dismiss"
                  className="shrink-0 text-faint transition-colors hover:text-ink"
                >
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}
