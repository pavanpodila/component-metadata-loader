const path = require('path');

module.exports = {
  entry: './sample/index.js',
  output: {
    path: path.resolve('./build'),
    filename: 'sample.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['babel-loader', path.resolve('./lib/index.js')],
      },
    ],
  },
};
