const uid = require("uid");
const $ = require("jquery");
const playVideo = require("./playVideo");
import io from "socket.io-client";
import libJ, { EV_NAME } from "../libJanus";
import _utilVideoCall from "../libJanus/utilVideoCall";

const socket = io();

socket.on("connect", function(data) {
  console.log("socket client connect success");
});

const peerId = getPeer();
//gui PeerId len server socket khi connect
socket.emit("NEW_PEER_ID", peerId);

$("#btnCall").click(e => {
  // const friendId = $("#txtFriendId").val();

  /**
   * web
   */
  // socket.emit("call-user", {
  //  to: friendId,
  //  from: peerId
  // });
  let yourName = $("#txtFriendId").val();
  _utilVideoCall.callByUsername(videocallIntance, yourName);

  // fetch(`http://192.168.1.10:4443/push-apn/527b5f73d680efeedb62964b4cbdd9e662b64f9ae2a05ba4a473db6200097ded?from=` + peerId + '&to=' + friendId);
});

function getPeer() {
  const id = uid(10);
  $("#peer-id").append(id);
  return id;
}

$(`#ulPeerId`).on("click", "li", function() {
  const friendId = $(this).text();

  /**
   * web
   */
  //socket.emit("call-user", {
  // to: friendId,
  //  from: peerId
  // });
  _utilVideoCall.callByUsername(videocallIntance, friendId);

  /**
   * mobile
   */
  //  fetch(`http://192.168.1.10:4443/push-apn/527b5f73d680efeedb62964b4cbdd9e662b64f9ae2a05ba4a473db6200097ded?from=` + peerId + '&to=' + friendId);
});
/**
 * socket
 *
 */
socket.on("ONLINE_PEER_ARRAY", arrayPeerId => {
  arrayPeerId.forEach(peerId => {
    $("#ulPeerId").append(`<li id='${peerId}'>${peerId}</li>`);
  });
});
socket.on("NEW_CLIENT_CONNECT", peerId => {
  console.log("New User Client : ", peerId);
  $("#ulPeerId").append(`<li id='${peerId}'>${peerId}</li>`);
});
socket.on("PEER_ID_DISCONNECT", peerId => {
  $(`#${peerId}`).remove();
});

socket.on("call-made", async data => {
  let value = confirm("User " + data.to + " call you ");
  let isAccept = false;
  if (value) {
    isAccept = true;
  }
  socket.emit("make-answer", {
    from: data.from,
    to: data.to,
    isAccept
  });
});

socket.on("reject-answer", async data => {
  alert("User " + data.from + " reject call ");
});
socket.on("accept-answer", async data => {
  try {
    _utilVideoCall.callByUsername(videocallIntance, data.from);
  } catch (e) {
    console.log("10001", e);
  }
});

let janusIntance;
let videocallIntance;
init();
async function init() {
  janusIntance = await libJ.connectServer();
  videocallIntance = await libJ.createVideoCallIntance();
  _utilVideoCall.registerUsername(videocallIntance, peerId);
  libJ.event.on(EV_NAME.VIDEOCALL_REGISTERED, payload => {
    console.log("day la payload tu event", payload);
    console.log("registed user: " + payload.username);
  });
  libJ.event.on(EV_NAME.VIDEOCALL_ACCEPTED, payload => {
    _utilVideoCall.handleRemoteJsep(videocallIntance, payload.jsep);
  });
  libJ.event.on(EV_NAME.STREAM_LOCAL, stream => {
    console.log("steaming local");
    playVideo(stream, "localStream");
  });
  libJ.event.on(EV_NAME.STREAM_REMOTE, stream => {
    console.log("steaming remote");
    playVideo(stream, "friendStream");
  });
  libJ.event.on(EV_NAME.VIDEOCALL_INCOMINGCALL, payload => {
    console.log("incommimg", payload);
    setTimeout( () => { var res = confirm(payload.username + " is calling you");
    if (res == true) {
      console.log("call accepted");
      _utilVideoCall.acceptIncoming(videocallIntance, payload.jsep);
    } else {
      _utilVideoCall.doHangup(videocallIntance);
    }
  },1000);

  });
}
