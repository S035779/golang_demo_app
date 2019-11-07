package wsservice

import (
  //"fmt"
  "net/http"
  "sync"

  "github.com/gorilla/websocket"
)

type AcceptHandler func(Connection)
type CloseHandler func(Connection)

type Listener interface {
  //Run()
  RegisterAcceptHandler(AcceptHandler)
  RegisterCloseHandler(CloseHandler)
  HandleConnection(http.ResponseWriter, *http.Request)
}

type listener struct {
  listenerAsync
  port          int
  upgrader      websocket.Upgrader
  acceptHandler AcceptHandler
  closeHandler  CloseHandler
}

type listenerAsync struct {
  mutex       sync.Mutex
  connections map[*websocket.Conn]Connection
}

func NewListener() Listener {
  log.Debug("NewListener...")
  var l = &listener{
    upgrader:   websocket.Upgrader{},
  }

  l.upgrader.CheckOrigin = func(req *http.Request) bool {
    return true
  }

  l.connections = make(map[*websocket.Conn]Connection)
  return l
}

func (l *listener) RegisterAcceptHandler(handler AcceptHandler) {
  l.acceptHandler = handler
}

func (l *listener) RegisterCloseHandler(handler CloseHandler) {
  l.closeHandler = handler
}

func (l *listener) HandleConnection(w http.ResponseWriter, req *http.Request) {
  var ws, err = l.upgrader.Upgrade(w, req, nil)
  if err != nil {
    log.Error("Failed to set websocket upgrade: %+v.", err)
    return
  }

  defer l.closeConnection(ws)

  var address = ws.RemoteAddr().String()
  log.Info("NewConnection: %s.", address)

  var connection = NewConnection(ws)
  l.mutex.Lock()
  l.connections[ws] = connection
  l.mutex.Unlock()

  if l.acceptHandler != nil {
    l.acceptHandler(connection)
  }
}

func (l *listener) closeConnection(ws *websocket.Conn) {
  var address = ws.RemoteAddr().String()
  log.Info("CloseConnection: %s.", address)

  l.mutex.Lock()
  var connection = l.connections[ws]
  delete(l.connections, ws)
  l.mutex.Unlock()

  ws.Close()
  if l.closeHandler != nil {
    l.closeHandler(connection)
  }
}

