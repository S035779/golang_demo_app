package wsservice

import (
  "encoding/json"

  "github.com/mitchellh/mapstructure"
)

type Client interface {
  Run()
  Write(msgid uint16, body interface{})
}

type client struct {
  connection Connection
  messageHandlers MessageHandlers
  readChannel chan []byte
}

func NewClient(c Connection) Client {
  return &client{
    connection: c,
    messageHandlers: NewMessageHandlers(),
    readChannel: make(chan []byte),
  }
}

func (c *client) Run() {
  c.messageHandlers.Register(1, c.handleMessage)
  var readChannel = make(chan []byte)
  var closeChannel = make(chan bool)

  go c.connection.Run(readChannel, closeChannel)

  for {
    select {
    case message := <-readChannel:
      c.doHandler(message)
    case <-closeChannel:
      log.Debug("Close client.")
      return
    default:
    }
  }
}

func (c *client) Write(msgId uint16, body interface{}) {
  var packet = &Packet{
    ID: msgId,
    Body: body,
  }

  if message, err := json.Marshal(packet); err != nil {
    c.connection.Close()
    return
  } else {
    c.connection.Write(message)
  }
}

type Packet struct {
  ID uint16 `json:"id"`
  Body interface{} `json:"body"`
}

func (c *client) doHandler(message []byte) error {
  var packet = &Packet{}
  if err := json.Unmarshal(message, packet); err != nil {
    return err
  }

  if handler := c.messageHandlers.Get(packet.ID); handler != nil {
    handler(packet.Body)
  }
  return nil
}

type MessagePacket struct {
  Msg string `json:"msg"`
}

func (c *client) handleMessage(body interface{}) {
  var request = &MessagePacket{}
  if err := mapstructure.Decode(body, request); err != nil {
    log.Error("Error: %v.", err)
    return
  }
  log.Debug(request.Msg)

  var response = &MessagePacket{
    Msg: "PONG",
  }
  c.Write(1, response)
}
