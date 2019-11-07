package routes

import(
  "time"

  "github.com/gin-gonic/gin"
  "github.com/gin-contrib/sessions"
)

type Session struct {
  userId    interface{}
  nickname  interface{}
  expire    interface{}
  IsAlive   bool
  IsSave    bool
}

func (session *Session) checkSession(c *gin.Context) bool {
  var sess = sessions.Default(c)
  session.expire    = sess.Get("expire")
  session.IsAlive   = sess.Get("alive") == "yes"

  if session.IsAlive && session.expire != nil {
    var expire, _ = session.expire.(int64)
    var expired   = time.Unix(expire, 0)
    var updated   = time.Now()
    if expired.After(updated) {
      return true
    }
  }
  return false
}

func (session *Session) getSession(c *gin.Context) {
  var sess = sessions.Default(c)
  session.userId    = sess.Get("userId")
  session.nickname  = sess.Get("nickname")
  session.expire    = sess.Get("expire")
  session.IsAlive   = sess.Get("alive") == "yes"
  session.IsSave    = sess.Get("save") == "yes"
}

func (session *Session) clearSession(c *gin.Context) {
  var sess = sessions.Default(c)
  sess.Clear()
  sess.Save()
}

func (session *Session) setSession(c *gin.Context) {
  var sess = sessions.Default(c)
  var t = time.Now()

  if session.IsSave {
    sess.Set("save", "yes")
    t = t.AddDate(0, 1, 0)
  } else {
    sess.Set("save", "no")
    t = t.AddDate(0, 0, 1)
  }

  sess.Set("userId", session.userId)
  sess.Set("nickname", session.nickname)
  sess.Set("expire", t.Unix())
  sess.Set("alive", "yes")
  sess.Save()
}
