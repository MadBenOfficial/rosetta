import { createClient } from 'genlayer-js';
import { testnetBradbury } from 'genlayer-js/chains';

// rosetta intelligent contract on GenLayer Bradbury Testnet.
// Overwrite CONTRACT_ADDRESS (and DEPLOY_TX) after deploy.
export const CONTRACT_ADDRESS = '0xf76d5aF87A52fF5D4a450A9D130984eB878d488c';
export const DEPLOY_TX: string = '0xc7b5ab53659d357043b18c723cd0a251a78da18fd40bc365134fb9e945b028d0';

// A string-typed zero so the literal comparison below never trips TS2367.
const ZERO: string = '0x0000000000000000000000000000000000000000';
export const IS_DEPLOYED: boolean = CONTRACT_ADDRESS !== ZERO;

export const EXPLORER = 'https://explorer-bradbury.genlayer.com';
export const FAUCET = 'https://testnet-faucet.genlayer.foundation/';

export const BRADBURY_PARAMS = {
  chainId: '0x107D', // 4221
  chainName: 'GenLayer Bradbury Testnet',
  nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 },
  rpcUrls: ['https://rpc-bradbury.genlayer.com'],
  blockExplorerUrls: ['https://explorer-bradbury.genlayer.com/'],
};

export const readClient = createClient({ chain: testnetBradbury });

export const makeWalletClient = (account: `0x${string}`) =>
  createClient({ chain: testnetBradbury, account });

export type WalletClient = ReturnType<typeof makeWalletClient>;

const ADDRESS = CONTRACT_ADDRESS as `0x${string}`;

export const shortAddr = (a: string, lead = 6, tail = 4): string => {
  const s = String(a ?? '');
  if (s.length <= lead + tail + 1) return s;
  return `${s.slice(0, lead)}\u2026${s.slice(-tail)}`;
};

// ---- bounds mirrored from the contract -----------------------------------

export const LIMITS = {
  party: { min: 8, max: 500 },
} as const;

export type Status = 'AWAITING_B' | 'OPEN' | 'RECONCILED' | '';
export type Alignment = 'ALIGNED' | 'DIVERGENT' | '';

export interface Brief {
  id: string;
  party_a: string;
  party_b: string;
  a_addr: string;
  b_addr: string;
  status: Status;
  created: string;
  divergence_count: number;
  alignment: Alignment;
  reconciled_spec: string;
  divergences: string[];
}

export interface Stats {
  briefs: number;
  reconciled: number;
}

// ---- resilient reads -----------------------------------------------------

export async function withRpcRetry<T>(fn: () => Promise<T>, tries = 4): Promise<T> {
  let last: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      // "not found" is included: a freshly deployed contract or a just-sent tx
      // can briefly read as missing while the node catches up.
      if (!/rate limit|429|timeout|network|fetch|too many|not found/i.test(String(e))) throw e;
      // backoff: 2.5s, 5s, 10s, 20s
      await new Promise((r) => setTimeout(r, 2500 * 2 ** i));
    }
  }
  throw last;
}

function toRecord<T>(value: unknown): T {
  if (value instanceof Map) {
    const obj: Record<string, unknown> = {};
    for (const [k, v] of value.entries()) obj[String(k)] = normalize(v);
    return obj as T;
  }
  return value as T;
}

function normalize(value: unknown): unknown {
  if (value instanceof Map) return toRecord(value);
  if (Array.isArray(value)) return value.map(normalize);
  if (typeof value === 'bigint') return value.toString();
  return value;
}

function num(v: unknown): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'bigint') return Number(v);
  const n = Number(String(v ?? '0'));
  return Number.isFinite(n) ? n : 0;
}

function str(v: unknown): string {
  return String(v ?? '');
}

function asStatus(v: unknown): Status {
  const s = str(v).toUpperCase();
  return s === 'AWAITING_B' || s === 'OPEN' || s === 'RECONCILED' ? (s as Status) : '';
}

function asAlignment(v: unknown): Alignment {
  const s = str(v).toUpperCase();
  return s === 'ALIGNED' || s === 'DIVERGENT' ? (s as Alignment) : '';
}

export function asBrief(raw: unknown): Brief {
  const r = toRecord<Record<string, unknown>>(raw);
  const divs = Array.isArray(r.divergences)
    ? (normalize(r.divergences) as unknown[]).map(str).filter((s) => s.length > 0)
    : [];
  return {
    id: str(r.id),
    party_a: str(r.party_a),
    party_b: str(r.party_b),
    a_addr: str(r.a_addr),
    b_addr: str(r.b_addr),
    status: asStatus(r.status),
    created: str(r.created),
    divergence_count: num(r.divergence_count),
    alignment: asAlignment(r.alignment),
    reconciled_spec: str(r.reconciled_spec),
    divergences: divs,
  };
}

export async function fetchBriefs(start = 0): Promise<Brief[]> {
  const raw = await withRpcRetry(() =>
    readClient.readContract({ address: ADDRESS, functionName: 'get_briefs', args: [BigInt(start)] }),
  );
  const arr = (normalize(raw) as unknown[]) ?? [];
  return arr.map(asBrief);
}

export async function fetchBrief(briefId: string): Promise<Brief | null> {
  const raw = await withRpcRetry(() =>
    readClient.readContract({ address: ADDRESS, functionName: 'get_brief', args: [briefId] }),
  );
  const r = toRecord<Record<string, unknown>>(normalize(raw));
  if (!r || !r.id) return null;
  return asBrief(r);
}

