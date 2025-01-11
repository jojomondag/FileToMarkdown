const path = require('path');

module.exports = {
    entry: './src/renderer/markdown.js',
    output: {
        filename: 'renderer.bundle.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'MarkdownRenderer',
        libraryTarget: 'umd',
        globalObject: 'this'
    },
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
    }
}; 