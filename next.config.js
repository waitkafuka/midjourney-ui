/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development';
const nextConfig = {
  basePath: '/art',
  reactStrictMode: true,
  transpilePackages: ['antd'],
  assetPrefix: isDev ? '' : 'https://c.superx360.com/art/',
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
