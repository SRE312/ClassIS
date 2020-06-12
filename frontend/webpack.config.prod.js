const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    devtool: 'source-map',
    entry: {
        'app': [
            './src/index'
        ]
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'js/[name]-[hash:8].js',
        publicPath: '.'
    },
    resolve: {
        extensions: ['.js']
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/, // 不编译第三方包
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
        new webpack.DefinePlugin({ 'process.env': { NODE_ENV: JSON.stringify('production') } }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            sourceMap: true
        }),
        new HtmlWebpackPlugin({
            template: './src/index.html',
            inject: true
        })
    ]
};