let apn = require("apn");

var options = {
    token: {
      key: __dirname  + "/AuthKey_YSYCJTRQ93.p8",
      keyId: "YSYCJTRQ93",
      teamId: "T867D62YUB"
    },
    pfx:__dirname + '/p12_void_new_Certificates.p12',
    
    // proxy: {
    //   host: "192.168.1.106",
    //   port: 4443
    // },
    production: false
  };
  let apnProvider = new apn.Provider(options);

const pushApn = (deviceToken) => {

  let note = new apn.Notification();
  note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
  note.badge = 1;
  // note.priority= 5;
  // note.pushType = 'voip'
  // note.voip = true;
  note.alert = "You have 111 new call";
  note.payload = {
     messageFrom: "John Appleseed",
     uuid:"0731961b-415b-44f3-a960-dd94ef3372fc",
     callerName:"Nguyen Thanh Nghia",
     handle:"testemail@email.com",
     extraPayLoad:"John Appleseed ID",
     isVideo:true,
     };
  note.topic = "com.demo.practice.webrtc.voip";
  apnProvider.send(note, [deviceToken]).then( (response) => {
    // see documentation for an explanation of result
    if(response.failed && response.failed.length > 0){
        console.log('Error push APN : ' + JSON.stringify( response) )
    }else{
      console.log('Success')
    }
    return response
  }).catch(e => {
      console.log('Error push APN : ' + e)
      return null;
  })
}
module.exports = pushApn;
