'use client';

export function Shimmer({ className = '' }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-sm bg-white/5 ${className}`}
      aria-hidden
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      <style>{`@keyframes shimmer{100%{transform:translateX(100%)}}`}</style>
    </div>
  );
}

export function SlipSkeleton() {
  return (
    <div className="slab-shell">
      <div className="slab-core p-5">
        <div className="flex items-center justify-between">
          <Shimmer className="h-3 w-20" />
          <Shimmer className="h-4 w-16" />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <Shimmer className="h-16 w-full" />
          <Shimmer className="h-16 w-full" />
        </div>
        <Shimmer className="mt-4 h-3 w-3/4" />
      </div>
    </div>
  );
}
