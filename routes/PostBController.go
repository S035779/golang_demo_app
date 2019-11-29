package routes

import (
  "net/http"
  "time"

  "github.com/gin-gonic/gin"
)

// https://localhost.localdomain:8080/client/postb
type Person struct {
  Name      string    `form:"name"`
  Address   string    `form:"address"`
  Birthday  time.Time `form:"birthday" time_format:"2006-01-02" time_utc:"1"`
}

func PostBForm (c *gin.Context) {
  engine.SetHTMLTemplate(clientTemplates["postb"])
  c.HTML(http.StatusOK, "_client.tmpl", gin.H{
    "url":      "/client/postb",
    "name":     "applebody",
    "address":  "xyz",
    "birthday": "1992-03-15",
  })
}

func PostBData (c *gin.Context) {
  var form Person
  if err := c.ShouldBind(&form); err == nil {
    log.Debug("Name     : %s", form.Name)
    log.Debug("Address  : %s", form.Address)
    log.Debug("Birthday : %s", form.Birthday)
  }
  c.String(http.StatusOK, "Success")
}

