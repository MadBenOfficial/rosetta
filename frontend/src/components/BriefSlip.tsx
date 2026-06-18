'use client';

import { motion } from 'framer-motion';
import { Brief } from '@/lib/contract';
import { briefLabel, shortAddr } from '@/lib/format';

function StatusTag({ brief }: { brief: Brief }) {
  if (brief.status === 'RECONCILED') {
    const aligned = brief.alignment === 'ALIGNED';
    return (
      <span
        className={`rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] ${
          aligned ? 'border-cyan/40 bg-cyan/10 text-cyan' : 'border-gold/40 bg-gold/10 text-gold'
        }`}
      >
        {aligned ? 'Aligned' : `${brief.divergence_count} divergent`}
      </span>
    );
  }
  if (brief.status === 'OPEN')
    return (
      <span className="rounded-sm border border-gold/30 bg-gold/5 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-gold">
        Ready to reconcile
      </span>
    );
  return (
    <span className="rounded-sm border border-white/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
      Awaiting party B
    </span>
  );
}

export function BriefSlip({
  brief,
  active,
  pending,
  onSelect,
}: {
  brief: Brief;
  active: boolean;
  pending?: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      layout
      onClick={onSelect}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: pending ? 0.65 : 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`group w-full text-left slab-shell transition-all ${
        active ? 'ring-1 ring-gold/40' : 'hover:ring-1 hover:ring-white/10'
      } ${pending ? 'border-dashed' : ''}`}
    >
      <div className="slab-core p-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
            {briefLabel(brief.id)}
          </span>
          <StatusTag brief={brief} />
        </div>

        <div className="mt-3 grid grid-cols-[1fr_1px_1fr] gap-3">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-ochre">A</p>
            <p className="mt-1 line-clamp-3 font-body text-[12.5px] leading-snug text-ink">{brief.party_a}</p>
          </div>
          <div className="bg-white/5" />
          <div>
            <p className="text-right font-mono text-[9px] uppercase tracking-[0.16em] text-cyan">B</p>
            <p className="mt-1 line-clamp-3 text-right font-body text-[12.5px] leading-snug text-ink">
              {brief.party_b || <span className="italic text-faint">no answer yet</span>}
            </p>
          </div>
        </div>

        {brief.status === 'RECONCILED' && brief.reconciled_spec && (
          <div className="mt-3 border-t border-dashed border-gold/20 pt-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-gold">Reconciled</p>
            <p className="mt-1 line-clamp-2 font-body text-[12.5px] leading-snug text-muted">
              {brief.reconciled_spec}
            </p>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between font-mono text-[10px] text-faint">
          <span>{shortAddr(brief.a_addr)}</span>
          {pending && <span className="text-gold">Pending</span>}
        </div>
      </div>
    </motion.button>
  );
}
