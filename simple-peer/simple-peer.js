var Peer = require('simple-peer')
const p = new Peer({
    initiator: location.hash === '#1',
    trickle: false // ko dung server ben ngoai
})

p.on('error', err => console.log('error Peer', err))
p.on('signal', data => {
    console.log('SIGNAL TOKEN', JSON.stringify(data))
})


