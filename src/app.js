const Peer = require("peerjs");
const uid = require("uid");
const $ = require("jquery");
const openStream = require("./openStream");
const playVideo = require("./playVideo");
import io from "socket.io-client";
const socket = io();

socket.on("connect", function(data) {
  console.log("socket client connect success");
});
// const getIceObject = require('./getIceObject');
// getIceObject(iceConfig => {
const connectionObj = {
  host: "9000-a3f10ba9-25e4-447e-af24-103f293291ba.ws-us02.gitpod.io",
  port: 443, //port mac dinh 443 ( 9000 err)
  secure: true
  // path:'/'
  // key: 'myapp',
  // config: iceConfig
};
const peerId = getPeer();
//gui PeerId len server socket khi connect
socket.emit("NEW_PEER_ID", peerId);

const peer = new Peer(peerId, connectionObj);
$("#btnCall").click(() => {
  const friendId = $("#txtFriendId").val();

    /**
   * web
   */
  // socket.emit("call-user", {
  //  to: friendId,
  //  from: peerId
  // });


  fetch(`http://192.168.1.105:4443/push-apn/527b5f73d680efeedb62964b4cbdd9e662b64f9ae2a05ba4a473db6200097ded?from=` + peerId + '&to=' + friendId);

});

peer.on("call", call => {
  console.log("User call");
  openStream(stream => {
    playVideo(stream, "localStream");
    call.answer(stream);
    call.on("stream", remoteStream => playVideo(remoteStream, "friendStream"));
  });
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

 /**
  * mobile
  */
 fetch(`http://192.168.1.105:4443/push-apn/527b5f73d680efeedb62964b4cbdd9e662b64f9ae2a05ba4a473db6200097ded?from=` + peerId + '&to=' + friendId);



 /**
  * demo cu
  */
  // openStream(stream => {
  //     // fetch(`http://192.168.0.251:4443/push-apn/527b5f73d680efeedb62964b4cbdd9e662b64f9ae2a05ba4a473db6200097ded`);
  //     playVideo(stream, 'localStream');
  //     console.log('1')
  //     const call = peer.call(friendId, stream);
  //     console.log('11')
  //     call.on('stream', remoteStream => playVideo(remoteStream, 'friendStream'))
  // });


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
  console.log("DATA ", data);
  try {
    await openStream(stream => {
      // fetch(`http://192.168.0.251:4443/push-apn/527b5f73d680efeedb62964b4cbdd9e662b64f9ae2a05ba4a473db6200097ded`);
      playVideo(stream, "localStream");
      const call = peer.call(data.from, stream);
      console.log("11");
      call.on("stream", remoteStream =>
        playVideo(remoteStream, "friendStream")
      );
    });
    console.log("1000");
  } catch (e) {
    console.log("10001", e);
  }
});
