const path = require('path');
const webpack = require('webpack');

module.exports = (env) => ({
  mode: env.production ? 'production' : 'development',
  entry: './src/client.js',
  devtool: env.production ? false : 'source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: env.production ? 'filetomarkdown.browser.js' : 'filetomarkdown.browser.dev.js',
    library: 'FileToMarkdown',
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
  externals: {
    'express': 'commonjs express',
    'multer': 'commonjs multer',
    'fs': 'commonjs fs',
    'path': 'commonjs path',
    'os': 'commonjs os'
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    })
  ],
  devServer: env.development ? {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 9000,
    hot: true
  } : undefined
});