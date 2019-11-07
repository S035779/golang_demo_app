var sock = new WebSocket('wss://localhost.localdomain:8080/ws');

var send = function(msgid, body) {
  var packet = { 'id': msgid, 'body': body };
  var json = JSON.stringify(packet)
  sock.send(json)
};

sock.onopen = function(e) {
  $("#output").append((new Date()) + " ===> " + "Connect success.\n")
  $("#send").click(function(e) {
    var msg = "PING";
    $("#output").append((new Date()) + " ===> " + msg + "\n")
    send(1, { 'msg': msg });
  });
};

sock.onclose = function(e) {
  $("#output").append((new Date()) + " <=== " + "Connect close.\n")
};

sock.onmessage = function(e) {
  var json = JSON.parse(e.data)
  var msgid = json.id;
  var body = json.body;
  if (msgid == 1) {
    $("#output").append((new Date()) + " <=== " + body.msg + "\n");
  }
};
