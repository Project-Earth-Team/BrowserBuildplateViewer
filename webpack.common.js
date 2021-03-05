const webpack = require('webpack')
const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const config = {
  entry: path.resolve(__dirname, './src/index.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.[fullhash].js'
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
            options: { minimize: false }
          }
        ]
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: './index.html'
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[fullhash].css',
      chunkFilename: '[id].[fullhash].css'
    }),
    new webpack.NormalModuleReplacementPlugin(
      /prismarine-viewer[/|\\]viewer[/|\\]lib[/|\\]utils/,
      './utils.web.js'
    ),
    new CopyPlugin({
      patterns: [
        { from: 'node_modules/prismarine-viewer/public/blocksStates/1.12.json', to: './blocksStates/1.12.json' },
        { from: 'node_modules/prismarine-viewer/public/textures/1.12/', to: './textures/1.12/' },
        { from: 'node_modules/prismarine-viewer/public/textures/1.12.png', to: './textures/1.12.png' },
        { from: 'node_modules/prismarine-viewer/public/worker.js', to: './' },
        { from: 'node_modules/prismarine-viewer/public/supportedVersions.json', to: './' }
      ]
    })
  ],
  target: 'web'
}

module.exports = config
