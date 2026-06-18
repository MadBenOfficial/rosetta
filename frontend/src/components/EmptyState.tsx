'use client';

import { SeamMark } from '@/components/Glyphs';

export function EmptyState({ onOpen, canOpen }: { onOpen: () => void; canOpen: boolean }) {
  return (
    <div className="slab-shell">
      <div className="slab-core flex flex-col items-center px-6 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-sm border border-white/8 bg-white/[0.02]">
          <SeamMark size={30} />
        </div>
        <h3 className="mt-5 font-display text-xl text-ink">The tablet is uncut</h3>
        <p className="mt-2 max-w-md font-body text-[14px] leading-relaxed text-muted">
          No brief has been opened on this stone yet. Write the first description of a thing
          you mean, then let a second voice answer in their own words. The seam forms only
          once both sides are carved.
        </p>
        <button
          onClick={onOpen}
          disabled={!canOpen}
          className="mt-6 rounded-sm border border-ochre/40 bg-ochre/10 px-5 py-2.5 font-mono text-[12px] uppercase tracking-[0.16em] text-ochre transition-all hover:bg-ochre/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {canOpen ? 'Open the first brief' : 'Connect a wallet to begin'}
        </button>
      </div>
    </div>
  );
}
