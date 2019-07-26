const merge = require('webpack-merge');
const base = require('./webpack.base.config');

module.exports = merge(base, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    hot: true,
    port: 9000,
    historyApiFallback: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
    proxy: [
      {
        context: ['/api'],
        target: 'http://localhost:3000',
        changeOrigin: true, // TODO: See https://github.com/chimurai/http-proxy-middleware/issues/238
      },
    ],
  },
});
