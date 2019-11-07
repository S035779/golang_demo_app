package proxy

import (
  "../logger"

  "crypto/tls"
  "flag"
  "fmt"
  "encoding/base64"
  "io"
  "net"
  "net/http"
  "net/http/httputil"
  "context"
  "os"
  "os/signal"
  "strconv"
  "strings"
  "syscall"
  "time"

  "golang.org/x/crypto/acme/autocert"
)

type ProxyConfig struct {
  CertPath                *string
  KeyPath                 *string
  Addr                    *string
  AuthUser                *string
  AuthPass                *string
  Avoid                   *string
  Verbose                 *bool
  DestDialTimeout         *time.Duration
  DestReadTimeout         *time.Duration
  DestWriteTimeout        *time.Duration
  ClientReadTimeout       *time.Duration
  ClientWriteTimeout      *time.Duration
  ServerReadTimeout       *time.Duration
  ServerReadHeaderTimeout *time.Duration
  ServerWriteTimeout      *time.Duration
  ServerIdleTimeout       *time.Duration
  LetsEncrypt             *bool
  LEWhitelist             *string
  LECacheDir              *string
}

type Proxy struct {
  Logger              *zap.Logger
  AuthUser            string
  AuthPass            string
  Avoid               string
  ForwardingHTTPProxy *httputil.ReverseProxy
  DestDialTimeout     time.Duration
  DestReadTimeout     time.Duration
  DestWriteTimeout    time.Duration
  ClientReadTimeout   time.Duration
  ClientWriteTimeout  time.Duration
}

var (
  proxycnf ProxyConfig
)

func init() {
  proxycnf.CertPath = flag.String("cert","","Filepath to certificate")
  proxycnf.KeyPath  = flag.String("key","","Filepath to private key")
  proxycnf.Addr     = flag.String("port","10000","Server address")
  proxycnf.AuthUser = flag.String("user","","Server authentication username")
  proxycnf.AuthPass = flag.String("pass","","Server authentication password")
  proxycnf.Avoid    = flag.String("avoid","","Site to be avoided")
  proxycnf.Verbose  = flag.Bool("verbose",false,"Set log level to DEBUG")
  proxycnf.DestDialTimeout         = flag.Duration("destdialtimeout",
    10*time.Second,"Destination dial timeout")
  proxycnf.DestReadTimeout         = flag.Duration("destreadtimeout",
    5*time.Second,"Destination read timeout")
  proxycnf.DestWriteTimeout        = flag.Duration("destwritetimeout",
    5*time.Second,"Destination write timeout")
  proxycnf.ClientReadTimeout       = flag.Duration("clientreadtimeout",
    5*time.Second,"Client read timeout")
  proxycnf.ClientWriteTimeout      = flag.Duration("clientwritetimeout",
    5*time.Second,"Client write timeout")
  proxycnf.ServerReadTimeout       = flag.Duration("serverreadtimeout",
    30*time.Second,"Server read timeout")
  proxycnf.ServerReadHeaderTimeout = flag.Duration("serverreadheadertimeout",
    30*time.Second,"Server read header timeout")
  proxycnf.ServerWriteTimeout      = flag.Duration("serverwritetimeout",
    30*time.Second,"Server write timeout")
  proxycnf.ServerIdleTimeout       = flag.Duration("serveridletimeout",
    30*time.Second,"Server idle timeout")
  proxycnf.LetsEncrypt             = flag.Bool("letsencrypt",
    false,"Use letsencrypt for https")
  proxycnf.LEWhitelist             = flag.String("lewhitelist",
    "","Hostname to whitelist for letsencrypt")
  proxycnf.LECacheDir              = flag.String("lecachedir",
    "/tmp","Cache directory for certificates")
  flag.Parse()
}

