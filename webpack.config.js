const path = require('path');

module.exports = {
  entry: {
    SmolVM: './build/SmolVM.js'
  },
  module: {
    rules: [
    {
        test: require.resolve("./build/SmolVM.js"),
        loader: "expose-loader",
        options: {
          exposes: ["SmolScript"]
        },
    }
    ]
  },
  mode: 'production',
  output: {
    filename: 'smol.js',
    path: path.resolve(__dirname, 'dist'),
  },
};