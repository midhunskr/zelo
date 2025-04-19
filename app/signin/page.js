'use client'

import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useState } from 'react'

export default function SignIn() {
    const router = useRouter()
    const [isRegister, setIsRegister] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleGoogleSignIn = async () => {
        try {
            setError('')
            setLoading(true)
            const result = await signIn('google', {
                callbackUrl: '/',
                redirect: false
            })
            if (result?.error) {
                setError(result.error)
            } else {
                router.push('/')
            }
        } catch (error) {
            console.error('Sign in error:', error)
            setError('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            if (isRegister) {
                // Register new user
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                })

                if (!res.ok) {
                    const data = await res.json()
                    throw new Error(data.message || 'Failed to register')
                }

                // Auto sign in after registration
                const result = await signIn('credentials', {
                    email: formData.email,
                    password: formData.password,
                    redirect: false
                })

                if (result?.error) {
                    throw new Error(result.error)
                }

                router.push('/')
            } else {
                // Sign in existing user
                const result = await signIn('credentials', {
                    email: formData.email,
                    password: formData.password,
                    redirect: false
                })

                if (result?.error) {
                    throw new Error(result.error)
                }

                router.push('/')
            }
        } catch (error) {
            console.error('Auth error:', error)
            setError(error.message || 'An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full space-y-8 p-10 bg-white rounded-2xl shadow-xl"
            >
                <div className="space-y-6">
                    <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-3xl text-white font-bold">Z</span>
                        </div>
                        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
                            {isRegister ? 'Create an account' : 'Welcome back'}
                        </h2>
                        <p className="text-center text-sm text-gray-600">
                            {isRegister ? 'Sign up to start chatting' : 'Sign in to your account'}
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    {isRegister && (
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required={isRegister}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete={isRegister ? 'new-password' : 'current-password'}
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Processing...' : isRegister ? 'Sign up' : 'Sign in'}
                        </button>
                    </div>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                </div>

                <div>
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className={`w-full flex items-center justify-center space-x-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span>Google</span>
                    </button>
                </div>

                <div className="text-center">
                    <button
                        type="button"
                        onClick={() => setIsRegister(!isRegister)}
                        className="text-sm text-blue-600 hover:text-blue-500"
                    >
                        {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                    </button>
                </div>

                <div className="mt-4 text-center text-xs text-gray-600">
                    By continuing, you agree to our{' '}
                    <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                        Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                        Privacy Policy
                    </a>
                </div>
            </motion.div>
        </div>
    )
} 