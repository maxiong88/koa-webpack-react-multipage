const path = require('path');
const glob = require('glob');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

	let entries = function () {
		let jsDir = path.resolve(__dirname, 'src/module/**');
		let entryFiles = glob.sync(jsDir + '/*.js');
		let map = {};
		for (let i = 0; i < entryFiles.length; i++) {
			let filePath = entryFiles[i];
			let filename = filePath.substring(filePath.lastIndexOf('\/') + 1, filePath.lastIndexOf('.'));
			let outPath = filePath.split(filename)[0].split("src/module")[1];
			map[(outPath + filename).substr(1)] = [
				//'webpack-dev-server/client?http://localhost:8081/', 
				//'webpack/hot/dev-server',
				'react-hot-loader/patch',
				filePath];
		}
		return map;
	}
    let config = Object.create(null);
    config = {
        mode: 'development',
        entry: entries(),
        output: {
            path: path.resolve(__dirname, "dist/"),
            publicPath: '/',
            filename: 'scripts/[name].js',
            chunkFilename: 'scripts/js/[name].chunk.js'
        },
        // 优化
        optimization: {
            splitChunks: {
                cacheGroups: {
                    vendors: {
                        name: "vendors",
                        test: /[\\/]node_modules[\\/]/,
                        filename: '[name].bundle.[contenthash:8].js',
                        chunks: "all",
                        priority: 10
                    }
                }
            }
        },
        // 管理资源 asset-management
        module:{
            rules: [
                {
                    test: /\.html$/,
                    use: [
                      {
                        loader: 'html-loader',
                        options: { minimize: true }
                      }
                    ]
                },
                {
                    test: /\.js[x]?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader'
                    }
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader']
                },
                {
                    test: /\.less/,
                    use: ['style-loader' , 'css-loader', 'postcss-loader', 'less-loader']
                }
            ]
        },
        // 插件
        plugins: [
            new CleanWebpackPlugin(),
            // new webpack.HotModuleReplacementPlugin()
        ]
    }
    let pages = Object.keys(entries());
    pages.forEach(function(pathname) {
        var conf = {
            filename: pathname + '.html',
            template: './src/index.html',
            inject: true,
            minify: false
        };
        if (pathname in entries()) {
            conf.inject = 'body';
            conf.chunks = ['vendors', pathname];
            conf.hash = true;
        }
        config.plugins.push(new HtmlWebpackPlugin(conf));
    });
   
module.exports =config