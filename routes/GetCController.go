package routes

import (
  "net/http"

  "github.com/gin-gonic/gin"
)

// https://localhost.localdomain:8080/api/getc?field_a=a&field_c=c
type StructC struct {
  NestedStructPointer *StructA
  FieldC string `form:"field_c"`
}
func GetCData(c *gin.Context) {
  var b StructC
  c.Bind(&b)
  c.JSON(http.StatusOK, gin.H{
    "a": b.NestedStructPointer,
    "c": b.FieldC,
  })
}

