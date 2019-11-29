import sourceMapSupport from 'source-map-support';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import http from 'http';
import express from 'express';
import session from 'express-session';
import ReactSSRenderer from 'Routes/ReactSSRenderer/ReactSSRenderer';
import log from 'Utilities/logutils';
import app from 'Utilities/apputils';

sourceMapSupport.install();
const config = dotenv.config();
if (config.error) throw new Error(config.error);

const env = process.env.NODE_ENV || 'development';
const http_port = process.env.SSR_PORT || 8081;
const http_host = process.env.SSR_HOST || '127.0.0.1';
const test_mode = env !== 'development' && process.env.TEST_MODE;
const MAGICCODE = process.env.MAGICCODE;
const LIFE_TIME = process.env.LIFE_TJME;

const displayName = 'ssr-server';

if (env === 'development') log.config('console', 'color', displayName, 'TRACE');
else if (env === 'staging') log.config('file', 'basic', displayName, 'DEBUG');
else if (env === 'production') log.config('file', 'json', displayName, 'INFO');

log.info(displayName, 'TEST_MODE: ', test_mode);

const web = express();
web.use(log.connect());
web.use(app.compression({ threshold: '1kb' }));
web.use(session({
  secret: MAGICCODE,
  cookie: {
    httpOnly: false,
    maxAge: LIFE_TIME,
    secure: env === 'production'
  },
  resave: false,
  saveUninitialized: true
}));
web.use(ReactSSRenderer.of().request());

const server = http.createServer(web);
server.listen(http_port, http_host, () => {
  log.info(displayName, `listening on ${http_host}:${http_port}`);
});

const rejections = new Map();
const reject = (err, promise) => {
  const { name, message, stack } = err;
  log.error(displayName, 'unhandledRejection', name, message, stack || promise);
  rejections.set(promise, err);
};
const shrink = promise => {
  log.warn(displayName, 'rejectionHandled', rejections, promise);
  rejections.delete(promise);
};
const message = (err, code, signal) => {
  if (err) log.warn(displayName, err.name, err.message, err.stack);
  else log.info(displayName, `express exit. code: ${signal || code}`);
};

let timer1, timer2;
const shutdown = (err, cbk) => {
  if (err) log.error(displayName, err.name, err.message, err.stack);
  server.close(() => {
    log.info(displayName, 'express terminated.');
    log.close(() => {
      log.info(displayName, 'log4js terminated.');
      if (env === 'development') {
        clearInterval(timer1);
        clearInterval(timer2);
      }
      cbk(0);
    });
  });
};

let stats = [];
const generateHeapDumpAndStats = () => {
  try {
    global.gc();
  }
  catch (e) {
    log.warn(displayName, 'You have to run this program as  `node --expose-gc ...`.');
    process.exit();
  }
  const usage = process.memoryUsage();
  const messages = [];
  for (const key in usage) {
    messages.push(`${key}: ${Math.round(usage[key] / 1024 / 1024 * 100) / 100} MB`);
  }
  log.info(displayName, 'memory usage', messages.join(', '));
  stats.push(usage.heapUsed);
};

const saveHeapDumpAndStats = () => {
  const data = JSON.stringify(stats);
  fs.writeFile("logs/stats_ssr.json", data, err => {
    if (err) {
      log.error(displayName, err);
    }
    else {
      log.warn(displayName, "Saved stats to stats_ssr.json");
    }
    stats = [];
  });
  process.emit('SIGUSR1');
};

if (env === 'development') {
  timer1 = setInterval(generateHeapDumpAndStats, 5 * 60 * 1000);
  timer2 = setInterval(saveHeapDumpAndStats, 5 * 60 * 1000);
}
process.on('SIGUSR1', () => import('heapdump')
  .then(h => h.writeSnapshot(path.resolve('tmp', `${Date.now()}.heapsnapshot`))));
process.on('SIGUSR2', () => shutdown(null, process.exit));
process.on('SIGINT', () => shutdown(null, process.exit));
process.on('SIGTERM', () => shutdown(null, process.exit));
process.on('uncaughtException', err => shutdown(err, process.exit));
process.on('unhandledRejection', (err, promise) => reject(err, promise));
process.on('rejectionHandled', promise => shrink(promise));
process.on('warning', err => message(err));
process.on('exit', (code, signal) => message(null, code, signal));

export default { server, shutdown };