export async function fetchStats(): Promise<Stats> {
  const raw = await withRpcRetry(() =>
    readClient.readContract({ address: ADDRESS, functionName: 'get_stats', args: [] }),
  );
  const r = toRecord<Record<string, unknown>>(normalize(raw));
  return {
    briefs: num(r.briefs),
    reconciled: num(r.reconciled),
  };
}

// ---- writes --------------------------------------------------------------

export function openBrief(client: WalletClient, partyAText: string) {
  return client.writeContract({
    address: ADDRESS,
    functionName: 'open_brief',
    args: [partyAText],
    value: 0n,
  });
}

export function respondBrief(client: WalletClient, briefId: string, partyBText: string) {
  return client.writeContract({
    address: ADDRESS,
    functionName: 'respond',
    args: [briefId, partyBText],
    value: 0n,
  });
}

export function reconcileBrief(client: WalletClient, briefId: string) {
  return client.writeContract({
    address: ADDRESS,
    functionName: 'reconcile',
    args: [briefId],
    value: 0n,
  });
}

// ---- transaction polling -------------------------------------------------

const STATUS_NAME: Record<string, string> = {
  '1': 'PENDING',
  '2': 'PROPOSING',
  '3': 'COMMITTING',
  '4': 'REVEALING',
  '5': 'ACCEPTED',
  '6': 'UNDETERMINED',
  '7': 'FINALIZED',
  '8': 'CANCELED',
  '12': 'VALIDATORS_TIMEOUT',
  '13': 'LEADER_TIMEOUT',
};

export const statusName = (s: unknown): string =>
  STATUS_NAME[String(s)] ?? String(s ?? 'PENDING').toUpperCase();

// LEADER_TIMEOUT / VALIDATORS_TIMEOUT are intentionally absent: the network
// rotates the leader and retries, so keep polling through them.
const TERMINAL = new Set(['ACCEPTED', 'FINALIZED', 'UNDETERMINED', 'CANCELED']);

export interface LeaderDraft {
  divergence_count?: number;
  reconciled_spec?: string;
  divergences: string[];
}

function pick(obj: unknown, key: string): unknown {
  if (obj instanceof Map) return obj.get(key);
  if (obj && typeof obj === 'object') return (obj as Record<string, unknown>)[key];
  return undefined;
}

export function extractLeaderDraft(tx: unknown): LeaderDraft | null {
  try {
    const receipts = pick(pick(tx, 'consensus_data'), 'leader_receipt');
    const first = Array.isArray(receipts) ? receipts[0] : receipts;
    const b64 = pick(pick(first, 'eq_outputs'), '0');
    if (typeof b64 !== 'string' || b64.length === 0) return null;
    const text = atob(b64);
    for (let i = text.length - 1; i >= 0; i--) {
      if (text[i] !== '{') continue;
      try {
        const obj = JSON.parse(text.slice(i)) as Record<string, unknown>;
        if (
          obj &&
          typeof obj === 'object' &&
          ('divergence_count' in obj || 'reconciled_spec' in obj || 'divergences' in obj)
        ) {
          const divs = Array.isArray(obj.divergences)
            ? (obj.divergences as unknown[]).map(str).filter((s) => s.length > 0)
            : [];
          return {
            divergence_count: obj.divergence_count !== undefined ? num(obj.divergence_count) : undefined,
            reconciled_spec: obj.reconciled_spec !== undefined ? str(obj.reconciled_spec) : undefined,
            divergences: divs,
          };
        }
      } catch {
        /* keep scanning toward the start for a parseable object */
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function pollUntilDecided(
  client: WalletClient,
  hash: `0x${string}`,
  onUpdate?: (status: string, draft: LeaderDraft | null) => void,
): Promise<{ status: string; draft: LeaderDraft | null }> {
  let draft: LeaderDraft | null = null;
  for (let i = 0; i < 150; i++) {
    const tx = await client
      .getTransaction({ hash } as Parameters<typeof client.getTransaction>[0])
      .catch(() => null);
    const status = statusName(tx ? (tx as { status?: unknown }).status : 'PENDING');
    draft = extractLeaderDraft(tx) ?? draft;
    onUpdate?.(status, draft);
    if (TERMINAL.has(status)) return { status, draft };
    await new Promise((r) => setTimeout(r, 8000));
  }
  return { status: 'TIMEOUT', draft };
}

// ---- friendly error mapping ----------------------------------------------

export function friendlyError(e: unknown): string {
  const msg = String((e as { message?: string })?.message ?? e ?? '');
  if (/LackOfFundForMaxFee|insufficient funds|max fee/i.test(msg))
    return 'Your wallet is below the fee reserve for AI transactions (mostly refunded). Claim testnet GEN from the faucet and retry.';
  if (/reject|denied|4001|user rejected/i.test(msg)) return 'You cancelled the signature.';
  if (/rate limit|429|too many/i.test(msg)) return 'The network is rate limiting requests. Wait a moment and retry.';
  if (/timeout/i.test(msg)) return 'The network is congested. Your transaction is still being processed.';
  if (/not found/i.test(msg)) return 'No contract found at this address yet. It may still be propagating.';
  if (/execution reverted|reverted/i.test(msg)) return 'The contract rejected this action. Check the brief state and retry.';
  return msg.slice(0, 200) || 'Something went wrong. Please retry.';
}
