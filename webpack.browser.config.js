const path = require('path');
// No plugins required

//This builds and Packages the Browser compatible version of the library.
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
        exclude: /node_modules\/(?!(prismjs)\/).*/,
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
    extensions: ['.js']
  },
  plugins: [],
  devServer: env.development ? {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 9000,
    hot: true
  } : undefined
});