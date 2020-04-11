console.log('Hello ')
var $ = require('jquery')
var Peer = require('simple-peer')
const p = new Peer({
    initiator: location.hash === '#1',
    trickle: false // ko dung server ben ngoai
})

p.on('error', err => console.log('error Peer', err))
p.on('signal', data => {
    $('#txtMySignal').val( JSON.stringify(data) )
    console.log('SIGNAL TOKEN', JSON.stringify(data))
})
p.on('connect', () => {
    console.log('CONNECTED')
    p.send('whatever' + Math.random())
})

p.on('data', (data) => {
    console.log('DATA RECEIVE ' , data)
})



/**
 * Component ,use Jquery
 */
$('#btnConnect').click( () => {
    const yourDataSignal = JSON.parse($('#inputYourSignal').val() );
    p.signal(yourDataSignal);
})


