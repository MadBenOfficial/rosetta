'use client';

import { RotateCw, TriangleAlert } from 'lucide-react';
import { CONTRACT_ADDRESS, EXPLORER } from '@/lib/contract';

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  const notFound = /not found|reverted|no contract/i.test(message);
  return (
    <div className="slab-shell">
      <div className="slab-core flex flex-col items-center px-6 py-14 text-center">
        <TriangleAlert size={26} className="text-danger" />
        <h3 className="mt-4 font-display text-lg text-ink">The stone could not be read</h3>
        <p className="mt-2 max-w-md font-body text-[13.5px] leading-relaxed text-muted">
          {notFound
            ? 'No contract responded at the configured address on Bradbury. The deployment may still be propagating, or needs to be repaired.'
            : 'The reconciliation board could not reach the contract. The network may be rate limiting or briefly unreachable.'}
        </p>
        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={onRetry}
            className="flex items-center gap-2 rounded-sm border border-gold/30 bg-gold/10 px-4 py-2 font-mono text-[12px] text-gold transition-all hover:bg-gold/20 active:scale-[0.98]"
          >
            <RotateCw size={13} />
            Retry
          </button>
          <a
            href={`${EXPLORER}/address/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[12px] text-muted underline decoration-dotted underline-offset-2 hover:text-ink"
          >
            Inspect on explorer
          </a>
        </div>
      </div>
    </div>
  );
}
