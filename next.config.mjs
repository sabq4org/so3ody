/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // صور المزوّد الرياضي / الـ CDN تُضاف هنا لاحقًا:
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.so3ody.com" },
      { protocol: "https", hostname: "media.so3ody.com" },
    ],
  },
};

export default nextConfig;
