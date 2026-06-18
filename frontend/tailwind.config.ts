import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        basalt: 'rgb(var(--basalt-rgb) / <alpha-value>)',
        slab: 'rgb(var(--slab-rgb) / <alpha-value>)',
        slab2: 'rgb(var(--slab-2-rgb) / <alpha-value>)',
        seam: 'var(--seam)',
        chisel: 'var(--chisel)',
        ink: 'rgb(var(--ink-rgb) / <alpha-value>)',
        muted: 'rgb(var(--muted-rgb) / <alpha-value>)',
        faint: 'rgb(var(--faint-rgb) / <alpha-value>)',
        ochre: 'rgb(var(--ochre-rgb) / <alpha-value>)',
        cyan: 'rgb(var(--cyan-rgb) / <alpha-value>)',
        gold: 'rgb(var(--gold-rgb) / <alpha-value>)',
        danger: 'rgb(var(--danger-rgb) / <alpha-value>)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Petrona', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        xs: '2px',
        sm: '4px',
      },
      keyframes: {
        'seam-pulse': {
          '0%,100%': { opacity: '0.35' },
          '50%': { opacity: '0.9' },
        },
        'rise': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'etch': {
          '0%': { 'stroke-dashoffset': '1' },
          '100%': { 'stroke-dashoffset': '0' },
        },
      },
      animation: {
        'seam-pulse': 'seam-pulse 3.2s ease-in-out infinite',
        'rise': 'rise 0.6s cubic-bezier(0.16,1,0.3,1) both',
      },
    },
  },
  plugins: [],
};

export default config;
