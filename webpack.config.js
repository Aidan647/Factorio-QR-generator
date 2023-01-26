const path = require("path")
const webpack = require("webpack")

module.exports = {
	entry: "./src/index.ts",
	// devtool: "source-map",
	mode: "development",
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: "ts-loader",
				exclude: /node_modules/,
			},
		],
	},
	// plugins: [
	// 	new webpack.ProvidePlugin({
	// 		Buffer: ["buffer", "Buffer"],
	// 	}),
	// ],
	// resolve: {
	// 	extensions: [".tsx", ".ts", ".js"],
	// 	fallback: {
	// 		buffer: require.resolve("buffer"),
	// 	},
	// },
	output: {
		filename: "bundle.js",
		path: path.resolve(__dirname, "dist"),
	},
}
