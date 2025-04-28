/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Optimize for Docker
  swcMinify: true,
  experimental: {
    optimizeFonts: true,
  },
  images: {
    domains: ['fonts.gstatic.com', 'fonts.googleapis.com'],
  },
}

export default nextConfig