func ProxyServer() {
  var fh,   _ = os.Create("logs/errors.log")
  var log = logger.StdLogger("[APP]", fh)
  if *proxycnf.Verbose {
    log.Option(logger.DebugLevel,logger.ConsoleFormat)
  } else {
    log.Option(logger.ErrorLevel,logger.JsonFormat)
  }

  var servers [10]*http.Server
  var addr, _ = strconv.Atoi(*proxycnf.Addr)

  log.Debug("address : %s.", *proxycnf.Addr)
  log.Debug("cert.pem: %s.", *proxycnf.CertPath)
  log.Debug("key.pem : %s.", *proxycnf.KeyPath)
  log.Debug("username: %s.", *proxycnf.AuthUser)
  log.Debug("password: %s.", *proxycnf.AuthPass)

  for i := 0; i < 10; i++ {
    var proxy  = &Proxy{
      ForwardingHTTPProxy:  NewForwardingHTTPProxy(log.Logger()),
      Logger:               log.Logger(),
      AuthUser:             *proxycnf.AuthUser,
      AuthPass:             *proxycnf.AuthPass,
      DestDialTimeout:      *proxycnf.DestDialTimeout,
      DestReadTimeout:      *proxycnf.DestReadTimeout,
      DestWriteTimeout:     *proxycnf.DestWriteTimeout,
      ClientReadTimeout:    *proxycnf.ClientReadTimeout,
      ClientWriteTimeout:   *proxycnf.ClientWriteTimeout,
      Avoid:                *proxycnf.Avoid,
    }

    var port = i + addr
    var server = &http.Server{
      Addr:               fmt.Sprintf(":%d", port),
      Handler:            proxy, 
      ErrorLog:           log.Logger(),
      ReadTimeout:        *proxycnf.ServerReadTimeout,
      ReadHeaderTimeout:  *proxycnf.ServerReadHeaderTimeout,
      WriteTimeout:       *proxycnf.ServerWriteTimeout,
      IdleTimeout:        *proxycnf.ServerIdleTimeout,
      TLSNextProto:       map[string]func(*http.Server, *tls.Conn, http.Handler){},
    }

    if *proxycnf.LetsEncrypt { // for Let's Encrypt.
      if *proxycnf.LEWhitelist == "" {
        log.Fatal("error: no -lewhitelist flag set")
      }
      if *proxycnf.LECacheDir == "/tmp" {
        log.Fatal("-lecachedir should be set, using '/tmp' for now...")
      }

      var manager = &autocert.Manager{
        Cache:      autocert.DirCache(*proxycnf.LECacheDir),
        Prompt:     autocert.AcceptTOS,
        HostPolicy: autocert.HostWhitelist(*proxycnf.LEWhitelist),
      }

      server.Addr = ":https"
      server.TLSConfig = manager.TLSConfig()
    }

    go func() {
      var err error
      if *proxycnf.CertPath != "" && *proxycnf.KeyPath != "" || *proxycnf.LetsEncrypt {
        err = server.ListenAndServeTLS(*proxycnf.CertPath, *proxycnf.KeyPath)
      } else {
        err = server.ListenAndServe()
      }

      if err != nil && err != http.ErrServerClosed {
        log.Fatal("listen: %s.", err)
      }

    }()
    servers[i] = server
    log.Info("port: %d.", port)
  }

  var quit = make(chan os.Signal)
  signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
  <-quit
  log.Info("Shutdown Server ...")

  var ctx, cancel = context.WithTimeout(context.Background(), 5 * time.Second)

  defer cancel()

  for i := 0; i < 10; i++ {
    var err = servers[i].Shutdown(ctx)
    if err != nil {
      log.Fatal("Server Shutdown: %s.", err.Error())
    }
  }

  select {
  case <-ctx.Done():
    log.Info("timeout of 5 seconds.")
  }

  log.Info("Server existing")
}

func (proxy *Proxy) ServeHTTP(writer http.ResponseWriter, reader *http.Request) {
  proxy.Logger.Info("Incoming request", zap.String("host", reader.Host))

  if proxy.AuthUser != "" && proxy.AuthPass != "" {
    var user, pass, ok = parseBasicProxyAuth(reader.Header.Get("Proxy-Authorization"))
    proxy.Logger.Info(fmt.Sprintf("user/pass: %s/%s", user, pass))
    if !ok || user != proxy.AuthUser || pass != proxy.AuthPass {
      proxy.Logger.Warn("Authorization attempt with invalid credentials")
      http.Error(writer, http.StatusText(http.StatusProxyAuthRequired), http.StatusProxyAuthRequired)
      return
    }
  }

  if reader.URL.Scheme == "http" {
    proxy.handleHTTP(writer, reader)
  } else {
    proxy.handleTunneling(writer, reader)
  }
}

