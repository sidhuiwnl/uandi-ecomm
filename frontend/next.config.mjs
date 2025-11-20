/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'www.vilvahstore.com',
      },
      {
        protocol: 'https',
        hostname: 'pub-25688779f5b34d7a87524a48c1772ab6.r2.dev',
      }
    ],
  },
};

export default nextConfig;
