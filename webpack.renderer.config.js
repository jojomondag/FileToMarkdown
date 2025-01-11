const path = require('path');

module.exports = {
    mode: 'production',
    entry: './src/renderer/markdown.js',
    output: {
        filename: 'renderer.bundle.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'MarkdownRenderer',
        libraryTarget: 'var',
        libraryExport: 'default'
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
    }
}; 