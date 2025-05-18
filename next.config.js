// /** @type {import('next').NextConfig} */
// const nextConfig = {
//     reactStrictMode: true,
//     swc: false,
//     output: 'standalone',
//     experimental: {
//         serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
//     },
//     images: {
//         domains: ['res.cloudinary.com', 'img.icons8.com'],
//     },
//     // Set the development server port to 3003
//     devServer: {
//         port: 3003
//     }
// }

// module.exports = nextConfig


/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'standalone',
    experimental: {
        appDir: true,
    },
    images: {
        domains: ['res.cloudinary.com', 'img.icons8.com'],
    },
};

export default nextConfig;