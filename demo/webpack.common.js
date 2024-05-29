const CopyWebpackPlugin = require("copy-webpack-plugin");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const path = require('path');

module.exports = env => {
  const plugins = [
    new CopyWebpackPlugin({ patterns: ['./src/index.html'] })
  ];

  if (env.analyzeBundle) {
    plugins.push(new BundleAnalyzerPlugin());
  }

  return {
    entry: "./src/main.ts",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "main.js",
    },
    plugins,
    experiments: {
      asyncWebAssembly: true,
      syncWebAssembly: true,
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.js$/,
          enforce: 'pre',
          use: 'source-map-loader',
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader', 'postcss-loader'],
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
  };
};