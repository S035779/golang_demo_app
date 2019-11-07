package routes

import (
  "net/http"

  "github.com/gin-gonic/gin"
)

// https://localhost.localdomain:8080/api/gete/mamoru_hashimoto/987fbc97-4bed-5078-9f07-9141ba07c9f3
type User struct {
  ID string `uri:"id" binding:"required,uuid"`
  Name string `uri:"name" binding:"required"`
}
func GetEData (c *gin.Context) {
  var user User
  var err = c.ShouldBindUri(&user)
  if err != nil {
    c.JSON(http.StatusBadRequest, gin.H{ "msg": err })
    return
  }
  c.JSON(http.StatusOK, gin.H{ "name": user.Name, "uuid": user.ID })
}

