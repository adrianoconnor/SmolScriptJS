const path = require('path');

module.exports = {
  entry: './build/SmolVM.js',
  mode: 'production',
  output: {
    filename: 'smol.js',
    path: path.resolve(__dirname, 'dist'),
  },
};