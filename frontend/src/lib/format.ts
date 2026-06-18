export const shortAddr = (a: string, lead = 6, tail = 4): string => {
  const s = String(a ?? '');
  if (s.length <= lead + tail + 1) return s;
  return `${s.slice(0, lead)}\u2026${s.slice(-tail)}`;
};

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// A short, stable label for a brief: "Brief 03".
export function briefLabel(id: string): string {
  const n = id.replace(/[^0-9]/g, '');
  return n ? `Brief ${n.padStart(2, '0')}` : id;
}
