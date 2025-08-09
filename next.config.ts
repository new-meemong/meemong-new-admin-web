import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack(config) {
    // SVG 파일을 React 컴포넌트로 사용하기 위한 설정
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  images: {
    remotePatterns: [
      new URL("https://images.unsplash.com/**"),
      new URL("https://meemong-uploads.s3.ap-northeast-2.amazonaws.com/**"),
      new URL("https://job-storage.meemong.com/**"),
    ],
  },
};

export default nextConfig;
