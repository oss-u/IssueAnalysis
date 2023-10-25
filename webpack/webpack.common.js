const path = require("path");
const CopyWebPackPlugin = require("copy-webpack-plugin");
const CleanWebPackPlugin = require("clean-webpack-plugin");
const srcDir = path.join(__dirname, "..", "src");

module.exports = {
  entry: {
      popup: path.join(srcDir, 'popup.js'),
    //   options: path.join(srcDir, 'options.tsx'),
      background: path.join(srcDir, "background.js"),
      content_script: path.join(srcDir, "content_script.js"),
    // sub_summary: path.join(srcDir, "sub_summary.tsx"),
    // topLevelSummaryComponent: path.join(srcDir, "topLevelSummary.tsx"),
    // newCommentComponent: path.join(srcDir, "newComment.tsx"),
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
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  },  
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "esbuild-loader",
        options: {
          loader: "tsx",
          target: "es2020",
        },
      },
      {
        test: /\.js$/,
        loader: "esbuild-loader",
        options: {
          loader: "jsx", 
          target: "es2020",
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
        // exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: [
          "style-loader",
          "css-loader",
          "sass-loader",
        ],
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
