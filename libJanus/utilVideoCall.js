const doSimulcast =
  getQueryStringValue("simulcast") === "yes" ||
  getQueryStringValue("simulcast") === "true";
const doSimulcast2 =
  getQueryStringValue("simulcast2") === "yes" ||
  getQueryStringValue("simulcast2") === "true";

export function registerUsername(videocallIntansce, username) {
  // MARK  dang KY username
  var register = { request: "register", username: username };
  videocallIntansce.send({ message: register });
}

export function resetStatus(videocallIntansce) {
  videocallIntansce.hangup();
}

export function callByUsername(videocallIntansce, username) {
  videocallIntansce.createOffer({
    // By default, it's sendrecv for audio and video...
    media: { data: true }, // ... let's negotiate data channels as well
    // If you want to test simulcasting (Chrome and Firefox only), then
    // pass a ?simulcast=true when opening this demo page: it will turn
    // the following 'simulcast' property to pass to janus.js to true
    simulcast: doSimulcast,
    success: function (jsep) {
      Janus.debug("Got SDP!");
      Janus.debug(jsep);
      console.log("call success");
      var body = { request: "call", username: username };
      videocallIntansce.send({ message: body, jsep: jsep });
    },
    error: function (error) {
      console.log("call fail WebRTC");
      Janus.error("WebRTC error...", error);
    },
  });
}

export function acceptIncoming(videocallIntansce, jsep) {
  videocallIntansce.createAnswer({
    jsep: jsep,
    // No media provided: by default, it's sendrecv for audio and video
    media: { data: true }, // Let's negotiate data channels as well
    // If you want to test simulcasting (Chrome and Firefox only), then
    // pass a ?simulcast=true when opening this demo page: it will turn
    // the following 'simulcast' property to pass to janus.js to true
    simulcast: doSimulcast,
    success: function (jsep) {
      Janus.debug("Got SDP!");
      Janus.debug(jsep);
      var body = { request: "accept" };
      videocallIntansce.send({ message: body, jsep: jsep });
    },
    error: function (error) {
      Janus.error("WebRTC error:", error);
      bootbox.alert("WebRTC error... " + JSON.stringify(error));
    },
  });
}

export function handleRemoteJsep(videocallIntansce, jsep){
  videocallIntansce.handleRemoteJsep({jsep: jsep});
}

export function doHangup(videocallIntansce) {
  var hangup = { request: "hangup" };
  videocallIntansce.send({ message: hangup });
  // videocallIntansce.hangup();
}

export function setAudio(videocallIntansce, isAudioEnabled) {
  videocallIntansce.send({
    message: { request: "set", audio: isAudioEnabled },
  });
}

export function setVideo(videocallIntansce, isVideoEnabled) {
  videocallIntansce.send({
    message: { request: "set", video: isVideoEnabled },
  });
}

export function listUsername(videocallIntansce) {
  videocallIntansce.send({
    message: { request: "list" },
  });
}

export default {
  registerUsername,
  resetStatus,
  callByUsername,
  acceptIncoming,
  handleRemoteJsep,
  doHangup,
  setAudio,
  setVideo,
  listUsername,
};

// Helper to parse query string
function getQueryStringValue(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
  return results === null
    ? ""
    : decodeURIComponent(results[1].replace(/\+/g, " "));
}
