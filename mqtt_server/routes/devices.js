const express = require('express')
const router = express.Router()

const mqtt = require('mqtt')
const client = mqtt.connect('mqtt://112.169.87.3:1883')

/* GET home page */
router.post('/led/:flag', function(req, res, next) {
    res.set('Content-Type', 'text/json')
    if (req.params.flag == "on") {
        // MQTT -> led : 1
        client.publish("led", '1')
        res.send(JSON.stringify({led:'on'}))
    } else {
        client.publish("led", '2')
        res.send(JSON.stringify({led:'off'}))
    }
})

module.exports = router