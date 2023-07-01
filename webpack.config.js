const path = require('path');

/*
npm run build
npx webpack --config webpack.config.js --mode production
*/

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