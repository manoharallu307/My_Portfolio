/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
  // Optimize for Vercel deployment
  swcMinify: true,
}

module.exports = nextConfig
