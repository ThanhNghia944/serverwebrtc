const Peer = require('peerjs');
const uid = require('uid');
const $ = require('jquery');
const openStream = require('./openStream');
const playVideo = require('./playVideo');
import io from 'socket.io-client';
const socket = io();
socket.on('connect', function(data) {
    console.log('socket client connect success');
});
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
    const peerId = getPeer();
    //gui PeerId len server socket khi connect
    socket.emit('NEW_PEER_ID', peerId);

    const peer = new Peer(peerId, connectionObj);
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
function getPeer() {
    const id = uid(10);
    $('#peer-id').append(id);
    return id;
}

$(`#ulPeerId`).on('click','li', function(){
    const friendId = $(this).text();
        openStream(stream => {
            playVideo(stream, 'localStream');
            const call = peer.call(friendId, stream);
            call.on('stream', remoteStream => playVideo(remoteStream, 'friendStream'))
        });
})
/**
 * socket
 *
 */
socket.on('ONLINE_PEER_ARRAY',arrayPeerId => {
    arrayPeerId.forEach(peerId => {
        $('#ulPeerId').append(`<li id='${peerId}'>${peerId}</li>`)

    });
})
socket.on('NEW_CLIENT_CONNECT', peerId => {
    console.log('New User Client : ' , peerId)
    $('#ulPeerId').append(`<li id='${peerId}'>${peerId}</li>`)
})
socket.on('PEER_ID_DISCONNECT',peerId => {
        $(`#${peerId}`).remove()
})