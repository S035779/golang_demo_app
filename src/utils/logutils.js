import log4js from 'log4js';
import std from './stdutils';

const lvls = { 'ALL': 'all', 'AUTO': 'auto', 'OFF': 'off', 'FATAL': 'fatal', 'ERROR': 'error', 'WARN': 'warn', 'INFO': 'info', 'DEBUG': 'debug', 'TRACE': 'trace', 'MARK': 'mark' };

/**
 * log
 *
 * @param nam {string} - category name.
 * @param mlv {string} - message level.
 * @param msg {string} - message string.
 */
const log = function(nam, mlv, msg) {
  const _logger = log4js.getLogger(nam);
  _logger.log(lvls[mlv], msg);
};

/**
 * logger
 *
 * @param nam {string} - file/category name.
 * @param mlv {string} - message level.
 * @param msg {object|string|array}
 *                     - message object/string/array.
 */
const logger = function(nam, mlv, msg) {
  const _msg = msg.map(val => {
    if (typeof val === 'object') {
      return JSON.stringify(val, null, 4);
    }
    else if (val === null) {
      return '?';
    }
    else {
      return val;
    }
  });
  log(nam, mlv, _msg.join(' '));
};

/**
 * _layout
 *
 * @param lyt {string} - custom layout name.
 */
const _layout = function(lyt) {
  switch (lyt) {
    case 'json':
      log4js.addLayout(lyt, cfg => {
        return function(evt) {
          return JSON.stringify(evt) + cfg.separator;
        };
      });
      break;
    default:
      break;
  }
};

/**
 * _category
 *
 * @param nam {string} - category name.
 * @param flv {string} - filter level.
 * @returns {object} - category object.
 */
const _category = function(nam, flv) {
  const categories = {};
  const level = lvls[flv];
  categories.default = { appenders: [nam], level };
  return categories;
};

/**
 * _appender
 *
 * @param apd {string} - appender name.
 * @param lyt {string} - layout name or server(apd=client only).
 * @param nam {string} - file/category/appender name.
 * @returns {object} - appender object.
 */
const _appender = function(apd, lyt, nam) {
  const apds = {
    'console': { type: 'console' },
    'file': { type: 'dateFile', filename: `logs/${nam}` },
    'server':
      { type: 'multiprocess', mode: 'master', appender: nam, loggerHost: '0.0.0.0' },
    'client': { type: 'multiprocess', mode: 'worker', loggerHost: lyt }
  };
  const lyts = {
    'color': { type: 'coloured' },
    'basic':    { type: 'basic' },
    'json': { type: 'json', separator: ',' }
  };
  const appenders = {};
  const layout      = lyts[lyt];
  switch (apd) {
    case 'console':
    case 'file':
      appenders[nam] = std.merge(apds[apd], { layout });
      break;
    case 'server':
      appenders[nam] = std.merge(apds.file, { layout });
      appenders[`_${nam}`] = apds[apd];
      break;
    case 'client':
      appenders[nam] = apds[apd];
      break;
    default:
      throw new Error('Appender not found in "utils/logutils.js".');
  }
  return appenders;
};

/**
 * config
 *
 * @param apd {string} - appender name.
 * @param lyt {string} - layout name or server(apd=client only).
 * @param nam {string} - file/category name.
 * @param flv {string} - filter level.
 */
const config = function(apd, lyt, nam, flv) {
  const appenders = _appender(apd, lyt, nam);
  const categories = _category(nam, flv);
  _layout(lyt);
  log4js.configure({ appenders, categories });
};

/**
 * connect
 *
 * @param nam {string} - category name.
 * @param mlv {string} - message level.
 * @return {object}
 */
const connect = function(nam, mlv) {
  const _logger = log4js.getLogger(nam);
  const level = lvls[mlv];
  const format = ':method :url';
  const nolog = '\\.(gif|jpe?g|png)$';
  return log4js.connectLogger(_logger, { level, format, nolog });
};

/**
 * exit
 *
 * @param callback {function} - log4js is shutdown by callback
 *                              function.
 */
const close = function(callback) {
  log4js.shutdown(() => {
    if (callback) callback();
  });
};

/**
 * counter
 *
 * @returns {object}
 */
const counter = function() {
  let _s = 'count';
  const _n = {};
  return {
    count(s) {
      _s = s || _s;
      if (!_n.hasOwnProperty(_s)) _n[_s] = 0;
      return _n[_s]++;
    },
    print(s) {
      _s = s || _s;
      const msg =  `${_s}: ${_n[_s]}`;
      delete _n[_s];
      return msg;
    }
  };
};

/**
 * timer
 *
 * @returns {object}
 */
