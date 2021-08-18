const path = require("path");
const CopyWebPackPlugin = require("copy-webpack-plugin");
const CleanWebPackPlugin = require("clean-webpack-plugin");
const srcDir = path.join(__dirname, "..", "src");

module.exports = {
  entry: {
    //   popup: path.join(srcDir, 'popup.tsx'),
    //   options: path.join(srcDir, 'options.tsx'),
    background: path.join(srcDir, "background.js"),
    content_script: path.join(srcDir, "content_script.js"),
  },
  output: {
    path: path.join(__dirname, "../dist/"),
    filename: "[name].js",
  },
  optimization: {
    // splitChunks: {
    //   name: "vendor",
    //   chunks: "initial",
    // },
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        loaders: ["style-loader", "css-loader", "sass-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  plugins: [
    new CopyWebPackPlugin({
      patterns: [{ from: ".", to: ".", context: "public" }],
      options: {},
    }),
  ],
};
