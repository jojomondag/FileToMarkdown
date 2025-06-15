const webpack = require('webpack');
const path = require('path');
const fs = require('fs');

// Create the dist directory if it doesn't exist
const distDir = path.resolve(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Create the webpack config
const config = {
  mode: 'production',
  entry: './index.js',
  output: {
    path: distDir,
    filename: 'bundle.js',
    library: {
      type: 'umd',
      export: 'default',
    },
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
    fallback: {
      fs: false,
      path: require.resolve('path-browserify'),
      stream: require.resolve('stream-browserify'),
      crypto: require.resolve('crypto-browserify'),
      os: require.resolve('os-browserify/browser'),
      url: require.resolve('url/')
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.DefinePlugin({
      'typeof window': JSON.stringify('object'),
    }),
  ]
};

// Create a compiler instance
const compiler = webpack(config);

// Run the compiler
compiler.run((err, stats) => {
  if (err) {
    console.error('Webpack compilation error:', err);
    return;
  }

  // Print webpack stats
  console.log(stats.toString({
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false,
  }));

  // Clean up build artifacts
  console.log('Cleaning up build artifacts...');
  // fs.unlinkSync(path.resolve(__dirname, 'dist', 'bundle.js'));

  console.log('Build completed successfully!');
}); 