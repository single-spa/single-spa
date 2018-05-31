const config = require('./webpack.config.js')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

config.plugins.push(new BundleAnalyzerPlugin())

module.exports = config

