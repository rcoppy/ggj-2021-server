const path = require("path");
const webpack = require("webpack");
const nodeExternals = require('webpack-node-externals');


const {
  NODE_ENV = 'production',
} = process.env;

module.exports = {
  mode: NODE_ENV,
  target: "node",
  entry: "./src/index.ts",
  plugins: [new webpack.ProgressPlugin()],
  externals: [ nodeExternals() ],

  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        loader: "ts-loader",
        include: [path.resolve(__dirname, "src")],
        exclude: [/node_modules/],
      },
    ],
  },

  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },

  devServer: {
    open: true,
    host: "localhost",
  },
};
