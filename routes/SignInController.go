package routes

import (
  "../models"

  "fmt"
  "net/http"

  "github.com/gin-gonic/gin"
)

type SignInUri struct {
  Page string `uri:"page"`
}

type Login struct {
  Username    string `form:"username"`
  Password    string `form:"password"`
  RememberMe  string `form:"remember_me"`
  Action      string `form:"action"`
}

func SignInForm(c *gin.Context) {
  var session Session
  session.getSession(c)

  var uri SignInUri
  if err := c.ShouldBindUri(&uri); err !=nil {
    engine.SetHTMLTemplate(accountTemplates["signin"])
    c.HTML(http.StatusBadRequest, "_account.tmpl", gin.H{ 
      "session": session,
      "posturl": "/account/signin/" + uri.Page,
      "baseurl": c.MustGet("baseurl").(string),
      "error": err.Error(),
    })
    return
  }

  var checked = ""
  if session.IsSave {
    checked = "checked"
  }

  engine.SetHTMLTemplate(accountTemplates["signin"])
  c.HTML(http.StatusOK, "_account.tmpl", gin.H{
    "session": session,
    "remember_me": checked,
    "posturl": "/account/signin/" + uri.Page,
    "baseurl": c.MustGet("baseurl").(string),
  })
}

func SignIn(c *gin.Context) {
  var session Session
  session.getSession(c)

  var uri SignInUri
  if err := c.ShouldBindUri(&uri); err !=nil {
    engine.SetHTMLTemplate(accountTemplates["signin"])
    c.HTML(http.StatusBadRequest, "_account.tmpl", gin.H{ 
      "session": session,
      "posturl": "/account/signin/" + uri.Page,
      "baseurl": c.MustGet("baseurl").(string),
      "error": err.Error(),
    })
    return
  }

  var form Login
  if err := c.ShouldBind(&form); err != nil {
    engine.SetHTMLTemplate(accountTemplates["signin"])
    c.HTML(http.StatusBadRequest, "_account.tmpl", gin.H{ 
      "session": session,
      "posturl": "/account/signin/" + uri.Page,
      "baseurl": c.MustGet("baseurl").(string),
      "error": err.Error(),
    })
    return
  }

  if err, ok, user := isUserExist(&form); err != nil {
    engine.SetHTMLTemplate(accountTemplates["signin"])
    c.HTML(http.StatusUnauthorized, "_account.tmpl", gin.H{ 
      "session": session,
      "posturl": "/account/signin/" + uri.Page,
      "baseurl": c.MustGet("baseurl").(string),
      "error": err.Error(),
    })
    return
  } else if !ok {
    engine.SetHTMLTemplate(accountTemplates["signin"])
    c.HTML(http.StatusUnauthorized, "_account.tmpl", gin.H{ 
      "session": session,
      "posturl": "/account/signin/" + uri.Page,
      "baseurl": c.MustGet("baseurl").(string),
      "error": "Unauthorized.",
    })
    return
  } else {
    session = Session{
      userId: user.ID,
      nickname: fmt.Sprintf("%s, %s", user.Lastname, user.Firstname),
      IsSave: form.RememberMe == "yes",
    }
    session.setSession(c)
  }

  session.getSession(c)

  if uri.Page == "admin" {
    engine.SetHTMLTemplate(adminTemplates["home"])
    c.HTML(http.StatusOK, "_admin.tmpl", gin.H{
      "session": session,
      "baseurl": c.MustGet("baseurl").(string),
      "message": fmt.Sprintf("Welcome!! %s.", session.nickname),
    })
  } else {
    engine.SetHTMLTemplate(clientTemplates["home"])
    c.HTML(http.StatusOK, "_client.tmpl", gin.H{
      "session": session,
      "baseurl": c.MustGet("baseurl").(string),
      "message": fmt.Sprintf("Welcome!! %s.", session.nickname),
    })
  }
}

func SignOut(c *gin.Context) {
  var session Session
  session.clearSession(c)

  var uri SignInUri
  if err := c.ShouldBindUri(&uri); err !=nil {
    engine.SetHTMLTemplate(accountTemplates["signin"])
    c.HTML(http.StatusBadRequest, "_account.tmpl", gin.H{ 
      "session": session,
      "posturl": "/account/signin/" + uri.Page,
      "baseurl": c.MustGet("baseurl").(string),
      "error": err.Error(),
    })
    return
  }

  engine.SetHTMLTemplate(accountTemplates["signin"])
  c.HTML(http.StatusOK, "_account.tmpl", gin.H{
    "session": session,
    "posturl": "/account/signin/" + uri.Page,
    "baseurl": c.MustGet("baseurl").(string),
    "message": "Logged out!!",
  })
}

func isUserExist(login *Login) (error, bool, *models.Users) {
  var user = &models.Users{
    Username: login.Username,
    Password: login.Password,
  }
  var cnt int
  var err error
  if login.Action == "login" {
    err, cnt = user.SelectUser()
  }
  return err, cnt != 0 , user
}

