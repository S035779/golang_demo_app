import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import config from '../webpack.config.js';
import fs from 'fs';
import url from 'url';
import path from 'path';
import http from 'http';
import express from 'express';
import proxy from 'http-proxy-middleware';
import serveStatic from 'serve-static';
import log from './utils/logutils';

log.config('console', 'color', 'dev-server', 'TRACE');

const configs = config();
const compiler  = webpack(configs);
const client = compiler.compilers[0];

const app = express();
app.use(log.connect());
app.use(webpackHotMiddleware(client, { path: '/__what' }));
app.use(webpackDevMiddleware(client, configs[0].devServer));
app.use('/api', proxy({ target: 'http://localhost:8082', changeOrigin: true }));
app.use('/',    proxy({ target: 'http://localhost:8081', changeOrigin: true }));

const port = configs[0].devServer.port;
const host = configs[0].devServer.host;
http.createServer(app).listen(port, host, () => {
  log.info('[DEV]', `listening on ${host}:${port}`);
});
