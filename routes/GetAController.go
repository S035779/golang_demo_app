package routes

import (
  "net/http"

  "github.com/gin-gonic/gin"
)

// https://localhost.localdomain:8080/api/geta
type Item struct { 
  Id int
  Name string
}
func GetAData(c *gin.Context) {
  c.HTML(http.StatusOK, "index.tmpl", gin.H{
    "a": "a",
    "b": []string{ "b_todo1", "b_todo2" },
    "c": []Item{{ 1, "c_mika" }, { 2, "c_risa" }},
    "d": Item{ 3, "d_mayu" },
    "e": true,
    "f": false,
    "h": true,
  })
}

