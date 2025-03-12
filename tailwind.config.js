/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
	  "./src/pages/**/*.{js,ts,jsx,tsx}",
	  "./src/components/**/*.{js,ts,jsx,tsx}",
	],
	darkMode: 'class',
	theme: {
	  extend: {
		fontFamily: {
		  sans: ['Inter', 'sans-serif'],
		},
		colors: {
		  blue: {
			100: '#E6F0FD',
			200: '#CCE1FC',
			300: '#99C4FA',
			400: '#66A6F7',
			500: '#3388F5',
			600: '#0066F3',
			700: '#0052C2',
			800: '#003D92',
			900: '#002961',
		  },
		},
		spacing: {
		  '72': '18rem',
		  '84': '21rem',
		  '96': '24rem',
		},
		boxShadow: {
		  'matrix': '0 0 8px rgba(0, 0, 0, 0.1)',
		},
	  },
	},
	variants: {
	  extend: {
		opacity: ['disabled'],
		cursor: ['disabled'],
		backgroundColor: ['active', 'disabled'],
		textColor: ['active', 'disabled'],
	  },
	},
	plugins: [
	  require('@tailwindcss/forms'),
	],
  }