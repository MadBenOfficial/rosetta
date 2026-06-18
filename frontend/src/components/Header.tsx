'use client';

import { CONTRACT_ADDRESS, EXPLORER, IS_DEPLOYED } from '@/lib/contract';
import { shortAddr } from '@/lib/format';
import { GlyphA, GlyphB } from '@/components/Glyphs';
import { WalletButton } from '@/components/WalletButton';
import type { useWallet } from '@/hooks/useWallet';

export function Header({ wallet }: { wallet: ReturnType<typeof useWallet> }) {
  return (
    <header className="relative z-10 border-b border-white/5">
      <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 py-4">
        {/* network to the left */}
        <div className="hidden items-center gap-2 justify-self-start sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan" aria-hidden />
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            Bradbury Testnet
          </span>
        </div>

        {/* centered chiseled nameplate, party glyphs flanking */}
        <div className="flex items-center gap-3 justify-self-center">
          <GlyphA size={22} />
          <div className="text-center">
            <h1 className="engrave font-display text-2xl font-600 leading-none tracking-tight text-ink">
              Rosetta
            </h1>
            <p className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.34em] text-faint">
              Two voices, one stone
            </p>
          </div>
          <GlyphB size={22} />
        </div>

        {/* wallet to the right */}
        <div className="justify-self-end">
          <WalletButton wallet={wallet} />
        </div>
      </div>

      {IS_DEPLOYED && (
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-5 pb-2">
          <a
            href={`${EXPLORER}/address/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[10px] text-faint transition-colors hover:text-gold"
          >
            contract {shortAddr(CONTRACT_ADDRESS)}
          </a>
        </div>
      )}
    </header>
  );
}
