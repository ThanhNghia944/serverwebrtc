const Peer = require("peerjs");
const uid = require("uid");
const $ = require("jquery");
const openStream = require("./openStream");
const playVideo = require("./playVideo");
import io from "socket.io-client";
const socket = io();
const { RTCPeerConnection, RTCSessionDescription } = window;
const peerConnection = new RTCPeerConnection();

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
  openStream(stream => {
    // fetch(`http://192.168.0.251:4443/push-apn/527b5f73d680efeedb62964b4cbdd9e662b64f9ae2a05ba4a473db6200097ded`);

    playVideo(stream, "localStream");
    const call = peer.call(friendId, stream);
    call.on("stream", remoteStream => playVideo(remoteStream, "friendStream"));
  });
});

peer.on("call", call => {
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
  openStream(async stream => {
    playVideo(stream, "localStream");
    console.log("ONTRACT11111", stream);
    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

  
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(new RTCSessionDescription(offer));
    socket.emit("call-user", {
      offer,
      to: friendId,
      from: peerId
    });

    // const call = peer.call(friendId, stream);
    // call.on('stream', remoteStream => playVideo(remoteStream, 'friendStream'))
  });
});
  //handler for ontrack event web rtc:
  peerConnection.ontrack = function({ streams: [stream] }) {
    console.log("ONTRACT", stream);
    // playVideo(stream, 'friendStreamUp');
    playVideo(stream, "friendStreamUp");
  };

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
//webRTC
socket.on("call-made", async data => {
  console.log("DATA call-made", data);

  await peerConnection.setRemoteDescription(
    new RTCSessionDescription(data.offer)
  );
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(new RTCSessionDescription(answer));

  socket.emit("make-answer", {
    answer,
    to: data.from,
    from:data.socket
  });

});

async function callUser(socketId) {
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(new RTCSessionDescription(offer));

  socket.emit("call-user", {
    offer,
    to: socketId
  });
}
socket.on("answer-made", async data => {
  console.log("DATA answer-made", data);

  await peerConnection.setRemoteDescription(
    new RTCSessionDescription(data.answer)
  );
  callUser(data.socket);

  // if (!isAlreadyCalling) {
  //   callUser(data.socket);
  // //   isAlreadyCalling = true;
  // }
});
