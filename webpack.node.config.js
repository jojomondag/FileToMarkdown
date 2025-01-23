const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'production',
  entry: './src/api/api.js',
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'filetomarkdown.node.js',
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
    'multer': 'commonjs multer'
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    })
  ]
};