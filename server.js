const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')


app.set('view engine', 'ejs')
app.use(express.static('public'))

var cors = require('cors')

app.use(cors());

app.options('*', cors())

const userList = {}

app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId, userName) => {
        socket.join(roomId)
        userList[socket.id] = userName;
        socket.broadcast.to(roomId).emit('user-connected', userId, userName);
        // socket.to(roomId).broadcast.emit('user-connected', userId);

        socket.on('disconnect', () => {
                socket.broadcast.to(roomId).emit('user-disconnected', userId, userName)
                    // socket.to(roomId).broadcast.emit('user-disconnected', userId)
            })
            // messages
        socket.on('message', message => {
            //send message to the same room
            socket.to(roomId).emit('createMessage', message, userList[socket.id])

        });


    })
})

server.listen(process.env.PORT || 3000)