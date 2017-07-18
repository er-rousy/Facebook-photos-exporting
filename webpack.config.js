var webpack = require('webpack');
var path = require('path');


module.exports = {
  entry: './app/index.js',
  output: {
    path:  path.resolve(__dirname, 'prod'),
    filename: 'bundle.prod.js',
    sourceMapFilename: 'bundle.prod.js.map'
  }
};

 