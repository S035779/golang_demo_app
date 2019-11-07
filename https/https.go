package https

import (
  "../logger"
  "../routes"

  "flag"
  "fmt"
  "net/http"
  "context"
  "os"
  "os/signal"
  "syscall"
  "time"

  "golang.org/x/crypto/acme/autocert"
)

type HttpsConfig struct {
  CertPath                 *string
  KeyPath                  *string
  Addr                     *string
  AuthUser                 *string
  AuthPass                 *string
  Verbose                  *bool
  ServerReadTimeout        *time.Duration
  ServerReadHeaderTimeout  *time.Duration
  ServerWriteTimeout       *time.Duration
  ServerIdleTimeout        *time.Duration
  LetsEncrypt              *bool
  LEWhitelist              *string
  LECacheDir               *string
}

var (
  httpscnf HttpsConfig
)

func init() {
  httpscnf.CertPath = flag.String("cert","","Filepath to certificate")
  httpscnf.KeyPath  = flag.String("key","","Filepath to private key")
  httpscnf.Addr     = flag.String("port","8080","Server address")
  httpscnf.AuthUser = flag.String("user","","Server authentication username")
  httpscnf.AuthPass = flag.String("pass","","Server authentication password")
  httpscnf.Verbose  = flag.Bool("verbose",false,"Set log level to DEBUG")
  httpscnf.ServerReadTimeout         = flag.Duration("serverreadtimeout",
    30*time.Second,"Server read timeout")
  httpscnf.ServerReadHeaderTimeout   = flag.Duration("serverreadheadertimeout",
    30*time.Second,"Server read header timeout") 
  httpscnf.ServerWriteTimeout        = flag.Duration("serverwritetimeout",
    30*time.Second,"Server write timeout")
  httpscnf.ServerIdleTimeout         = flag.Duration("serveridletimeout",
    30*time.Second,"Server idle timeout")
  httpscnf.LetsEncrypt               = flag.Bool("letsencrypt",
    false,"Use letsencrypt for https")
  httpscnf.LEWhitelist               = flag.String("lewhitelist",
    "","Hostname to whitelist for letsencrypt")
  httpscnf.LECacheDir                = flag.String("lecachedir",
    "/tmp","Cache directory for certificates")
  flag.Parse()
}

func HttpServer() {
  var fh,   _ = os.Create("logs/errors.log")
  var log = logger.StdLogger("[APP]",fh)
  if *httpscnf.Verbose {
    log.Option(logger.DebugLevel,logger.ConsoleFormat)
  } else {
    log.Option(logger.ErrorLevel,logger.JsonFormat)
  }

  log.Debug("address : %s.", *httpscnf.Addr)
  log.Debug("username: %s.", *httpscnf.AuthUser)
  log.Debug("password: %s.", *httpscnf.AuthPass)
  log.Debug("cert.pem: %s.", *httpscnf.CertPath)
  log.Debug("key.pem : %s.", *httpscnf.KeyPath)

  var server = &http.Server{
    Addr:               fmt.Sprintf(":%s", *httpscnf.Addr),
    Handler:            routes.Router(*httpscnf.AuthUser, *httpscnf.AuthPass, log),
    ErrorLog:           log.Logger(),
    ReadTimeout:        *httpscnf.ServerReadTimeout,
    ReadHeaderTimeout:  *httpscnf.ServerReadHeaderTimeout,
    WriteTimeout:       *httpscnf.ServerWriteTimeout,
    IdleTimeout:        *httpscnf.ServerIdleTimeout,
    TLSNextProto:       nil, //  Supported HTTP/2.0.
  }

  if *httpscnf.LetsEncrypt { // for Let's Encrypt.
    if *httpscnf.LEWhitelist == "" {
      log.Fatal("error: no -lewhitelist flag set")
    }
    if *httpscnf.LECacheDir == "/tmp" {
      log.Fatal("-lecachedir should be set, using '/tmp' for now...")
    }

    var manager = &autocert.Manager{
      Cache:      autocert.DirCache(*httpscnf.LECacheDir),
      Prompt:     autocert.AcceptTOS,
      HostPolicy: autocert.HostWhitelist(*httpscnf.LEWhitelist),
    }

    server.Addr = ":https"
    server.TLSConfig = manager.TLSConfig()
  }

  go func() {
    var err error
    if *httpscnf.CertPath != "" && *httpscnf.KeyPath != "" || *httpscnf.LetsEncrypt {
      err = server.ListenAndServeTLS(*httpscnf.CertPath, *httpscnf.KeyPath)
    } else {
      err = server.ListenAndServe()
    }

    if err != nil && err != http.ErrServerClosed {
      log.Fatal("listen: %s.", err)
    }
  }()

  log.Info("port: %s", *httpscnf.Addr)

  var quit = make(chan os.Signal)
  signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
  <-quit
  log.Info("Shutdown Server ...")

  var ctx, cancel = context.WithTimeout(context.Background(), 5 * time.Second)

  defer cancel()

  if err := server.Shutdown(ctx); err != nil {
    log.Fatal("Server Shutdown: %s.", err.Error())
  }

  select {
  case <-ctx.Done():
    log.Info("timeout of 5 seconds.")
  }

  log.Info("Server existing")
}

