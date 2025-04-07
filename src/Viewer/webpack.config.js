const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/app.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    library: 'FileToMarkdownViewer',
    libraryTarget: 'umd',
    globalObject: 'this'
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
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      // Special rule to completely exclude TypeScript files in node_modules
      {
        test: /\.ts$/,
        include: /node_modules/,
        use: 'null-loader',
        exclude: /\.(js|mjs|jsx)$/
      }
    ]
  },
  resolve: {
    extensions: ['.js'],
    fallback: {
      "path": false,
      "fs": false,
      "os": false,
      "stream": false,
      "crypto": false
    }
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          parse: {
            // Explicitly tell terser to ignore TypeScript syntax
            ecma: 2020
          },
          // Use ignorePatterns instead of exclude
          mangle: {
            safari10: true,
          },
          format: {
            comments: false,
          }
        },
        // Use test/include/exclude options from TerserPlugin (not from terserOptions)
        test: /\.js(\?.*)?$/i,
        exclude: /\.ts$/
      })
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    })
  ]
}; 