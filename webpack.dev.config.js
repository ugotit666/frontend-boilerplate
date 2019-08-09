const webpack = require('webpack');
const merge = require('webpack-merge');
const base = require('./webpack.base.config');

const { PORT = 9000, API_PORT = 3000, API_BASE_URL = '/api' } = process.env;

module.exports = merge(base, {
  mode: 'development',
  devtool: 'inline-source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.API_BASE_URL': JSON.stringify(API_BASE_URL),
    }),
  ],
  devServer: {
    hot: true,
    port: PORT,
    historyApiFallback: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
    proxy: [
      {
        context: ['/api'],
        target: `http://localhost:${API_PORT}/api`,
        pathRewrite: { '^/api': '' },
      },
    ],
  },
});
