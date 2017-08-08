const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');
module.exports = {
    entry: './app/index.js',

    output: {
        path: path.resolve(__dirname, 'app/prod'),
        filename: 'bundle.prod.js',
        sourceMapFilename: 'bundle.prod.js.map'
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015', 'react']
                }
            }
            ,
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: { modules: true },
                    },
                ],
            },
            {
                test: /\.(sass|scss)$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader',
                ]
            }

        ],
    },
    devServer: {
        contentBase: path.join(__dirname, "app/prod"),
        compress: true,
        inline: true,
        port: 8585,
        hot: true
    },
    plugins: [
        new CleanWebpackPlugin(['prod']),
        new HtmlWebpackPlugin({
            title: 'Building a mini Facebook photos exporting app',
            filename: 'index.html',
            template: './app/index.html',
            files: {
                js: ['bundle.prod.js']
            }
        }),
        new webpack.DefinePlugin({
            'FACEBOOK_APP_ID': JSON.stringify(process.env.FACEBOOK_APP_ID || '116569408989417'),
            'ROLLBAR_TOKEN': JSON.stringify(process.env.ROLLBAR_TOKEN)
        })
    ]
};

