import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias['libsodium-wrappers'] = require.resolve('libsodium-wrappers');
    return config;
  },
};

export default nextConfig;
