/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Allow the local network host during development so HMR/ws works
  // Add your machine IP here if you access the dev server from another device.
  allowedDevOrigins: ['192.168.1.18'],
}

export default nextConfig
