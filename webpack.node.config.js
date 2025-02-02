const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    main: './src/index.js',
    server: './src/api/api.js'
  },
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    library: {
      type: 'commonjs2'
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js'],
    modules: [
      'node_modules',
      path.resolve(__dirname, 'src')
    ],
    fallback: {
      "stream": require.resolve("stream-browserify"),
      "buffer": require.resolve("buffer/"),
      "path": require.resolve("path-browserify"),
      "crypto": require.resolve("crypto-browserify"),
      "util": require.resolve("util/")
    }
  },
  externals: {
    'express': 'commonjs express',
    'multer': 'commonjs multer',
    'cors': 'commonjs cors',
    'pdfjs-dist': 'commonjs pdfjs-dist',
    'mammoth': 'commonjs mammoth',
    'xlsx-js-style': 'commonjs xlsx-js-style',
    '7zip-min': 'commonjs 7zip-min',
    'adm-zip': 'commonjs adm-zip'
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    }),
    new CopyWebpackPlugin({
      patterns: [
        { 
          from: path.resolve(__dirname, 'src/Viewer'),
          to: 'Viewer'
        },
        {
          from: path.resolve(__dirname, 'src/converters'),
          to: 'converters'
        }
      ]
    })
  ]
};