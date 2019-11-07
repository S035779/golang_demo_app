package logger

import (
  "encoding/json"
  "fmt"
  "io"
  "log"
  "os"
  "runtime"
  "time"
)

type logger interface {
  Debug(format string, args ...interface{})
  Info(format string, args ...interface{})
  Error(format string, args ...interface{})
  Fatal(format string, args ...interface{})
}

type Level int

type Format int

const (
  DebugLevel    Level = iota
  InfoLevel
  ErrorLevel
  FatalLevel
  DisabledLevel
  JsonFormat    Format = iota
  ConsoleFormat
)

type StdLog struct {
  level   Level
  format  Format
  stderr  *log.Logger
  stdout  *log.Logger
  file    *log.Logger
}

func StdLogger(prefix string, writer io.Writer) *StdLog {
  return &StdLog{
    level:  InfoLevel,
    format: JsonFormat,
    stdout: log.New(os.Stdout, "", 0),
    stderr: log.New(os.Stderr, "", 0),
    file:   log.New(writer,    "", 0),
  }
}

func caller(calldepth int) string {
  var _, file, line, ok = runtime.Caller(calldepth)
  if !ok {
    file = "???"
    line = 0
  } else {
    var short = file
    for i := len(file) - 1; i > 0; i-- {
      if file[i] == '/' {
        short = file[i+1:]
        break
      }
    }
    file = short
  }
  return fmt.Sprintf("%s(%d)", file, line)
}

func jsonFormatter(severity, message string) (string, error) {
  var now = time.Now().Format(time.RFC3339Nano)
  var ent = map[string]string{"time": now, "severity": severity, "message": message}
  var jsn, err = json.Marshal(ent)
  return string(jsn), err
}

func consoleFormatter(severity, message string) (string, error) {
  var now = time.Now().Format(time.RFC3339)
  var ent = fmt.Sprintf("%s [%s] %s", now, severity, message)
  return ent, nil
}

func (l *StdLog) Option(level Level, format Format) {
  l.level = level
  l.format  = format
}

func (l *StdLog) Logger() *log.Logger {
  return log.New(l, "", 0)
}

func (l *StdLog) Write(message []byte) (int, error) {
  if l.level > ErrorLevel {
    return len(message), nil
  }

  var msg = caller(4) + " " + string(message)

  switch l.format {
  case JsonFormat:
    if jsn, err := jsonFormatter("error", msg); err == nil {
      l.stderr.Print(jsn)
      l.file.Print(jsn)
    } else {
      l.stderr.Fatal(err.Error())
    }
  case ConsoleFormat:
    if cli, err := consoleFormatter("error", msg); err == nil {
      l.stderr.Print(cli)
      l.file.Print(cli)
    } else {
      l.stderr.Fatal(err.Error())
    }
  default:
  }

  return len(message), nil
}

func (l *StdLog) Debug(format string, args ...interface{}) {
  if l.level > DebugLevel {
    return
  }

  var msg = caller(2) + " " + fmt.Sprintf(format, args...)

  switch l.format {
  case JsonFormat:
    if jsn, err := jsonFormatter("debug", msg); err == nil {
      l.stdout.Print(jsn)
      l.file.Print(jsn)
    } else {
      l.stdout.Fatal(err.Error())
    }
  case ConsoleFormat:
    if cli, err := consoleFormatter("debug", msg); err == nil {
      l.stdout.Print(cli)
      l.file.Print(cli)
    } else {
      l.stdout.Fatal(err.Error())
    }
  default:
  }
}

func (l *StdLog) Info(format string, args ...interface{}) {
  if l.level > InfoLevel {
    return
  }

  var msg = fmt.Sprintf(format, args...)

  switch l.format {
  case JsonFormat:
    if jsn, err := jsonFormatter("info", msg); err == nil {
      l.stdout.Print(jsn)
      l.file.Print(jsn)
    } else {
      l.stdout.Fatal(err.Error())
    }
  case ConsoleFormat:
    if cli, err := consoleFormatter("info", msg); err == nil {
      l.stdout.Print(cli)
      l.file.Print(cli)
    } else {
      l.stdout.Fatal(err.Error())
    }
  default:
  }
}

func (l *StdLog) Error(format string, args ...interface{}) {
  if l.level > ErrorLevel {
    return
  }

  var msg = caller(2) + " " + fmt.Sprintf(format, args...)

  switch l.format {
  case JsonFormat:
    if jsn, err := jsonFormatter("error", msg); err == nil {
      l.stderr.Print(jsn)
      l.file.Print(jsn)
    } else {
      l.stdout.Fatal(err.Error())
    }
  case ConsoleFormat:
    if cli, err := consoleFormatter("error", msg); err == nil {
      l.stderr.Print(cli)
      l.file.Print(cli)
    } else {
      l.stdout.Fatal(err.Error())
    }
  default:
  }
}

func (l *StdLog) Fatal(format string, args ...interface{}) {
  if l.level > FatalLevel {
    return
  }

  var msg = caller(2) + " " + fmt.Sprintf(format, args...)

  switch l.format {
  case JsonFormat:
    if jsn, err := jsonFormatter("fatal", msg); err != nil {
      l.stderr.Fatal(jsn)
      l.file.Fatal(jsn)
    } else {
      l.stdout.Fatal(err.Error())
    }
  case ConsoleFormat:
    if cli, err := consoleFormatter("fatal", msg); err != nil {
      l.stderr.Fatal(cli)
      l.file.Fatal(cli)
    } else {
      l.stdout.Fatal(err.Error())
    }
  default:
  }
}
