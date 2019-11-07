package routes

import(
  "../logger"
  "../wsservice"

  "fmt"
  "html/template"
  "io"
  "io/ioutil"
  "net/http"
  "os"
  "time"

  "github.com/gin-gonic/gin"
  "github.com/gin-contrib/sessions"
  "github.com/gin-contrib/sessions/cookie"
)

const (
  RootUrl = "https://localhost.localdomain:8080/"
)

type asset struct{
  file []byte
  path string
}

var (
  log *logger.StdLog
  engine *gin.Engine
  templates map[string]*template.Template
  assets map[string]*asset
)

func init() {
  gin.SetMode(gin.ReleaseMode)
  gin.DisableConsoleColor()

  var fh,   _ = os.Create("logs/access.log")
  gin.DefaultWriter = io.MultiWriter(fh)

  loadTemplates(
    "views/layout/_base.tmpl",
    map[string]string{
      "signin" : "views/account/signin.tmpl",
      "signup" : "views/account/signup.tmpl",
      "home"   : "views/client/home.tmpl",
      "contact": "views/client/contact.tmpl",
      "about"  : "views/client/about.tmpl",
      "message": "views/client/message.tmpl",
      "posta"  : "views/client/posta.tmpl",
      "postb"  : "views/client/postb.tmpl",
    },
  )

  loadAssets(
    map[string]string{
      "jquery":       "public/js/jquery.min.js",
      "bootstrapJS":  "public/js/bootstrap.bundle.min.js",
      "bootstrapCSS": "public/css/bootstrap.min.css",
      "style":        "public/css/style.css",
    },
  )
}

func loadTemplates(base string, page map[string]string) {
  templates = make(map[string]*template.Template)
  for k, v := range page {
    templates[k] = template.Must(template.ParseFiles(base, v))
  }
}

func loadAssets(files map[string]string) {
  assets = make(map[string]*asset)
  for k, v := range files {
    if file, err := ioutil.ReadFile(v); err != nil {
      assets[k] = &asset{
        path: RootUrl + v,
        file: file,
      }
    }
  }
}

func Router(user string, pass string, stdlog *logger.StdLog) *gin.Engine {

  log = stdlog
  engine = gin.New()

  var store = cookie.NewStore([]byte("secret"))
  store.Options(sessions.Options{
    Domain: "localhost.localdomain",
    Path: "/",
    MaxAge: 24*60*60,
    Secure: true,
    HttpOnly: true,
  })

  engine.Use(sessions.Sessions("GOSESSION", store))
  engine.Use(Initialize())
  engine.Use(Logger())
  engine.Use(gin.Recovery())

  var account = engine.Group("/account", checkAccount())
  {
    account.GET( "/signin",     SignInForm  )
    account.POST("/signin",     SignIn      )
    account.GET( "/signup",     SignUpForm  )
    account.POST("/signup",     SignUp      )
    account.GET( "/signout",    SignOut     )
  }

  var client = engine.Group("/client", checkClient())
  {
    client.GET( "/",            Home      )
    client.GET( "/contact",     Contact   )
    client.GET( "/about",       About     )
    client.GET( "/message",     Message   )
    client.GET( "/posta",       PostAForm ) 
    client.POST("/posta",       PostA     )
    client.GET( "/postb",       PostBForm ) 
    client.POST("/postb",       PostBData )
  }

  var api = engine.Group("/api", checkApi(user, pass))
  {
    api.GET( "/ping",           PingData )
    api.GET( "/geta",           GetAData ) 
    api.GET( "/getb",           GetBData ) 
    api.GET( "/getc",           GetCData ) 
    api.GET( "/getd",           GetDData ) 
    api.GET( "/gete/:name/:id", GetEData )
  }

  var public = engine.Group("/public")
  {
    public.Static("/img",       "assets/img/"   )
    public.Static("/css",       "assets/css/"   )
    public.Static("/js",        "assets/js/"    )
    public.Static("/fonts",     "assets/fonts/" )
  }

  var websocket = wsservice.NewRouter(log)
  var listener  = websocket.Run()

  engine.GET("/ws", func(c *gin.Context) {
    listener.HandleConnection(c.Writer, c.Request)
  })

  return engine
}

func Initialize() gin.HandlerFunc {
  return func(c *gin.Context) {
    var t = time.Now()
    c.Next()
    log.Debug("status: %d, latency: %s", c.Writer.Status(), time.Since(t))
  }
}

func Logger() gin.HandlerFunc {
  return gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
    return fmt.Sprintf("%s - [%s] \"%s %s %s %d %s \"%s\" %s\"\n",
      param.ClientIP,
      param.TimeStamp.Format(time.RFC1123),
      param.Method,
      param.Path,
      param.Request.Proto,
      param.StatusCode,
      param.Latency,
      param.Request.UserAgent(),
      param.ErrorMessage,
    )
  })
}

func checkAccount() gin.HandlerFunc {
  return func(c *gin.Context) {
    c.Set("baseurl", RootUrl)
    pushAssets(c)
  }
}

func checkClient() gin.HandlerFunc {
  return func(c *gin.Context) {
    var session Session
    if !session.checkSession(c) {
      session.clearSession(c)
      c.Redirect(http.StatusMovedPermanently, "/account/signin")
      c.Abort()
    }
    c.Set("baseurl", RootUrl)
    pushAssets(c)
  }
}

func checkApi(user, pass string) gin.HandlerFunc {
  return gin.BasicAuth(map[string]string{ user: pass });
}

func pushAssets(c *gin.Context) {
  if p := c.Writer.Pusher(); p != nil {
    for k, v := range assets {
      if err := p.Push(v.path, nil); err != nil {
        log.Error("Failed to push: %v.", err)
      } else {
        log.Debug("Success to push: %s.", k)
      }
    } 
  } else {
    log.Error("http.Pusher is not supported.")
  }
}
