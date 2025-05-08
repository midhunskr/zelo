/** @type {import('tailwindcss').Config} */
export const content = [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
];
export const theme = {
    extend: {
        colors: {
            'zelo-blue': '#3B82F6',
            dark: '#1B1B1B',
            'dark-accent': '#202020',
            light: '#F1F1F1',
            'light-accent': '#E9E9E9',
            'text-primary-dark': '#111110',
            'text-secondary-dark': '#727272',
            'text-tertiary-dark': '#A8A8A8',
            'text-primary-light': '#F1F1F1',
            'text-secondary-light': '#A8A8A8',
            'text-tertiary-light': '#4C4C4C',
            orange: '#F5653C',
            green: '#91E76A',
            yellow: '#FDBC32',
            blue: '#37ACF4',
            purple: '#9A6BED',
        },
        fontFamily: {
            sans: ['Inter', 'sans-serif'],
            heading: ['Poppins', 'sans-serif'],
        },
        fontSize: {
            base: '16px',
            lg: '18px',
            xl: '20px',
            '2xl': '24px',
            '3xl': '30px',
        },
        spacing: {
            '2': '0.5rem',
            '4': '1rem',
            '6': '1.5rem',
            '8': '2rem',
            '10': '2.5rem',
            '12': '3rem',
        },
        borderRadius: {
            DEFAULT: '0.5rem',
            lg: '1rem',
        },
        boxShadow: {
            card: '0 4px 20px rgba(0, 0, 0, 0.1)',
            button: '0 2px 10px rgba(0, 0, 0, 0.1)',
        },
    },
};
export const plugins = [];
export const darkMode = 'class';