/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development';
const nextConfig = {
  basePath: '/mj',
  reactStrictMode: true,
  transpilePackages: ['antd'],
  assetPrefix: isDev ? '' : 'https://cdn.superx.chat/mj/',
  trailingSlash: true,
  async rewrites() {
    return [
      {
        source: '/attachments/:path*',
        destination: 'https://cdn.discordapp.com/attachments/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
