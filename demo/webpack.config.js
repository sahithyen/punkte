const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require('path');

module.exports = {
  entry: "./main.js",
  devtool: 'eval-source-map',
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "main.js",
  },
  devServer: {
    port: 9000,
  },
  watchOptions: {
    aggregateTimeout: 2000
  },
  mode: "development",
  plugins: [
    new CopyWebpackPlugin({ patterns: ['index.html'] })
  ],
  experiments: {
    asyncWebAssembly: true
  }
};
