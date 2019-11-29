package routes

import (
  "net/http"

  "github.com/gin-gonic/gin"
)

func Admin(c *gin.Context) {
  var session Session
  session.getSession(c)

  engine.SetHTMLTemplate(adminTemplates["home"])
  c.HTML(http.StatusOK, "_admin.tmpl", gin.H{
    "session": session,
    "baseurl": c.MustGet("baseurl").(string),
  })
}

