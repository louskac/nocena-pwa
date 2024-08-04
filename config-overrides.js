const { override, addWebpackAlias } = require('customize-cra');
const webpack = require('webpack');
const path = require('path');

module.exports = override(
  addWebpackAlias({
    crypto: path.resolve(__dirname, 'node_modules/crypto-browserify'),
    stream: path.resolve(__dirname, 'node_modules/stream-browserify'),
    buffer: path.resolve(__dirname, 'node_modules/buffer'),
    process: path.resolve(__dirname, 'node_modules/process'),
  }),
  (config) => {
    config.resolve.fallback = {
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      'buffer': path.resolve(__dirname, 'src/polyfills/buffer'),
      process: require.resolve('process/browser'),
    };
    config.plugins.push(
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer'],
      })
    );
    return config;
  }
);
