package wsservice

type MessageHandleFunc func(interface{})

type MessageHandlers interface {
  Get(msgId uint16) MessageHandleFunc
  Register(msgId uint16, handler MessageHandleFunc)
  Unregister(msgId uint16)
}

func (m *messageHandlers) Get(msgId uint16) MessageHandleFunc {
  return m.handlers[msgId]
}

func (m *messageHandlers) Register(msgId uint16, handler MessageHandleFunc) {
  m.handlers[msgId] = handler
}

func (m *messageHandlers) Unregister(msgId uint16) {
  delete(m.handlers, msgId)
}

type messageHandlers struct {
  handlers map[uint16]MessageHandleFunc
}

func NewMessageHandlers() MessageHandlers {
  return &messageHandlers{
      handlers: make(map[uint16]MessageHandleFunc),
    }
}

