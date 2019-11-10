var sock = null;
var uri  = 'wss://localhost.localdomain:8080/ws';

var open = function() {
  if(sock && sock.readState !== 1) {
    connect();
  }
};

var close = function() {
  if(sock && sock.readyState === 1) {
    disconnect();
  }
};

var send = function(msgid, body) {
  var packet = { 'id': msgid, 'body': body };
  var json = JSON.stringify(packet)
  message(json);
};

var message = function(json) {
  sock.send(json);
};

var disconnect = function() {
  sock.close();
};

var connect = function() {
  sock = new WebSocket(uri);

  sock.onopen = function(e) {
    $("#output").append((new Date()) + " ===> " + "Connect success.\n")

    $('#open').off();
    $("#close").click(function(e) {
      close();
    });
    $("#send").click(function(e) {
      var msg = "PING";
      $("#output").append((new Date()) + " ===> " + msg + "\n")
      send(1, { 'msg': msg });
    });
  };

  sock.onclose = function(e) {
    $("#output").append((new Date()) + " <=== " + "Connect close.\n")

    $('#send').off();
    $('#close').off();
    $("#open").click(function(e) {
      open();
    });
  };

  sock.onmessage = function(e) {
    var json = JSON.parse(e.data)
    var msgid = json.id;
    var body = json.body;
    if (msgid == 1) {
      $("#output").append((new Date()) + " <=== " + body.msg + "\n");
    }
  };
};

connect();
