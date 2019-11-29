package routes

import (
  "net/http"

  "github.com/gin-gonic/gin"
)

func Contact(c *gin.Context) {
  var session Session
  session.getSession(c)

  engine.SetHTMLTemplate(clientTemplates["contact"])
  c.HTML(http.StatusOK, "_client.tmpl", gin.H{
    "session": session,
    "baseurl": c.MustGet("baseurl").(string),
  })
}

