const Dotenv = require('dotenv-webpack');
const merge = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');
const ManifestPlugin = require('webpack-manifest-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const LoadablePlugin = require('@loadable/webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const OptimizeCSSAsetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
process.traceDeprecation = true;

const client = (env, argv) => {
  const mode = argv && argv.mode ? argv.mode : 'development'
  const devMode = mode === 'development';
  console.log('devMode(client platform): ', devMode);
  return ({
      name: "client", mode, target: "web", stats: 'normal', devtool: 'source-map'
    , entry: {
        app: devMode 
        ? ['webpack-hot-middleware/client?path=/__what', './main.js', './main.css']
        : ['./main.js', './main.css']
      }
    , output: {
        path: path.resolve(__dirname, 'dist')
      , publicPath: '/assets/'
      , filename: devMode ? 'js/[name].bundle.js' : 'js/[name].[hash].js'
      }
    , optimization: {
        minimizer: [
          new TerserPlugin({
            cache: true, parallel: true, sourceMap: true
          , terserOptions: {
              ecma: 6, compress: true, output: { comments: false, beautify: false }
            }
          })
        , new OptimizeCSSAsetsPlugin()
        ]
      , splitChunks: {
          chunks: 'all'
        , maxInitialRequests: 20
        , maxAsyncRequests: 20
        , minSize: 0
        , cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/
            , name(module) {
                const packageName = module.context
                  .match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
                return `npm.${packageName.replace('@', '')}`;
              }
            }
          }
        }
      }
    , plugins: [
        new LoadablePlugin()
      , new webpack.HotModuleReplacementPlugin()
      , new webpack.DefinePlugin({
          'process.env.PLATFORM': JSON.stringify('client')
        , 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
        , 'process.env.VERSION': JSON.stringify(process.env.npm_package_version)
        })
      , new ManifestPlugin({ fileName: 'manifest.client.json' })
      , new MiniCssExtractPlugin({
          filename: 'css/[name].[contenthash].css'
        , chunkFilename: 'css/[id].css'
        })
      , new CleanWebpackPlugin({
          cleanOnceBeforeBuildPatterns: [
            'js/*'
          , 'css/*'
          , 'fonts/*'
          , 'images/*'
          , 'index.html'
          , 'favicon.ico'
          , 'manifest.client.json'
          ]
        })
      , new StyleLintPlugin({ 
          configFile: path.resolve(__dirname, 'stylelint.config.js')
        , context: path.resolve(__dirname, 'src')
        , files: '**/*.css'
        , fileOnError: false
        , quiet: false
        })
      , new HtmlWebpackPlugin({
          title: 'devServer'
        , template: 'html/index.tmpl'
        })
      , new Dotenv({
          path: './.env'
        , safe: false
        , systemvars: false
        , silent: false
        })
      ]
    , devServer: {
        contentBase: 'dist'
      , inline: true
      , host: "0.0.0.0"
      , port: 8080
      , historyApiFallback: true
      , watchContentBase: true
      , disableHostCheck: true
      , stats: { colors: true }
      , publicPath: '/assets/'
      }
    , performance: {
        hints: "warning"
      , maxAssetSize: 1280000
      , maxEntrypointSize: 2560000
      , assetFilter(assetFilename) {
          return assetFilename.endsWith('.css') || assetFilename.endsWith('.js');
        }
      }
    });
};

