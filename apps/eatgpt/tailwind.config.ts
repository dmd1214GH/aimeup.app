import type { Config } from 'tailwindcss';
export default {
  content: ['./app/**/*.{tsx,ts}', './components/**/*.{tsx,ts}'],
  theme: { extend: {} },
  plugins: []
} satisfies Config;
