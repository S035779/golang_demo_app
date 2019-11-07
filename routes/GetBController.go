package routes

import (
  "net/http"

  "github.com/gin-gonic/gin"
)

// https://localhost.localdomain:8080/api/getb?field_a=a&field_b=b
type StructA struct {
  FieldA string `form:"field_a"`
}
type StructB struct {
  NestedStruct StructA
  FieldB string `form:"field_b"`
}
func GetBData(c *gin.Context) {
  var b StructB
  c.Bind(&b)
  c.JSON(http.StatusOK, gin.H{
    "a": b.NestedStruct,
    "b": b.FieldB,
  })
}

