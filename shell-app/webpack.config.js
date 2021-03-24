const path = require("path");
const svgToMiniDataURI = require("mini-svg-data-uri");

module.exports = {
	entry: path.resolve(__dirname, "src", "index.js"),
	devServer: {
		contentBase: path.resolve(__dirname, "dist"),
		writeToDisk: true,
	},
	output: {
		filename: "bundle.js",
		path: path.resolve(__dirname, "dist"),
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				loader: "babel-loader",
				exclude: /node_modules/,
			},
			{
				test: /\.css$/i,
				use: [
					"css-loader",
					{
						loader: "postcss-loader",
						options: {
							postcssOptions: {
								plugins: [["autoprefixer", {}]],
							},
						},
					},
				],
			},
			{
				test: /\.(png|jpe?g|gif)$/,
				use: [
					{
						loader: "url-loader",
						options: {
							limit: 8192,
						},
					},
				],
			},
			{
				test: /\.svg$/i,
				use: [
					{
						loader: "url-loader",
						options: {
							generator: content => svgToMiniDataURI(content.toString()),
						},
					},
				],
			},
		],
	},
};
