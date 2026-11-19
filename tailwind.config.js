/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0b0f19',
        card: '#111827',
        border: '#1f2937',
        ig: {
          orange: '#f09433',
          coral: '#e6683c',
          red: '#dc2743',
          pink: '#cc2366',
          purple: '#bc1888',
        },
      },
      backgroundImage: {
        'ig-gradient': 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
        'ig-subtle': 'linear-gradient(135deg, rgba(240, 148, 51, 0.15) 0%, rgba(220, 39, 67, 0.15) 50%, rgba(188, 24, 136, 0.15) 100%)',
      },
    },
  },
  plugins: [],
};
