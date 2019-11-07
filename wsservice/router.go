package wsservice

import (
  "../logger"
)

var (
  log *logger.StdLog
)

type Router interface {
  Run()
}

type router struct {
}

func NewRouter(logger *logger.StdLog) *router {
  log = logger
  return &router{}
}

func (r *router) Run() Listener {
  var listener = NewListener()
  listener.RegisterAcceptHandler(r.OnAccept)
  listener.RegisterCloseHandler(r.OnClose)
  return listener
}

func (r *router) OnAccept(conn Connection) {
  log.Debug("Accepted.")
  var client = NewClient(conn)
  client.Run()
}

func (r *router) OnClose(conn Connection) {
  log.Debug("Closed.")
}

