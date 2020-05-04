import "./janus";
import EventEmitter from "events";
import { PLUGIN_NAME, EV_NAME } from "./types";
import adapter from "webrtc-adapter";

const EEJanus = new EventEmitter();
//"https://janus.tuti-lys.com/janusbase/janus";
//"wss://janus.conf.meetecho.com/ws"; 
const SERVER =  "wss://janus.conf.meetecho.com/ws"; 
const OPAQUEID = "randomString";
let janus;
let videocall;
Janus.init({
  debug: true,
  dependencies: Janus.useDefaultDependencies({
    adapter,
  }), // or: Janus.useOldDependencies() to get the behaviour of previous Janus versions
  callback: function () {
    // Done!
    console.log("Janus init success");
  },
});

export function destroy() {
  janus.destroy();
}
export function connectServer() {
  return new Promise((resolve, reject) => {
    janus = new Janus({
      server: SERVER,
      success: function () {
        console.log("session", janus.getSessionId());
        resolve(janus);
      },
      error: function (cause) {
        console.log("err", cause);
        reject(cause);
      },
      destroyed: function () {
        console.log("destroyed");
        reject("desstroyed");
      },
    });
  });
}

export function createVideoCallIntance() {
  return new Promise((resolve, reject) => {
    janus.attach({
      plugin: PLUGIN_NAME.PLUGIN_VIDEOCALL,
      opaqueId: OPAQUEID,
      success: function (pluginHandle) {
        resolve(pluginHandle);
        videocall = pluginHandle;
        Janus.log(
          "Plugin attached! (" +
            videocall.getPlugin() +
            ", id=" +
            videocall.getId() +
            ")"
        );
      },
      error: function (error) {
        Janus.error("  -- Error attaching plugin...", error);
        reject(error);
      },
      consentDialog: function (on) {
        console.log("Consent dialog should be " + (on ? "on" : "off") + " now");
      },
      mediaState: function (medium, on) {
        console.log("mediaState", medium);
        Janus.log(
          "Janus " + (on ? "started" : "stopped") + " receiving our " + medium
        );
      },
      webrtcState: function (on) {
        Janus.log(
          "Janus says our WebRTC PeerConnection is " +
            (on ? "up" : "down") +
            " now"
        );
      },
      onmessage: function (msg, jsep) {
        console.log(" ::: Got a message :::");
        console.log(msg, jsep);
        if (msg.error) {
          switch (msg.error_code) {
            case 478: {
              EEJanus.emit(EV_NAME.VIDEOCALL_USER_CALL_NOT_EXIST, msg.error);
              break;
            }
          }
          return;
        }
        const { list, event, ...payload } = msg.result;
        if (list) {
          return EEJanus.emit(EV_NAME.VIDEOCALL_LIST, list);
        }
        switch (event) {
          case "registered": {
            EEJanus.emit(EV_NAME.VIDEOCALL_REGISTERED, payload);
            break;
          }
          case "calling": {
            EEJanus.emit(EV_NAME.VIDEOCALL_CALLING);
            break;
          }
          case "accepted": {
            EEJanus.emit(EV_NAME.VIDEOCALL_ACCEPTED, { jsep });
            break;
          }
          case "incomingcall": {
            EEJanus.emit(EV_NAME.VIDEOCALL_INCOMINGCALL, { ...payload, jsep });
            break;
          }
          case "hangup": {
            EEJanus.emit(EV_NAME.VIDEOCALL_HANGUP, payload);
            break;
          }
        }
      },
      onlocalstream: function (stream) {
        console.log(" ::: Got a local stream :::");
        console.log(stream);
        EEJanus.emit(EV_NAME.STREAM_LOCAL, stream);
      },
      onremotestream: function (stream) {
        console.log(" ::: Got a remote stream :::");
        console.log(stream);
        EEJanus.emit(EV_NAME.STREAM_REMOTE, stream);
      },
      ondataopen: function (data) {
        Janus.log("The DataChannel is available!");
      },
      ondata: function (data) {
        console.log("We got data from the DataChannel! " + data);
      },
      oncleanup: function () {
        Janus.log(" ::: Got a cleanup notification :::");
      },
    });
  });
}

export function attachMediaStream(domVideo, stream) {
  Janus.attachMediaStream(domVideo, stream);
}

export { EV_NAME, PLUGIN_NAME } from "./types";
export default {
  event: EEJanus,
  connectServer,
  createVideoCallIntance,
  destroy,
  attachMediaStream,
};
