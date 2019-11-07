package routes

import (
  "net/http"

  "github.com/gin-gonic/gin"
)

// https://localhost.localdomain:8080/client/posta
type myForm struct {
  Colors []string `form:"colors[]"`
}

func PostAForm (c *gin.Context) {
  engine.SetHTMLTemplate(templates["posta"])
  c.HTML(http.StatusOK, "_base.tmpl", gin.H{
    "url":      "/client/posta",
    "color_a":  "red",
    "color_b":  "green",
    "color_c":  "blue",
  })
}

func PostA(c *gin.Context) {
  var form myForm
  if err := c.ShouldBind(&form); err == nil {
    log.Debug("Colors : %v.", form.Colors)
  }
  c.JSON(http.StatusOK, gin.H{
    "color":  form.Colors,
  })
}

