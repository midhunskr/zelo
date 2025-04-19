/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'standalone',
    experimental: {
        serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
    },
    images: {
        domains: ['lh3.googleusercontent.com'],
    },
    // Set the development server port to 3003
    devServer: {
        port: 3003
    }
}

module.exports = nextConfig 