const server = (env, argv) => {
  const mode = argv && argv.mode ? argv.mode : 'development';
  const devMode = mode  === 'development';
  console.log('devMode(server platform): ', devMode);
  return ({
      name: "server", mode: 'none', target: "node", stats: 'normal'
    , devtool: 'inline-source-map'
    , node: { __dirname: true, __filename: true }
    , externals: [ nodeExternals() ]
    , entry: { ssr: ['./ssr-server.js'] }
    , output: {
        path: path.resolve(__dirname, 'dist')
      , publicPath: devMode ? '/' : '/assets/'
      , filename: '[name].node.js'
      }
    , optimization: { nodeEnv: false }
    , plugins: [
        new webpack.DefinePlugin({
          'process.env.PLATFORM': JSON.stringify('server')
        , 'provess.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
        , 'process.env.VERSION': JSON.stringify(process.env.npm_package_version)
        })
      , new ManifestPlugin({ fileName: 'manifest.server.json' })
      , new CleanWebpackPlugin({
          cleanOnceBeforeBuildPatterns: [
            'ssr.node.js'
          , 'loadable-stats.json'
          , 'manifest.server.json'
          ]
        })
      ]
    });
};

const common = (env, argv) => {
  const mode = argv && argv.mode ? argv.mode : 'development'
  const devMode = mode === 'development';
  console.log('devMode(common platform): ', devMode);
  return ({
      context: path.resolve(__dirname, 'src')
    , module: { rules: [
        { test: /\.js$/, enforce: "pre", exclude: /node_modules/
        , use: [{ loader: 'eslint-loader'
          , options: { configFile: path.resolve(__dirname, '.eslintrc.js') } } ]}
      , { test: /\.jsx?$/, exclude: /node_modules/
        , use: [{ loader: 'babel-loader', options: { 
            presets: [
              "@babel/preset-react"
            , ["@babel/preset-env", { "modules": false, "targets": { 
                "ie": "11", "chrome": "68", "firefox": "61", "edge": "42", "node": "10" 
              }, useBuiltIns: "usage", corejs: 3 }] ]
          , plugins: [
              "@loadable/babel-plugin"
            , "@babel/proposal-object-rest-spread"
            , "@babel/transform-member-expression-literals"
            , "@babel/transform-property-literals"
            ]
          , compact: true } }] }
      , { test: /\.(css|scss|sass)$/i, use:[
          { loader: devMode ? 'style-loader' : MiniCssExtractPlugin.loader }
          , { loader: 'css-loader', options: { sourceMap: true, importLoaders: 2 } }
          , { loader: 'postcss-loader', options: { sourceMap: true
            , config: { path: path.resolve(__dirname, 'postcss.config.js') } } }
          , { loader: 'resolve-url-loader', options: { sourceMap: true } }
          , { loader: 'sass-loader', options: { sourceMap: true } }
        ] }
      , { test: /\.(png|jpe?g|gif)$/i, use: [
          { loader: 'url-loader'
          , options: {  publicPath: '/assets/'
            , name: devMode ? 'images/[name].[ext]' : 'images/[hash].[ext]'
          , limit: 8192 } } 
        ] }
      , { test: /\.(eot|otf|svg|ttf|woff2?)$/i, use: [
          { loader: 'file-loader'
          , options: { publicPath: '/assets/'
            , name: devMode ? 'fonts/[name].[ext]' : 'fonts/[hash].[ext]' } }
        ] }
      , { test: /\.ico$/i, use: [
          { loader: 'file-loader'
          , options: { publicPath: '/assets/'
            , name: devMode ? 'images/[name].[ext]' : 'images/[hash].[ext]' } }
        ] }
      ] }
    , resolve: {
        alias: {
          Main:           path.resolve(__dirname, 'src/'                 )
        , Utilities:      path.resolve(__dirname, 'src/utils/'           )
        , Stores:         path.resolve(__dirname, 'src/stores'           )
        , Actions:        path.resolve(__dirname, 'src/actions'          )
        , Components:     path.resolve(__dirname, 'src/components'       )
        , Services:       path.resolve(__dirname, 'src/services'         )
        , Pages:          path.resolve(__dirname, 'src/pages'            )
        , Routes:         path.resolve(__dirname, 'src/routes'           )
        }
      }
    });
};
module.exports = (env, argv) => ([
  merge(common(env, argv), client(env, argv))
, merge(common(env, argv), server(env, argv))
]);
