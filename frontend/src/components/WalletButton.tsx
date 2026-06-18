'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Copy, LogOut, Wallet } from 'lucide-react';
import { FAUCET } from '@/lib/contract';
import { shortAddr, copyText } from '@/lib/format';
import type { useWallet } from '@/hooks/useWallet';

type WalletApi = ReturnType<typeof useWallet>;

function fmtGen(wei: bigint): string {
  const whole = wei / 10n ** 18n;
  const frac = (wei % 10n ** 18n).toString().padStart(18, '0').slice(0, 3).replace(/0+$/, '');
  return frac ? `${whole}.${frac}` : whole.toString();
}

export function WalletButton({ wallet }: { wallet: WalletApi }) {
  const { address, onBradbury, connecting, connect, disconnect, hasProvider } = wallet;
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!address) return setBalance(null);
      try {
        const eth = (window as unknown as { ethereum?: { request: (a: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum;
        if (!eth) return;
        const hex = (await eth.request({ method: 'eth_getBalance', params: [address, 'latest'] })) as string;
        if (alive) setBalance(fmtGen(BigInt(hex)));
      } catch {
        /* ignore */
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [address, open]);

  if (!address) {
    return (
      <button
        onClick={connect}
        disabled={connecting}
        className="group flex items-center gap-2 rounded-sm border border-gold/30 bg-gold/10 px-3.5 py-2 font-mono text-[12px] uppercase tracking-[0.16em] text-gold transition-all hover:bg-gold/20 active:scale-[0.98] disabled:opacity-60"
      >
        <Wallet size={14} />
        {connecting ? 'Opening' : hasProvider ? 'Connect' : 'No wallet'}
      </button>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-sm border border-white/10 bg-slab2/70 px-3 py-2 font-mono text-[12px] text-ink transition-colors hover:border-gold/30"
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${onBradbury ? 'bg-cyan' : 'bg-danger'}`}
          aria-hidden
        />
        {shortAddr(address)}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 z-50 mt-2 w-72 slab-shell"
          >
            <div className="slab-core p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">Signer</p>
              <p className="mt-1 break-all font-mono text-[12px] text-ink">{address}</p>
              <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
                <span className="font-mono text-[11px] text-muted">Balance</span>
                <span className="tabnum font-mono text-[12px] text-gold">{balance ?? '...'} GEN</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-mono text-[11px] text-muted">Network</span>
                <span className={`font-mono text-[11px] ${onBradbury ? 'text-cyan' : 'text-danger'}`}>
                  {onBradbury ? 'Bradbury' : 'Wrong network'}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/5 pt-3">
                <button
                  onClick={async () => {
                    if (await copyText(address)) {
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1400);
                    }
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-sm border border-white/10 px-2 py-1.5 font-mono text-[11px] text-ink transition-colors hover:border-gold/30"
                >
                  {copied ? <Check size={13} className="text-cyan" /> : <Copy size={13} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  onClick={() => {
                    disconnect();
                    setOpen(false);
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-sm border border-white/10 px-2 py-1.5 font-mono text-[11px] text-muted transition-colors hover:border-danger/40 hover:text-danger"
                >
                  <LogOut size={13} />
                  Disconnect
                </button>
              </div>
              <a
                href={FAUCET}
                target="_blank"
                rel="noreferrer"
                className="mt-2 block rounded-sm border border-gold/20 bg-gold/5 px-2 py-1.5 text-center font-mono text-[11px] text-gold transition-colors hover:bg-gold/10"
              >
                Claim testnet GEN
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
