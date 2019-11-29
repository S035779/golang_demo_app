import * as R from 'ramda';
import fs from 'fs';
import zlib from 'zlib';
import brotli from 'iltorb';
import lzma from 'lzma-native';
import compressible from 'compressible';
import vary from 'vary';
import accepts from 'accepts';
import bytes from 'bytes';
import log from 'Utilities/logutils';

const displayName = 'apputils';

const manifest = filepath => {
  try {
    log.info(displayName, 'Manifest file', filepath);
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  }
  catch (e) {
    throw new Error(`Manifest file not found. ${e}`);
  }
};

const addListener = (stream, on, listeners) => {
  for (let i = 0; i < listeners.length; i++) on.apply(stream, listeners[i]);
};

const chunkLength = (chunk, encoding) => {
  const len = Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(chunk, encoding);
  return R.isNil(chunk) ? 0 : len;
};

const isCompress = (req, res) => {
  const contentType = res.getHeader('Content-Type');
  //log.debug(displayName, 'content-type:', contentType || 'NotFound');
  return !R.isNil(contentType) && compressible(contentType);
};

const isTransform = (req, res) => {
  const cacheControl = res.getHeader('Cache-Control');
  //log.debug(displayName, 'cache-control:', cacheControl || 'NotFound');
  return !R.isNil(cacheControl) || !R.test(/(?:^|,)\s*?no-transform\s*?(?:,|$)/, cacheControl);
};

const setHeadersFromArray = (res, headers) => {
  for (let i = 0; i < headers.length; i++) res.setHeader(headers[i][0], headers[i][1]);
};

const setHeadersFromObject = (res, headers) => {
  const keys = R.keys(headers);
  for (let i = 0; i < headers.length; i++) {
    if (keys[i]) res.setHeader(keys[i], headers[keys[i]]);
  }
};

const setWriteHeadHeaders = function(...args) {
  const length = args.length;
  const headerIndex = length > 1 && R.is(String, args[1]) ? 2 : 1;
  const headers = length >= headerIndex + 1 ? args[headerIndex] : undefined;
  this.status = args[0];
  if (Array.isArray(headers)) setHeadersFromArray(this, headers);
  else if (headers) setHeadersFromObject(this, headers);
  const _args = new Array(Math.min(length, headerIndex));
  for (let i = 0; i < _args.length; i++) _args[i] = args[i];
  return _args;
};

const createWriteHead = (prevHead, listener) => {
  let fired = false;
  return function(..._args) {
    const args = setWriteHeadHeaders.apply(this, _args);
    if (!fired) {
      fired = true;
      listener.call(this);
      if (R.is(Number, args[0]) && this.status !== args[0]) {
        args[0] = this.status;
        args.length = 1;
      }
      prevHead.apply(this, args);
    }
  };
};

const onHeaders = (res, listener) => {
  if (R.isNil(res)) throw new TypeError('argument res is required');
  if (!R.is(Function, listener)) throw new TypeError('argument listener must be a function');
  res.writeHead = createWriteHead(res.writeHead, listener);
};

const compression = options => {
  const _options = options || {};
  const filter = _options.filter || isCompress;
  const threshold = _options.threshold ? bytes.parse(_options.threshold) : 1024;

  return (req, res, next) => {
    let stream, ended = false, listeners = [], length;
    const _write  = res.write;
    const _end    = res.end;
    const _on     = res.on;

    res.flush = function() { if (stream) stream.flush(); };

    res.write = function(chunk, encoding) {
      if (ended) return false;
      if (!this._header) this._implicitHeader();

      const _buffer = Buffer.from(chunk, encoding);
      return !R.isNil(stream) ? stream.write(_buffer) : _write.call(this, chunk, encoding);
    };

    res.end = function(chunk, encoding) {
      if (ended) return false;
      if (!this._header) {
        if (!this.getHeader('Content-Length')) length = chunkLength(chunk, encoding);
        this._implicitHeader();
      }

      if (R.isNil(stream)) return _end.call(this, chunk, encoding);

      ended = true;
      const _buffer = Buffer.from(chunk, encoding);
      return !R.isNil(chunk) ? stream.end(_buffer) : stream.end();
    };

    res.on = function(type, listener) {
      if (!R.isNil(listeners) || type !== 'drain') {
        return _on.call(this, type, listener);
      }

      if (!R.isNil(stream)) {
        return stream.on(type, listener);
      }

      listeners.push([type, listener]);

      return this;
    };

    const nocompress = msg => {
      log.debug(displayName, 'no compression', msg);
      addListener(res, _on, listeners);
      listeners = [];
    };

    const isThreshold = (_req, _res) => {
      const contentLength = Number(_res.getHeader('Content-Length'));
      return contentLength < threshold || length < threshold;
    };

    onHeaders(res, () => {
      //log.debug(displayName, 'compression:start', '');
      if (!filter(req, res)) return nocompress('filtered');
      if (!isTransform(req, res)) return nocompress('no transform');
      vary(res, 'Accept-Encoding');
      if (!isThreshold(req, res)) return nocompress('size below threshold');
      const encoding = res.getHeader('Content-Encoding') || 'identity';
      if (encoding !== 'identity') return nocompress('already encoded');
      if (req.method === 'HEAD') return nocompress('HEAD request');

      //log.debug(displayName, 'request:', req.headers);
      const encodings = new Set(accepts(req).encodings());

      if (encodings.has('br')) {
        //log.debug(displayName, 'content-encoding:', 'br');
        res.setHeader('Content-Encoding', 'br');
        stream = brotli.compressStream(_options);
      }
      else if (encodings.has('lzma')) {
        //log.debug(displayName, 'content-encoding:', 'lzma');
        res.setHeader('Content-Encoding', 'lzma');
        stream = lzma.createStream('aloneEncoder', _options);
      }
      else if (encodings.has('deflate')) {
        //log.debug(displayName, 'content-encoding:', 'deflate');
        res.setHeader('Content-Encoding', 'deflate');
        stream = zlib.createDeflate(_options);
      }
      else if (encodings.has('gzip')) {
        //log.debug(displayName, 'content-encoding:', 'gzip');
        res.setHeader('Content-Encoding', 'gzip');
        stream = zlib.createGzip(_options);
      }
      else {
        return nocompress('not acceptable');
      }

      addListener(stream, stream.on, listeners);
      res.removeHeader('Content-Length');

      stream.on('data', chunk => {
        //log.debug(displayName, 'compression:data');
        if (_write.call(res, chunk) === false) stream.pause();
      });

      stream.on('end', () => {
        //log.debug(displayName, 'compression:end');
        _end.call(res);
      });

      _on.call(res, 'drain', () => {
        //log.debug(displayName, 'compression:drain');
        stream.resume();
      });
    });
    next();
  };
};
export default { compression, manifest };
