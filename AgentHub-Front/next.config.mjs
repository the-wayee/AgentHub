/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: '/api/agent/workspace/:path*',
        destination: 'http://localhost:8080/api/agent/workspace/:path*',
      },
    ]
  },
}

export default nextConfig
