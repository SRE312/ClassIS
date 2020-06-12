const path = require('path');
const webpack = require('webpack');

module.exports = {
    devtool: 'source-map',
    entry: {
        'app': [
            'react-hot-loader/patch',
            './src/index'
        ]
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.js',
        publicPath: '/assets/'
    },
    resolve: {
        extensions: ['.js']
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    { loader: 'react-hot-loader/webpack' },
                    { loader: 'babel-loader' }
                ]
            },
            {
                test: /\.css$/,
                exclude: /node_modules/,
                // use: [
                //     { loader: 'style-loader' },
                //     { loader: 'css-loader' }
                // ]
                use: ['style-loader','css-loader'
                ]
            },
            {
                test: /\.less$/,
                use: [
                    { loader: "style-loader" },
                    { loader: "css-loader" },
                    { loader: "less-loader" }
                ]
            }
        ]
    },
    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(true),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.DefinePlugin({'process.env': {NODE_ENV: JSON.stringify('development')}})
    ],
    devServer: {
        compress: true,
        port: 3000,
        publicPath: '/assets/',
        hot: true,
        inline: true,
        historyApiFallback: true,
        stats: {
            chunks: false
        },
        proxy: {
            '/apiforjs': {
                target: 'http://127.0.0.1:5000',
                pathRewrite: {"^/apiforjs":""},
                changeOrigin: true
            }
        }
    }
};