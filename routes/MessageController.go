package routes

import (
  "net/http"

  "github.com/gin-gonic/gin"
)

func Message(c *gin.Context) {
  var session Session
  session.getSession(c)

  engine.SetHTMLTemplate(clientTemplates["message"])
  c.HTML(http.StatusOK, "_client.tmpl", gin.H{
    "session": session,
    "baseurl": c.MustGet("baseurl").(string),
  })
}


