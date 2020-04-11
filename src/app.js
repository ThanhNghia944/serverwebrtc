console.log('Hello ')
var $ = require('jquery')
var Peer = require('simple-peer');
let p = {};
/**
    * New Media Moliza
**/
function playVideoStream (stream,idVideo ){
   console.log('Play VIDEO')
    let video = $('video' + idVideo)[0]
      video.srcObject = stream;
      video.onloadedmetadata = (element) =>{
          video.play()
      }
}
function openStream() {
      navigator.mediaDevices.getUserMedia({
         audio:false,
         video:true
       }).then(res => {
         console.log('Stream ' ,res)
         playVideoStream(res , '#localStream'); // mo video nguoi goi
          p = new Peer({
              initiator: location.hash === '#1',
              trickle: false, // ko dung server ben ngoai,
              stream:res
          })
          p.on('error', err => console.log('error Peer', err))
          p.on('signal', data => {
              $('#txtMySignal').val( JSON.stringify(data) )
              console.log('SIGNAL TOKEN', JSON.stringify(data))
          })
          p.on('stream', (stream) => {
             console.log('DATA STREAM ' );
             //play video stream may answer
            playVideoStream(stream , '#localStreamAnswer');// gui du lieu stream va mo video  cho nguoi nhan
          })
          $('#btnConnect').click( () => {
            const yourDataSignal = JSON.parse($('#inputYourSignal').val() );
            console.log('CLICK CONNECT ' );
            p.signal(yourDataSignal);
          })
       }).catch(err => {
         console.log('Error ' ,err)
       })
}
 /**
  *   End
* */

openStream();




// // p.on('connect', () => {
// //     console.log('CONNECTED')
// //     p.send('whatever' + Math.random())
// // })

// // p.on('data', (data) => {
// //     console.log('DATA RECEIVE ' , data)
// // })



// /**
//  * Component ,use Jquery
//  */



