import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: '#FF7A18',
        brandHover: '#E96A0F',
        brandSoft: '#FFF1E8',
        brandBorder: '#FFD6BD',
        brandText: '#A63C00',
        ink: '#111827',
        muted: '#6B7280',
      },
    },
  },
  plugins: [],
}
export default config

