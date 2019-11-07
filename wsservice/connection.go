package wsservice

import (
  "sync"

  "github.com/gorilla/websocket"
)

type Connection interface {
  Run(readChannel chan []byte, closeChannel chan bool)
  Write([]byte)
  Close()
}

type connection struct {
  ws           *websocket.Conn
  wg           *sync.WaitGroup
  writeChannel chan []byte
}

func NewConnection(ws *websocket.Conn) Connection {
  return &connection{
    ws: ws,
  }
}

func (c *connection) Run(readChannel chan []byte, closeChannel chan bool) {
  c.wg = &sync.WaitGroup{}
  c.writeChannel = make(chan []byte)

  var errorChannel = make(chan error)

  c.wg.Add(1)
  go c.waitRead(readChannel, errorChannel)

  c.wg.Add(1)
  go c.waitWrite()

  for {
    select {
    case <-errorChannel:
      close(c.writeChannel)

      c.wg.Wait()

      close(closeChannel)
      return
    }
  }
}

func (c *connection) Write(message []byte) {
  c.writeChannel<-message
}

func (c *connection) Close() {
  c.ws.Close()
}

func (c *connection) waitWrite() {
  defer c.wg.Done()
  for message := range c.writeChannel {
    if err := c.ws.WriteMessage(websocket.TextMessage, message); err != nil {
      log.Error("Error: %v.", err)
      break
    }
  }
  c.Close()
}

func (c *connection) waitRead(readChannel chan []byte, errorChannel chan error) {
  defer c.wg.Done()
  for {
    if _, message, err := c.ws.ReadMessage(); err != nil {
      errorChannel<-err
      break
    } else {
      readChannel<-message
    }
  }
  c.Close()
}
