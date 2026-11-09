import type { NextConfig } from 'next';

const NODE_ENV = process.env.NODE_ENV || 'development';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  basePath: NODE_ENV === 'production' ? '/omni' : '',
};

export default nextConfig;