const timer = function() {
  let _s = 'rapTime';
  const _b = {};
  const _e = {};
  const _r = {};
  const size = function(a, b) {
    let i = b - a;
    const ms = i % 1000; i = (i - ms) / 1000;
    const sc = i % 60; i = (i - sc) / 60;
    const mn = i % 60; i = (i - mn) / 60;
    const hr = i % 24; i = (i - hr) / 24;
    const dy = i;
    const ret =
      `${(dy < 10 ? '0' : '')}${dy}-` +
      `${(hr < 10 ? '0' : '')}${hr}:` +
      `${(mn < 10 ? '0' : '')}${mn}:` +
      `${(sc < 10 ? '0' : '')}${sc}.` +
      `${(ms < 100 ? '0' : '')}` +
      `${(ms < 10 ? '0' : '')}${ms}`;
    return ret;
  };
  return {
    new(s) {
      _b[s] = Date.now();
      _r[s] = new Array();
    },
    add(s) {
      _e[s] = Date.now();
      _r[s].push(size(_b[s], _e[s]));
    },
    del(s) {
      delete _b[s];
      delete _e[s];
      delete _r[s];
    },
    count(s) {
      _s = s || _s;
      if (!_b.hasOwnProperty(_s)) {
        this.new(_s);
      }
      else {
        this.add(_s);
      }
      return _r[_s].join(' ');
    },
    print(s) {
      _s = s || _s;
      this.add(_s);
      const msg =  `${_s}: ${_r[_s].join(' ')}`;
      this.del(_s);
      return msg;
    }
  };
};

/**
 * heapusage
 *
 * @returns {object}
 */
const heapusage = function() {
  let _s = 'heapUsed';
  const _b = {};
  const _e = {};
  const _r = {};
  const size = function(a, b) {
    const i = a;
    if (i === 0) return "0 Bytes";
    const j = 1024;
    const k = b || 3;
    const l = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const m = Math.floor(Math.log(i) / Math.log(j));
    const ret = parseFloat(i / Math.pow(j, m)).toFixed(k) + l[m];
    return ret;
  };
  return {
    new(s) {
      _b[s] = process.memoryUsage().heapUsed;
      _r[s] = new Array();
    },
    add(s) {
      _e[s] = process.memoryUsage().heapUsed;
      _r[s].push(size(_e[_s], 3));
    },
    del(s) {
      delete _b[s];
      delete _e[s];
      delete _r[s];
    },
    count(s) {
      _s = s || _s;
      if (!_b.hasOwnProperty(_s)) {
        this.new(_s);
      }
      else {
        this.add(_s);
      }
      return _r[_s].join(' ');
    },
    print(s) {
      _s = s || _s;
      this.add(_s);
      const msg = `${_s}: ${size(_b[_s], 3)} -> ${_r[_s].join(' ')}`;
      this.del(_s);
      return msg;
    }
  };
};

/**
 * cpuusage
 *
 * @returns {object}
 */
const cpuusage = function() {
  let _s = 'cpuUsed';
  const _b = {};
  const _e = {};
  const _r = {};
  const _t = {};
  const size = function(a, b, c) {
    if (a === 0) return "0 %";
    const i = b * 1000;
    const j = c || 2;
    const ret = `${parseFloat(a / i).toFixed(j)}%`;
    return ret;
  };
  return {
    new(s) {
      _b[s] = process.cpuUsage();
      _r[s] = new Array();
      _t[s] = Date.now();
    },
    add(s) {
      _e[s] = process.cpuUsage(_b[s]);
      _r[s].push(size(_e[s].user, Date.now() - _t[s], 2));
    },
    del() {
      delete _b[_s];
      delete _e[_s];
      delete _r[_s];
      delete _t[_s];
    },
    count(s) {
      _s = s || _s;
      if (!_b.hasOwnProperty(_s)) {
        this.new(_s);
      }
      else {
        this.add(_s);
      }
      return _r[_s].join(' ');
    },
    print(s) {
      _s = s || _s;
      this.add(_s);
      const msg =  `${_s}: ${_r[_s].join(' ')}`;
      this.del(_s);
      return msg;
    }
  };
};

/**
 * Log4js functions Object.
 *
 */
export default {
  app: '',
  cache: {},
  config(apd, lyt, nam, flv) {
    this.app = nam;
    config(apd, lyt, nam, flv);
    this.cache.counter = counter();
    this.cache.timer = timer();
    this.cache.heapusage = heapusage();
    this.cache.cpuusage = cpuusage();
  },
  connect() {
    return connect(this.app, 'AUTO');
  },
  close(cb) {
    close(cb);
  },
  fatal(...args) {
    logger(this.app, 'FATAL', args);
  },
  error(...args) {
    logger(this.app, 'ERROR', args);
  },
  warn(...args) {
    logger(this.app, 'WARN', args);
  },
  info(...args) {
    logger(this.app, 'INFO', args);
  },
  debug(...args) {
    logger(this.app, 'DEBUG', args);
  },
  trace(...args) {
    logger(this.app, 'TRACE', args);
  },
  mark(...args) {
    logger(this.app, 'MARK', args);
  },
  count(ttl) {
    this.cache.counter.count(ttl);
  },
  countEnd(ttl) {
    const cnt = this.cache.counter.print(ttl);
    log(this.app, 'DEBUG', cnt);
  },
  time(ttl) {
    this.cache.timer.count(ttl);
  },
  timeEnd(ttl) {
    const tim = this.cache.timer.print(ttl);
    log(this.app, 'DEBUG', tim);
  },
  profile(ttl) {
    this.cache.heapusage.count(ttl);
    this.cache.cpuusage.count(ttl);
  },
  profileEnd(ttl) {
    const mem = this.cache.heapusage.print(ttl);
    const cpu = this.cache.cpuusage.print(ttl);
    log(this.app, 'DEBUG', `${cpu}, ${mem}`);
  }
};

