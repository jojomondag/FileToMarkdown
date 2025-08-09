const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  target: 'node',
  entry: {
    setup: './src/server/setup.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist/server'),
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
          options: { presets: ['@babel/preset-env'] }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js']
  },
  externals: [
    {
      'express': 'commonjs express',
      'multer': 'commonjs multer',
      'cors': 'commonjs cors'
    }
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: { comments: false }
        },
        extractComments: false
      })
    ]
  },
  plugins: []
};


