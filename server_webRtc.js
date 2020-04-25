var express = require("express");
var app = express();
var open = require("open");
var serverPort = 4443;
var http = require("http");
var server = http.createServer(app);
var io = require("socket.io")(server);
const pushApn = require('./apn/index');

var sockets = {};
var users = {};

function sendTo(connection, message) {
  connection.send(message);
}
app.use(express.static(__dirname + "/")); //add public static file ( cho client )

app.get("/push-apn/:token",async function(req, res) {
    const token = req.params.token;
    const response = await pushApn(token);
    res.json(response)
});

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

const arrayPeerId = [];

io.on("connection", function(socket) {
  console.log("user connected");

  socket.on("call-user", (data) => {
    if(sockets[data.to]){
      console.log('ok call-user')
      console.log('socket.id',socket.peerId );
      sockets[data.to].emit("call-made", {
        offer: data.offer,
        socket: data.from,
        from: data.to
      });
    }
    

  });

  socket.on("make-answer", data => {
    console.log('DATA make-answer')
    if(sockets[data.to]){
      sockets[data.to].emit("answer-made", {
        socket: data.from,
        answer: data.answer
      });
    }

  });

  socket.on('NEW_PEER_ID',peerId => {
      socket.peerId = peerId;
      sockets[peerId] = socket;
      arrayPeerId.push(peerId);
      console.log("New client connect : ", peerId);
      io.emit('NEW_CLIENT_CONNECT',peerId)
  });

  //gui danh sach online hien tai
  socket.emit('ONLINE_PEER_ARRAY',arrayPeerId);

  socket.on("disconnect", function() {
    console.log("user disconnected : " ,socket.peerId);
    const indexPeerId = arrayPeerId.indexOf(socket.peerId);
    arrayPeerId.splice(indexPeerId,1)
    //phat su kien cho toan bo user
    io.emit('PEER_ID_DISCONNECT', socket.peerId)
    delete socket.peerId

   //  if (socket.name) {
   //    socket.broadcast
   //      .to("chatroom")
   //      .emit("roommessage", { type: "disconnect", username: socket.name });
   //    delete sockets[socket.name];
   //    delete users[socket.name];
   //  }
  });


  //   socket.on('message', function(message){
  //     var data = message;
  //     switch (data.type) {
  //     case "login":
  //       console.log("User logged", data.name);
  //       //if anyone is logged in with this username then refuse
  //       if(sockets[data.name]) {
  //          sendTo(socket, {
  //             type: "login",
  //             success: false
  //          });
  //       } else {
  //          //save user connection on the server
  //          var templist = users;
  //          sockets[data.name] = socket;
  //          socket.name = data.name;
  //          sendTo(socket, {
  //             type: "login",
  //             success: true,
  //             username: data.name,
  //             userlist: templist
  //          });
  //          socket.broadcast.to("chatroom").emit('roommessage',{ type: "login", username: data.name})
  //          socket.join("chatroom");
  //          users[data.name] = socket.id
  //       }

  //       break;
  //       case "call_user":
  //       // chek if user exist
  //         if(sockets[data.name]){
  //           console.log("user called");
  //           console.log(data.name);
  //           console.log(data.callername);
  //         sendTo(sockets[data.name], {
  //            type: "answer",
  //            callername: data.callername
  //         });
  //       }else{
  //         sendTo(socket, {
  //            type: "call_response",
  //            response: "offline"
  //         });
  //       }
  //       break;
  //       case "call_accepted":
  //       sendTo(sockets[data.callername], {
  //          type: "call_response",
  //          response: "accepted",
  //          responsefrom : data.from

  //       });
  //       break;
  //       case "call_rejected":
  //       sendTo(sockets[data.callername], {
  //          type: "call_response",
  //          response: "rejected",
  //          responsefrom : data.from
  //       });
  //       break;
  //       case "call_busy":
  //       sendTo(sockets[data.callername], {
  //          type: "call_response",
  //          response: "busy",
  //          responsefrom : data.from
  //       });
  //       default:
  //       sendTo(socket, {
  //          type: "error",
  //          message: "Command not found: " + data.type
  //       });
  //       break;
  // }
  //   })
});

server.listen(process.env.PORT || serverPort, function() {
  console.log("server up and running at %s port", serverPort);
});
