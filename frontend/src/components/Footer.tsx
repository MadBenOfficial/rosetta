'use client';

import { CONTRACT_ADDRESS, DEPLOY_TX, EXPLORER, FAUCET, IS_DEPLOYED } from '@/lib/contract';
import { shortAddr } from '@/lib/format';

// A single engraved baseline: no columns, one centered line of marks.
export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5">
      <div className="mx-auto max-w-6xl px-5 py-8">
        <div className="seam-line mx-auto mb-6 h-px w-2/3" />
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-mono text-[11px] text-faint">
          <span className="text-muted">Rosetta</span>
          <span className="text-faint/40">/</span>
          <span>GenLayer Bradbury Testnet</span>
          {IS_DEPLOYED && (
            <>
              <span className="text-faint/40">/</span>
              <a
                href={`${EXPLORER}/address/${CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-gold"
              >
                contract {shortAddr(CONTRACT_ADDRESS)}
              </a>
            </>
          )}
          {DEPLOY_TX && (
            <>
              <span className="text-faint/40">/</span>
              <a
                href={`${EXPLORER}/tx/${DEPLOY_TX}`}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-gold"
              >
                deploy {shortAddr(DEPLOY_TX)}
              </a>
            </>
          )}
          <span className="text-faint/40">/</span>
          <a href={FAUCET} target="_blank" rel="noreferrer" className="transition-colors hover:text-gold">
            Faucet
          </a>
        </div>
        <p className="mt-5 text-center font-body text-[11px] text-faint/70">
          No deposit, no custody. Only the network fee to set a voice on the stone.
        </p>
      </div>
    </footer>
  );
}
