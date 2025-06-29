const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    main: './src/index.js'
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
        exclude: [
          /node_modules/,
        ],
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
    ]
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          parse: {
            ecma: 2020
          },
          mangle: {
            safari10: true,
          },
          format: {
            comments: false,
          }
        },
        // Exclude problematic files from Terser
        exclude: [
        ]
      })
    ]
  },
  externals: [
    {
      'express': 'commonjs express',
      'multer': 'commonjs multer',
      'cors': 'commonjs cors',
      'pdf-parse': 'commonjs pdf-parse',
      'mammoth': 'commonjs mammoth',
      'xlsx-js-style': 'commonjs xlsx-js-style',
      '7zip-min': 'commonjs 7zip-min',
      'adm-zip': 'commonjs adm-zip'
    }
  ],
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    }),
  ]
};