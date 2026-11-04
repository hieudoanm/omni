import type { NextConfig } from 'next';

const NODE_ENV = process.env.NODE_ENV || 'development';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  basePath: NODE_ENV === 'production' ? '/omni' : '',
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
