const merge = require('webpack-merge');
const { CleanWebpackPlugin: CleanPlugin } = require('clean-webpack-plugin');
const path = require('path');
const base = require('./webpack.base.config');

module.exports = merge(base, {
  mode: 'production',
  // devtool: 'source-map',
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, './dist'),
  },
  plugins: [new CleanPlugin()],
  optimization: {
    moduleIds: 'hashed',
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        default: false,
        vendors: false,
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom|prop-types|styled-components)[\\/]/,
          name: 'react',
          chunks: 'all',
          enforce: true,
        },
        rx: {
          test: /[\\/]node_modules[\\/](rxjs)[\\/]/,
          name: 'rx',
          chunks: 'all',
          enforce: true,
        },
        pixi: {
          test: /[\\/]node_modules[\\/](pixi\.js|@pixi)[\\/]/,
          name: 'pixi',
          chunks: 'all',
          enforce: true,
        },
        eventemitter3: {
          test: /[\\/]node_modules[\\/](eventemitter3)[\\/]/,
          name: 'eventemitter3',
          chunks: 'all',
          enforce: true,
        },
      },
    },
  },
});
