'use client';

// Bespoke engraved glyphs for the two parties and the reconciled seam.
// Party A reads as an ascending ochre column of marks; party B a descending
// cyan column; the seam is two strokes meeting at a single point.

export function GlyphA({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 5h6M5 10h9M5 15h6M5 20h11" stroke="rgb(var(--ochre-rgb))" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="19" cy="5" r="1.4" fill="rgb(var(--ochre-rgb))" />
    </svg>
  );
}

export function GlyphB({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M19 5H8M19 10h-9M19 15h-6M19 20H8" stroke="rgb(var(--cyan-rgb))" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="5" cy="20" r="1.4" fill="rgb(var(--cyan-rgb))" />
    </svg>
  );
}

export function SeamMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 5c6 0 8 3.5 8 7s2 7 8 7" stroke="rgb(var(--ochre-rgb))" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
      <path d="M20 5c-6 0-8 3.5-8 7s-2 7-8 7" stroke="rgb(var(--cyan-rgb))" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
      <circle cx="12" cy="12" r="1.8" fill="rgb(var(--gold-rgb))" />
    </svg>
  );
}

// The wordmark mark: two columns of stone converging into a single seam.
export function RosettaMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden>
      <rect x="3" y="4" width="12" height="28" rx="1.5" fill="rgba(215,164,76,0.12)" stroke="rgb(var(--ochre-rgb))" strokeWidth="1.1" />
      <rect x="21" y="4" width="12" height="28" rx="1.5" fill="rgba(111,183,201,0.12)" stroke="rgb(var(--cyan-rgb))" strokeWidth="1.1" />
      <line x1="18" y1="4" x2="18" y2="32" stroke="rgb(var(--gold-rgb))" strokeWidth="1.4" strokeDasharray="2 2.5" />
      <circle cx="18" cy="18" r="2.1" fill="rgb(var(--gold-rgb))" />
    </svg>
  );
}