func (proxy *Proxy) handleHTTP(writer http.ResponseWriter, reader *http.Request) {
  proxy.Logger.Debug("Got HTTP request", zap.String("host", reader.Host))

  if proxy.Avoid != "" && strings.Contains(reader.Host, proxy.Avoid) == true {
    http.Error(writer, http.StatusText(http.StatusForbidden), http.StatusMethodNotAllowed)
    return
  }
  proxy.ForwardingHTTPProxy.ServeHTTP(writer, reader)
}

func (proxy *Proxy) handleTunneling(writer http.ResponseWriter, reader *http.Request) {
  if proxy.Avoid != "" && strings.Contains(reader.Host, proxy.Avoid) == true {
    http.Error(writer, http.StatusText(http.StatusForbidden), http.StatusMethodNotAllowed)
    return
  }

  if reader.Method != http.MethodConnect {
    proxy.Logger.Info("Method not allowed", zap.String("method", reader.Method))
    http.Error(writer, http.StatusText(http.StatusMethodNotAllowed), http.StatusMethodNotAllowed)
    return
  }

  proxy.Logger.Debug("Connecting", zap.String("host", reader.Host))

  var dstConnection, errDst = net.DialTimeout("tcp", reader.Host, proxy.DestDialTimeout)
  if errDst != nil {
    proxy.Logger.Error("Destination dial failed", zap.Error(errDst))
    http.Error(writer, errDst.Error(), http.StatusServiceUnavailable)
    return
  }

  proxy.Logger.Debug("Connected", zap.String("host", reader.Host))

  writer.WriteHeader(http.StatusOK)

  proxy.Logger.Debug("Hijacking", zap.String("host", reader.Host))

  var hijacker, ok = writer.(http.Hijacker)
  if !ok {
    proxy.Logger.Error("Hijacking not supported")
    http.Error(writer, "Hijacking not supported", http.StatusInternalServerError)
    return
  }

  var cltConnection, _, errClt = hijacker.Hijack()
  if errClt != nil {
    proxy.Logger.Error("Hijacking failed", zap.Error(errClt))
    http.Error(writer, errClt.Error(), http.StatusServiceUnavailable)
    return
  }

  proxy.Logger.Debug("Hijacked connection", zap.String("host", reader.Host))

  var now = time.Now()
  cltConnection.SetReadDeadline(now.Add(proxy.ClientReadTimeout))
  cltConnection.SetWriteDeadline(now.Add(proxy.ClientWriteTimeout))
  dstConnection.SetReadDeadline(now.Add(proxy.DestReadTimeout))
  dstConnection.SetWriteDeadline(now.Add(proxy.DestWriteTimeout))

  go transfer(dstConnection, cltConnection)
  go transfer(cltConnection, dstConnection)
}

func transfer(dst io.WriteCloser, src io.ReadCloser) {
  defer func() { _ = dst.Close() }()
  defer func() { _ = src.Close() }()
  _, _ = io.Copy(dst, src)
}

func parseBasicProxyAuth(authz string) (username, password string, ok bool) {
  const prefix = "Basic "
  if !strings.HasPrefix(authz, prefix) {
    return
  }
  
  var code, err = base64.StdEncoding.DecodeString(authz[len(prefix):])
  if err != nil {
    return
  }
  var codes = string(code)
  
  var str = strings.IndexByte(codes, ':')
  if str < 0 {
    return
  }
  return codes[:str], codes[str+1:], true
}

func NewForwardingHTTPProxy(weblog *logger.WebLog) *httputil.ReverseProxy {
  var director = func(request *http.Request) {
    var _, ok = request.Header["User-Agent"]
    if !ok {
      request.Header.Set("User-Agent", "")
    }
  }
  return &httputil.ReverseProxy{
    ErrorLog: weblog,
    Director: director,
  }
}

