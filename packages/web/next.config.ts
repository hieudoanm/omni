import type { NextConfig } from 'next';

const NODE_ENV = process.env.NODE_ENV || 'development';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  basePath: NODE_ENV === 'production' ? '/omni' : '',
  transpilePackages: [
    '@codemirror/commands',
    '@codemirror/lang-markdown',
    '@codemirror/language',
    '@codemirror/search',
    '@codemirror/state',
    '@codemirror/theme-one-dark',
    '@codemirror/view',
    '@lezer/common',
    '@lezer/highlight',
    '@lezer/markdown',
    '@lezer/lr',
    'd3-force',
    'd3-dispatch',
    'd3-quadtree',
    'd3-timer',
    'marked',
  ],
};

export default nextConfig;
