const webpack = require('webpack');
var MiniCssExtractPlugin= require('mini-css-extract-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');


const config= {
	entry: __dirname + '/js/index.jsx',
	output: {
		path: __dirname + '/dist',
		filename: 'bundle.js',
	},
	resolve: {
		extensions: ['.js', '.jsx', '.css']
	},
	module:{
		rules: [
			{
				test: /\.css$/,
				use:[
					MiniCssExtractPlugin.loader,
					'css-loader',
				]
			},
			{
			test: /\.jsx?/,
			exclude: /node_modules/,
			use: 'babel-loader'
			}
		]
	},
	node: {
		fs: 'empty'
	},
	plugins: [ new MiniCssExtractPlugin({filename: 'styles.css'})] 
};
module.exports = config
