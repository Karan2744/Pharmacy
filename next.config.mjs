/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow larger request bodies for product image uploads (base64 can be several MB)
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  images: {
    // Allow base64 data URIs (local file uploads)
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.truemeds.in",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
