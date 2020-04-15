const $ = require('jquery');

function getIceObject(cb) {
    // $.ajax({
    //     url: "https://service.xirsys.com/ice",
    //     data: {
    //         ident: "vanpho",
    //         secret: "2b1c2dfe-4374-11e7-bd72-5a790223a9ce",
    //         domain: "vanpho93.github.io",
    //         application: "default",
    //         room: "default",
    //         secure: 1
    //     },
    //     success: function (data, status) {
    //         // data.d is where the iceServers object lives
    //         cb(data.d);
    //     },
    // });
}

module.exports = getIceObject;
