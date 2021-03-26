const path = require("path");
const svgToMiniDataURI = require("mini-svg-data-uri");

module.exports = {
	entry: path.resolve(__dirname, "src", "index.tsx"),
	devServer: {
		contentBase: path.resolve(__dirname, "dist"),
		writeToDisk: true,
	},
	output: {
		filename: "bundle.js",
		path: path.resolve(__dirname, "dist"),
		clean: true,
	},
	resolve: {
		extensions: [".ts", ".tsx", ".js"],
	},
	module: {
		rules: [
			{
				test: /\.ts(x?)$/,
				exclude: /node_modules/,
				use: ["babel-loader", "ts-loader"],
			},
			{
				test: /\.js$/,
				loader: "babel-loader",
				exclude: /node_modules/,
			},
			{
				test: /\.css$/i,
				use: [
					"style-loader",
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
