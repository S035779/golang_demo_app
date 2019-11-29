package routes

import (
  "../models"

  "fmt"
  "net/http"

  "github.com/gin-gonic/gin"
)

type SignUpUri struct {
  Page string `uri:"page"`
}

type Regist struct {
  Username  string `form:"username"`
  Password  string `form:"password"`
  Confirm   string `form:"confirm"`
  Firstname string `form:"firstname"`
  Lastname  string `form:"lastname"`
  Email     string `form:"email"`
  Agree     string `form:"agree"`
  Action    string `form:"action"`
}

func SignUpForm(c *gin.Context) {
  var session Session
  session.getSession(c)

  var uri SignUpUri
  if err := c.ShouldBindUri(&uri); err !=nil {
    engine.SetHTMLTemplate(accountTemplates["signup"])
    c.HTML(http.StatusBadRequest, "_account.tmpl", gin.H{ 
      "session": session,
      "posturl": "/account/signup/" + uri.Page,
      "baseurl": c.MustGet("baseurl").(string),
      "error": err.Error(),
    })
    return
  }

  engine.SetHTMLTemplate(accountTemplates["signup"])
  c.HTML(http.StatusOK, "_account.tmpl", gin.H{
    "session": session,
    "posturl": "/account/signup/" + uri.Page,
    "baseurl": c.MustGet("baseurl").(string),
  })
}

func SignUp(c *gin.Context) {
  var session Session
  session.getSession(c)

  var uri SignUpUri
  if err := c.ShouldBindUri(&uri); err !=nil {
    engine.SetHTMLTemplate(accountTemplates["signup"])
    c.HTML(http.StatusBadRequest, "_account.tmpl", gin.H{ 
      "session": session,
      "posturl": "/account/signup/" + uri.Page,
      "baseurl": c.MustGet("baseurl").(string),
      "error": err.Error(),
    })
    return
  }

  var form Regist
  if err := c.ShouldBind(&form); err != nil {
    engine.SetHTMLTemplate(accountTemplates["signup"])
    c.HTML(http.StatusBadRequest, "_account.tmpl", gin.H{ 
      "session": session,
      "posturl": "/account/signup/" + uri.Page,
      "baseurl": c.MustGet("baseurl").(string),
      "error": err.Error(),
    })
    return
  }

  if err, id := registUser(&form); err != nil {
    engine.SetHTMLTemplate(accountTemplates["signup"])
    c.HTML(http.StatusUnauthorized, "_account.tmpl", gin.H{ 
      "session": session,
      "posturl": "/account/signup/" + uri.Page,
      "baseurl": c.MustGet("baseurl").(string),
      "error": err.Error(),
    })
    return
  } else {
    session = Session{
      userId: id,
      nickname: fmt.Sprintf("%s, %s", form.Lastname, form.Firstname),
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

func registUser(regist *Regist) (error, int64) {
  var user = &models.Users{
    Username:   regist.Username,
    Password:   regist.Password,
    Firstname:  regist.Firstname,
    Lastname:   regist.Lastname,
    Email:      regist.Email,
  }
  var err error
  var id int64
  if regist.Action    == "regist"     &&
     regist.Agree     == "yes"        && 
     regist.Password  == regist.Confirm {
    err, id = user.InsertUser()
  }
  return err, id
}

