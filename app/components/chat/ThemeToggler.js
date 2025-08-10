'use client'

import Image from 'next/image'

export default function ThemeToggler({ theme, onToggle }) {
    return (
        <button
            onClick={onToggle}
            className="md:p-2 md:rounded-full md:hover:bg-light-accent md:dark:hover:bg-zinc-700 md:dark:hover:bg-opacity-35"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === 'light' ? (
                <div>
                    <svg
                        className="hidden md:block w-6 h-6 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                        />
                    </svg>
                    <Image src="/images/icons8-moon-48.png" alt="Globe" width={24} height={24} className='pt-1 md:hidden' />
                </div>

            ) : (
                <div>
                    <svg
                        className="hidden md:block w-6 h-6 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                    </svg>
                    <Image src="/images/icons8-sun-48.png" alt="Globe" width={24} height={24} className='pt-1 md:hidden' />
                </div>
            )}
        </button>
    )
} 