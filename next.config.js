/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    domains: ["localhost", "placehold.co"],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8081/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
