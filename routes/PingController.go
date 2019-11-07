package routes

import (
  "net/http"

  "github.com/gin-gonic/gin"
)

const (
  sayHello1 = "Hello, 世界"
  sayHello2 = "Hello, 日本"
  sayHello3 = "Hello, 東京"
  sayHello4 = "hoge"
  sayHello5 = "fuga"
  giveNumber1 = 10
  giveNumber2 = 15
  giveNumber3 = 11
  giveNumber4 = 16
  giveNumber5 = 20
  giveNumber6 = 30
)

// https://localhost.localdomain:8080/api/ping
func PingData (c *gin.Context) {
  var msg1, msg2, msg3 = getMessage()
  var val1, val2, val3, val4 = getValue()
  var msg4, val5 = getAll(sayHello4, giveNumber5)
  var msg5, val6 = getAll(sayHello5, giveNumber6)
  var pval7 = getPointer(5)

  view_str(msg1)
  view_str(msg2)
  view_str(msg3)
  view_str(msg4)
  view_str(msg5)
  view_int(val1)
  view_int(val2)
  view_int(val3)
  view_int(val4)
  view_int(val5)
  view_int(val6)
  view_pint(pval7)

  c.JSON(http.StatusOK, gin.H{
    "msg1": msg1,
    "msg2": msg2,
    "msg3": msg3,
    "msg4": msg4,
    "msg5": msg5,
    "val1": val1,
    "val2": val2,
    "val3": val3,
    "val4": val4,
    "val5": val5,
    "val6": val6,
    "pval7": pval7,
  })
}

func view_str(msg string) {
  log.Debug("msg is %s.", msg)
}

func view_int(val int) {
  log.Debug("val is %d.", val)
}

func view_pint(pval *int) {
  log.Debug("pval is %p.", pval)
  log.Debug("*pval is %d.", *pval)
}

func getMessage() (string, string, string) {
  var msg1 string = sayHello1
  var msg2 = sayHello2
  msg3 := sayHello3
  return msg1, msg2, msg3
}

func getValue() (int, int, int, int) {
  var val1, val2 int
  val1, val2 = giveNumber1, giveNumber2
  val3, val4 := giveNumber3, giveNumber4
  return val1, val2, val3, val4
}

func getAll(str string, num int) (string, int) {
  var (
    msg string
    val int
  )

  msg = str
  val = num

  return msg, val
}

func getPointer(val int) (*int) {
  val7 := val
  var pval *int
  pval =  &val7
  return pval
}
