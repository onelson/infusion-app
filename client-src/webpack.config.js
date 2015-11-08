require('es6-promise').polyfill();  // needed for node versions < 0.12
var path = require("path");
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var webpack = require("webpack");

module.exports = {
  entry: {
    app: path.resolve(__dirname, './app/js/app.js'),
    styles:path.resolve(__dirname, './app/styles/main.scss')
  },
  plugins: [
    new ExtractTextPlugin('[name].css'),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  ],
  devtool: "source-map",
  output : {
    path: path.resolve(__dirname, '../app/assets/dist/'),
    filename: "[name].js",
    chunkFilename: "[id].js"
  },
  resolve: {
    modulesDirectories: [ '.',
      './app/js/',
      './bower_components',
      './node_modules'
    ],
    extensions: ['', '.js', '.es6']
  },
  module: {
    preLoaders: [
      { test: /\.js$/, loader: 'eslint-loader', exclude: /(node_modules|bower_components)/ },
      { test: /\.es6$/, loader: 'eslint-loader' }
    ],
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: /(node_modules|bower_components)/,
        query: {
          presets: ['es2015', 'react'],
          cacheDirectory: true
        }
      },
      { test: /\.html$/, loader: 'raw' },
      { test: /\.scss/,
        loader: ExtractTextPlugin.extract(
          'style', // backup loader when not building .css file
          'css!sass?sourceMap' // loaders to preprocess CSS
        )},
      //{ test: /\.scss/, loaders: ['style', "css?sourceMap", "sass?sourceMap"] },
      { test: /\.css$/, loaders: ExtractTextPlugin.extract(['style', 'css']) },
      { test: /\.png$/, loader: 'file' },
      { test: /\.woff$/, loader: 'file?prefix=fonts/' },
      { test: /\.ttf$/, loader: 'file?prefix=fonts/' },
      { test: /\.eot$/, loader: 'file?prefix=fonts/' },
      { test: /\.svg$/, loader: 'file?prefix=fonts/' },
      { test: /\.swf$/, loader: 'file' }
    ]
  },

  sassLoader: {
    includePaths: [
      './app/styles/',
      './node_modules/react-foundation-apps/bower_components/foundation-apps/scss'
    ]
  }
};
