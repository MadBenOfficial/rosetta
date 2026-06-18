'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // surfaced for diagnostics; the page stays usable via reset
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-gold">Rosetta</p>
      <h1 className="engrave mt-3 font-display text-3xl text-ink">A crack ran through the stone</h1>
      <p className="mt-3 max-w-md font-body text-[14px] leading-relaxed text-muted">
        Something interrupted the page. The chain state is unaffected. Re-cut the view and the
        reconciliation board will reload.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-sm border border-gold/30 bg-gold/10 px-5 py-2.5 font-mono text-[12px] uppercase tracking-[0.16em] text-gold transition-all hover:bg-gold/20 active:scale-[0.98]"
      >
        Re-cut the view
      </button>
    </div>
  );
}
