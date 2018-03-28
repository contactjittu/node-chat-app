'use strict';

const http = require('http');
const path = require('path');
const express = require('express');
const socketIO = require('socket.io');

const { generateMessage } = require('./utils/message')
const publicPath = path.join(__dirname, '../public');
let app = express();
let port = process.env.PORT || 3000;
app.use(express.static(publicPath));

let server = http.createServer(app);
let io = socketIO(server);

io.on('connection', (socket) => {
    console.log('New user connected');

    socket.emit('newMessage', generateMessage('Adam','Welcome to Jungle'));

    socket.broadcast.emit('newMessage',generateMessage('Admin','New user Joined'));

    socket.on('createMessage', (message)=> {
        console.log('Create message: ', message);
        io.emit('newMessage',generateMessage(message.from, message.text));
        // socket.broadcast.emit('newMessage',{
        //     from: message.from,
        //     text: message.text,
        //     createAt: new Date().getTime()
        // });
    })

    socket.on('disconnect', ()=> {
        console.log('User disconnected');
    });

})

server.listen(port, ()=> {
    console.log(`Server is listining on port : ${port}`);
})