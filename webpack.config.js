const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
    entry: ["babel-polyfill", "./src/js/index.js"],
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "js/bundle.js",
    },
    //mode: "development",
    //As we set it in the package.json file
    devServer: {
        contentBase: "./dist",
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: "index.html",
            template: "./src/index.html",
        }),
    ],
    module: {
        rules: [{
            test: /\.js$/, //any file ends with .js
            exclude: /node_modules/,
            use: {
                loader: "babel-loader",
            },
        }, ],
    },
};