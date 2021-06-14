const express = require('express')
const app = express()
const server = app.listen(3000, () => {
    console.log('listening on 3000 port!')
})
const cookieParser = require('cookie-parser')

// 이 부분은 좀 어렵다... 기억이 안나네...
app.set('views', './views')
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

const indexRouter = require('./routes/index')
const deviceRouter = require('./routes/devices')

app.use(express.json())
app.use(express.urlencoded({
    extended: false
}))
app.use(cookieParser())

app.use('/', indexRouter)
app.use('/devices', deviceRouter)

// MongoDB 접속
const mongoDB = require("mongodb").MongoClient
const url = "mongodb://wook:rejavaji@127.0.0.1:27017/?authSource=admin"
let dbObj = null // DB에 저장할 데이터를 담을 변수

mongoDB.connect(url, function (err, db) {
    dbObj = db.db('mqtt_project')
    console.log("DB Connect .......")
})

// MQTT Server 접속, DHT11 센서 데이터를 읽기
const mqtt = require('mqtt')
const client = mqtt.connect('mqtt://112.169.87.3:1883')

client.on('connect', function () {
    client.subscribe('dht11')
})

client.on('message', function (topic, message) {
    // console.log(topic + ':' + message.toString())
    let obj = JSON.parse(message)
    obj.created_at = new Date()
    console.log(obj)
    // MongoDB에 DHT11 센서 정보를 저장하는 부분
    let dht11 = dbObj.collection('dht11') // dht11이라는 테이블을 가지고 와라!
    dht11.save(obj, function (err, result) {
        if (err) console.log(err);
        else
            console.log(JSON.stringify(result)) // {"n" : 1, "ok" : 1}
    })
})

// 소켓을 이용한 통신
// 일단 사용방식이 좀 옛스럽다...ㅋㅋ
const io = require("socket.io")(server)
io.on("connection", function (socket) {
    socket.on("socket_evt_mqtt", function (data) {
        let dht11 = dbObj.collection("dht11")
        dht11.find({}).sort({
            _id: -1
        }).limit(1).toArray(function (err, results) {
            if (!err) {
                socket.emit("socket_evt_mqtt", JSON.stringify(results[0]))
            }
        })
    })

    socket.on("socket_evt_led", function (data) {
        let obj = JSON.parse(data)
        client.publish("led", obj.led.toString())
    })
})

// app.get('/', (req, res) => {
//     res.render('index', {
//         title: 'Express'
//     })
// })

// app.post('/devices', (req, res) => {
//     res.render('index', {
//         title: 'Express'
//     })
// })