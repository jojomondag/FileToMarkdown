const path = require('path');
const webpack = require('webpack');

const commonConfig = {
  mode: 'production',
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
    fallback: {
      "stream": require.resolve("stream-browserify"),
      "buffer": require.resolve("buffer/"),
      "path": require.resolve("path-browserify"),
      "crypto": require.resolve("crypto-browserify"),
      "zlib": require.resolve("browserify-zlib"),
      "util": require.resolve("util/"),
      "fs": false
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    })
  ]
};

module.exports = [
  // Main library bundle
  {
    ...commonConfig,
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'markitdown.js',
      library: 'FileToMarkdown',
      libraryTarget: 'umd',
      globalObject: 'this'
    }
  },
  // Renderer bundle
  {
    ...commonConfig,
    entry: './src/renderer/markdown.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'renderer.bundle.js',
      library: {
        name: 'MarkdownRenderer',
        type: 'umd',
        export: 'default'
      },
      globalObject: 'this'
    }
  }
]; 