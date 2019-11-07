package routes

import (
  "net/http"

  "github.com/gin-gonic/gin"
)

func About(c *gin.Context) {
  var session Session
  session.getSession(c)

  engine.SetHTMLTemplate(templates["about"])
  c.HTML(http.StatusOK, "_base.tmpl", gin.H{
    "session": session,
    "baseurl": c.MustGet("baseurl").(string),
  })
}

