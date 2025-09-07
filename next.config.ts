import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['bcrypt', 'pg', 'postgres'],
  webpack: (config, { isServer }) => {
    // Fix for node-pre-gyp and native modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      path: false,
      os: false,
      stream: false,
      util: false,
      perf_hooks: false,
      child_process: false,
      worker_threads: false,
      cluster: false,
    };

    // Ignore problematic modules
    config.externals = config.externals || [];
    config.externals.push({
      'node-pre-gyp': 'commonjs node-pre-gyp',
      '@mapbox/node-pre-gyp': 'commonjs @mapbox/node-pre-gyp',
      'postgres': 'commonjs postgres',
    });

    // For client-side, exclude server-only packages
    if (!isServer) {
      config.externals.push('postgres', 'pg', 'bcrypt');
    }

    // Handle .html files in node_modules
    config.module.rules.push({
      test: /\.html$/,
      type: 'asset/resource',
      generator: {
        emit: false,
      },
    });
    

    // Ignore specific node-pre-gyp files
    config.plugins = config.plugins || [];
    const webpack = require('webpack');
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /\.html$/,
        contextRegExp: /@mapbox\/node-pre-gyp/,
      })
    );

    return config;
  },
};

export default nextConfig;

