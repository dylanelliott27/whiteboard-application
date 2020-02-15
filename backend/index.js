const express = require('express');
const app = express();
const http = require('http');
const socketIo = require('socket.io');
const server = http.createServer(app);
const io = socketIo(server);
const users = [];

/*-----------------------------------------------------
            initialize server on port 4000
**-----------------------------------------------------*/
server.listen(process.env.PORT || 4000, () => {
    console.log("server up")
})
/*-----------------------------------------------------
array functions for storing current user in current room.
Eventually will be converted to db
**-----------------------------------------------------*/
const checkUser = (user, room) => {
    for(i = 0; i < users.length; i++){
        if(users[i].name === user && users[i].room === room){
            return false;
        }
    }
    return true;
}

const removeUser = (room, name) => {
    for(i = 0; i < users.length; i++){
        if(users[i].name === name && users[i].room === room){
            users.splice(i, 1);
        }
    }
}

/*------------------------------------------------
                socket.io listeners
**------------------------------------------------*/
io.on('connection', (socket) => {
    console.log("connected");

    socket.on('roomrequest', (name, roomCode) =>{
            users.push({'name': name, 'room': roomCode});
            socket.join(roomCode);
            io.sockets.in(roomCode).emit('loginmessage', name)
    })
    socket.on('reqroom', (name, roomCode) => {
        if(checkUser(name, roomCode)){ 
            socket.emit('successjoin');
        }
        else{
            socket.emit('failure');
        }
    })

    socket.on('leaveroom', (room, name) => {
        io.sockets.in(room).emit('leavemessage', name)
        removeUser(room, name);
    })

    socket.on('disconnect', () => {
        console.log("disconnected")
    })

    socket.on('message', (room, message) => {
        io.sockets.in(room).emit('recieve', message);
    })

    socket.on('drawing', (name, room, clientX, clientY, color) => {
        socket.broadcast.to(room).emit('coordinates', name, clientX, clientY, color); 
    })

    socket.on('mouseup', (room) => {
        socket.broadcast.to(room).emit('liftup', true)
    })

    socket.on('sendmessage', (name, room, message) => {
        io.sockets.in(room).emit('receivemessage', name, room, message)
    })

})