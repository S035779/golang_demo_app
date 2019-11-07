package models

import(
  "log"

  _ "github.com/go-sql-driver/mysql"
  "github.com/gocraft/dbr"
  "github.com/gocraft/dbr/dialect"
)

type Users struct {
  ID        int64  `db:"id"`
  Username  string `db:"username"`
  Password  string `db:"password"`
  Firstname string `db:"firstname"`
  Lastname  string `db:"lastname"`
  Email     string `db:"email"`
}

var (
  mysqlSession *dbr.Session
)

func init() {
  var conn, _ = dbr.Open(
    "mysql", 
    "mamoru_hashimoto:mamo1114@tcp(127.0.0.1:3306)/development_db", 
    nil,
  ) 
  conn.SetMaxOpenConns(10)
  mysqlSession = conn.NewSession(nil)
}

func (user *Users) SelectUser() (error, int) {
  var sess = mysqlSession
  var stmt = sess.
    Select("*").
    From("users").
    Where("username = ? AND password = ?", user.Username, user.Password)
  if cnt, err := stmt.Load(&user); err != nil {
    log.Println(err.Error())
    var buf = dbr.NewBuffer()
    if stmt.Build(dialect.MySQL, buf) == nil {
      log.Println(buf.String())
      log.Println(buf.Value())
    }
    return err, 0
  } else {
    return nil, cnt
  }
}

func (user *Users) SelectUsers() (error, []*Users) {
  var users []*Users
  var sess = mysqlSession
  var stmt = sess.
    Select("*").
    From("users")
  if _, err := stmt.Load(&users); err != nil {
    log.Println(err.Error())
    var buf = dbr.NewBuffer()
    if stmt.Build(dialect.MySQL, buf) == nil {
      log.Println(buf.String())
      log.Println(buf.Value())
    }
    return err, users
  } else {
    return nil, users
  }
}

func (user *Users) InsertUser() (error, int64) {
  var sess = mysqlSession
  var stmt = sess.
    InsertInto("users").
    Columns("username", "password", "firstname", "lastname", "email").
    Record(user)
  if err := stmt.Load(&user.ID); err != nil {
    log.Println(err.Error())
    var buf = dbr.NewBuffer()
    if stmt.Build(dialect.MySQL, buf) == nil {
      log.Println(buf.String())
      log.Println(buf.Value())
    }
    return err, 0
  } else {
    return nil, user.ID
  }
}

func UpdateUser(data *Users) error {
  var sess = mysqlSession
  var userMap = map[string]interface{}{
    "username":   data.Username,
    "password":   data.Password,
    "firstname":  data.Firstname,
    "lastname":   data.Lastname,
    "email":      data.Email,
  }
  var _, err = sess.
    Update("users").
    SetMap(userMap).
    Where("id = ?", data.ID).
    Exec()
  if err != nil {
    log.Println(err.Error())
  }
  return err
}

func DeleteUser(data *Users) error {
  var sess = mysqlSession
  var _, err = sess.
    DeleteFrom("users").
    Where("id = ?", data.ID).
    Exec()
  if err != nil {
    log.Println(err.Error())
  }
  return err
}
