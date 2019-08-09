const HtmlPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

require('dotenv').config({
  path: process.env.NODE_ENV === 'development' ? './.dev.env' : './.prod.env',
  debug: process.env.DEBUG,
});

const { APP_NAME = 'FRONTEND BOILERPLATE' } = process.env;

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
      filename: 'index.html',
      template: path.resolve(__dirname, './src/index.ejs'),
      title: APP_NAME,
      meta: {
        viewport: 'width=device-width, initial-scale=1',
      },
    }),
    new CopyPlugin([]),
  ],
};
