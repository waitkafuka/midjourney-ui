/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath:'/mj',
  reactStrictMode: true,
  transpilePackages: ["antd"],
  trailingSlash: true,
  async rewrites() {
    return [
      {
        source: "/attachments/:path*",
        destination: "https://cdn.discordapp.com/attachments/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
