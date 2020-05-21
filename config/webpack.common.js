const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const paths = require("./paths.js");
module.exports = {
  entry: ["babel-polyfill", path.join(paths.srcPath, "index.js")],
  output: {
    path: paths.outPath,
    filename: "bundle.js",
  },
  devServer: {
    contentBase: paths.outPath,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        include: paths.srcPath,
        exclude: /node_modules/,
        options: {
          presets: [["@babel/env", { modules: false }], "@babel/react"],
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(jpg|png|svg)$/,
        use: {
          loader: "file-loader",
          options: {
            name: "[path][name].[hash].[ext]",
          },
        },
      },
    ],
  },

  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        GRPC_ADDR: JSON.stringify(process.env.GRPC_ADDR),
        RESULT_ADDR: JSON.stringify(process.env.RESULT_ADDR),
      },
    }),
    new HtmlWebpackPlugin({
      inject: true,
      template: path.join(paths.srcPath, "index.html"),
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    }),
  ],
};
