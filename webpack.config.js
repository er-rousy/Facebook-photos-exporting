const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    entry: './app/index.js',

    output: {
        path: path.resolve(__dirname, 'prod'),
        filename: 'bundle.prod.js',
        sourceMapFilename: 'bundle.prod.js.map'
    },
    module: {
        rules: [
          {
              test: /\.js$/,
              exclude: [/node_modules/],
              use: [{
                  loader: 'babel-loader',
                  options: { presets: ['es2015'] },
              }],
          },
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
        contentBase: path.join(__dirname, "prod"),
        compress: true,
        inline: true,
        port: 8080,
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
     })
    ]
};

