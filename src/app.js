const Peer = require('peerjs');
const uid = require('uid');
const $ = require('jquery');
const openStream = require('./openStream');
const playVideo = require('./playVideo');
// const getIceObject = require('./getIceObject');

// getIceObject(iceConfig => {
    const connectionObj = {
        host: '9000-a3f10ba9-25e4-447e-af24-103f293291ba.ws-us02.gitpod.io',
        port: 443,//port mac dinh 443 ( 9000 err)
        secure: true,
        // path:'/'
        // key: 'myapp',
        // config: iceConfig
    };

    const peer = new Peer(getPeer(), connectionObj);

    $('#btnCall').click(() => {
        const friendId = $('#txtFriendId').val();
        openStream(stream => {
            playVideo(stream, 'localStream');
            const call = peer.call(friendId, stream);
            call.on('stream', remoteStream => playVideo(remoteStream, 'friendStream'))
        });
    });

    peer.on('call', call => {
        openStream(stream => {
            playVideo(stream, 'localStream');
            call.answer(stream);
            call.on('stream', remoteStream => playVideo(remoteStream, 'friendStream'));
        });
    });

// });

function getPeer() {
    const id = uid(10);
    $('#peer-id').append(id);
    return id;
}




