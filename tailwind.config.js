/** @type {import('tailwindcss').Config} */
import plugin from 'tailwindcss/plugin';

export const content = [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
];
export const theme = {
    extend: {
        colors: {
            'zelo-blue': '#3B82F6',
            dark: '#202020',
            'dark-accent': '#282828FF',
            light: '#F1F1F1',
            'light-accent': '#E5E5E5',
            'text-primary-dark': '#111110',
            'text-secondary-dark': '#727272',
            'text-tertiary-dark': '#A8A8A8',
            'text-primary-light': '#F1F1F1',
            'text-secondary-light': '#A8A8A8',
            'text-tertiary-light': '#4C4C4C',
            orange: '#F5653C',
            green: '#56D271',
            yellow: '#FDBC32',
            blue: '#37ACF4',
            purple: '#9A6BED',
            lightBg: '#F1F1F1',
            darkBg: '#282828',
            primaryText: '#1B1B1B',
            secondaryText: '#727272',
            'inner-surface-dark': '#242424',
            'inner-surface-light': '#f1f1f1',
            'card-stroke-dark': '#f1f1f10e',
            'card-stroke-light': '#f6f6f6',
        },
        backgroundImage: {
            'card-dark-outer': 'linear-gradient(to bottom, rgba(253, 253, 253, 0.010000000819563875) 0%, rgba(253, 253, 253, 0.04000000074505806) 100%)',
            'card-light-outer': 'linear-gradient(to bottom, rgba(253, 253, 253, 0.22500000894069672) 0%,rgba(253, 253, 253, 0.75) 100%)',
        },
        boxShadow: {
            'card-light': `
                0px 32px 64px -12px rgba(0, 0, 0, 0.05),
                0px 2.15px 0.5px -2px rgba(0, 0, 0, 0.25),
                0px 24px 24px -16px rgba(8, 8, 8, 0.04),
                0px 6px 13px 0px rgba(8, 8, 8, 0.03),
                0px 6px 4px -4px rgba(8, 8, 8, 0.05),
                0px 5px 1.5px -4px rgba(8, 8, 8, 0.05)
                `,
            'card-dark': `
                0px 16px 24px -13px rgba(0, 0, 0, 0.5),
                0px 2.15px 0.5px -2px rgba(0, 0, 0, 0.25),
                0px 5px 1.5px -4px rgba(8, 8, 8, 0.2),
                0px 6px 4px -4px rgba(8, 8, 8, 0.16),
                0px 6px 13px 0px rgba(8, 8, 8, 0.12),
                0px 24px 24px -16px rgba(8, 8, 8, 0.08),
                inset 2px 4px 16px 0px rgba(253, 253, 253, 0.05)
                `,
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
            md: '.9rem',
            lg: '1.3rem',
            xl: '1.7rem',
            '2xl': '2rem',
        },
    },
    screens: {
        xs: '390px',
        sm: '430px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1440px',
        'max-md': { 'max': '767px' }, // Target screens smaller than 768px
        'between-md-lg': { 'min': '768px', 'max': '1023px' },
    }
};
export const plugins = [
    require('tailwind-scrollbar'),
];
export const darkMode = 'class';