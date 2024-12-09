/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        images: {
          remotePatterns: [
            {
              protocol: "https",
              hostname: "cdn.prod.website-files.com",
            },
          ],
        },
        source: "/api/(.*)",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
