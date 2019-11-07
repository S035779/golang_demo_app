package routes

import (
  "net/http"

  "github.com/gin-gonic/gin"
)

// https://localhost.localdomain:8080/api/getd?field_x=123&field_d=456
type StructD struct {
  NestedAnonyStruct struct {
    FieldX string `form:"field_x"`
  }
  FieldD string `form:"field_d"`
}

func GetDData(c *gin.Context) {
  var b StructD
  c.Bind(&b)
  c.JSON(http.StatusOK, gin.H{
    "x": b.NestedAnonyStruct,
    "d": b.FieldD,
  })
}

