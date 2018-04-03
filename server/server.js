'use strict';

const http = require('http');
const path = require('path');
const express = require('express');
const socketIO = require('socket.io');

const { generateMessage, generateLocationMessage } = require('./utils/message');
const { isRealString } = require('./utils/validate');
const { Users } = require('./utils/users');
const publicPath = path.join(__dirname, '../public');
let app = express();
let port = process.env.PORT || 3000;
app.use(express.static(publicPath));

let server = http.createServer(app);
let io = socketIO(server);
let users = new Users();

io.on('connection', (socket) => {
    console.log('New user connected');

    socket.on('join', (params, callback) => {
        if(!isRealString(params.name) || !isRealString(params.room)){
            return callback('Name and room name are required');
        }
        socket.join(params.room);
        users.removeUser(socket.id);
        users.addUser(socket.id, params.name, params.room);

        io.to(params.room).emit('updateUserList', users.getUserList(params.room));
        socket.emit('newMessage', generateMessage('Admin','Welcome to Chat app'));

        socket.broadcast.to(params.room).emit('newMessage',generateMessage('Admin',`${params.name} has joined. `));

        callback();
    });

    socket.on('createMessage', (message, callback)=> {
        console.log('Create message: ', message);
        io.emit('newMessage',generateMessage(message.from, message.text));
        callback();
    })

    socket.on('createLocationMessage', (coords)=>{
        io.emit('newLocationMessage', generateLocationMessage('Admin',coords.latitude, coords.longitude))
    });

    socket.on('disconnect', ()=> {
        let user = users.removeUser(socket.io);
        if(user){
            io.to(user.room).emit('updateUserList', users.getUserList(user.room));
            io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left.`));
        }
    });

})

server.listen(port, ()=> {
    console.log(`Server is listining on port : ${port}`);
})