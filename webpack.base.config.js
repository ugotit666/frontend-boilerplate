const HtmlPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
  entry: {
    index: path.resolve(__dirname, './src/index.jsx'),
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      assets: path.resolve(__dirname, './assets'),
    },
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
        ],
      },
      {
        test: /\.(ttf|woff|woff2|otf|eot|fnt)$/,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
      {
        test: /\.(png|jpe?g|svg|gif)$/,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
      {
        test: /\.(mp4|webm)$/,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
      {
        test: /\.(wav|mp3|ogg|m4a)$/,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlPlugin({
      title: 'FRONTEND BOILERPLATE',
      filename: 'index.html',
      template: path.resolve(__dirname, './src/index.html'),
    }),
    new CopyPlugin([]),
  ],
};
