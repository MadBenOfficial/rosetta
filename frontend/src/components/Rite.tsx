'use client';

import { motion } from 'framer-motion';

const STEPS = [
  {
    n: '01',
    title: 'A voice is carved',
    body: 'Party A writes, in their own words, what they mean by the thing. It is set on the left of the stone, awaiting an answer.',
    accent: 'text-ochre',
  },
  {
    n: '02',
    title: 'A second voice answers, blind',
    body: 'A different account describes the same thing from scratch, never seeing side A. Two independent readings of one intent now face each other.',
    accent: 'text-cyan',
  },
  {
    n: '03',
    title: 'The Mediator weaves the seam',
    body: 'On reconcile, an impartial Mediator reads both descriptions and writes one specification that honours what both actually mean, listing every concrete disagreement.',
    accent: 'text-gold',
  },
  {
    n: '04',
    title: 'Consensus seals the count',
    body: 'Validators each re-run the reading and must converge, within a margin, on the same count of real divergences before the reconciliation is written to the stone.',
    accent: 'text-gold',
  },
];

export function Rite() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-20">
      <div className="mb-10 text-center">
        <h2 className="engrave font-display text-3xl text-ink">How the seam forms</h2>
        <p className="mt-2 font-body text-[14px] text-muted">
          Four marks, left to right, from two descriptions to one reconciled stone.
        </p>
      </div>

      <div className="relative pl-8">
        {/* the engraved spine */}
        <div className="seam-line absolute bottom-2 left-[7px] top-2 w-px" />
        <div className="flex flex-col gap-9">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <span className="absolute -left-8 top-1 flex h-4 w-4 items-center justify-center rounded-full border border-gold/40 bg-basalt">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              </span>
              <p className={`font-mono text-[11px] tracking-[0.2em] ${s.accent}`}>{s.n}</p>
              <h3 className="mt-1 font-display text-xl text-ink">{s.title}</h3>
              <p className="mt-1.5 max-w-xl font-body text-[14px] leading-relaxed text-muted">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
