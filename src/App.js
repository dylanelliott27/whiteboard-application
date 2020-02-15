import React, {useState} from 'react';
import Whiteboard from './whiteboard';
import socketIOClient from 'socket.io-client';

function App() {
  const [name, setName] = useState(null);
  const [roomCode, setRoomCode] = useState(null);
  const [auth, setAuth] = useState(null);
  
  let socket = socketIOClient("localhost:4000" || window.location.hostname);

  /*-----------------------------------
  Socket.io listeners for authentication. if user & roomcode
  don't match in the server array, returns setAuth(true).

  If user and roomcode do match (someone with same name is in
    requested room), sets the state of loginError and displays
    on screen.
  *------------------------------------*/
  const joinRoom = (e) => {
    socket.emit('reqroom', name, roomCode);
    e.preventDefault();
  }
  socket.on('successjoin', () => {
    setAuth(true)
  })
  socket.on('failure', () => {
    setAuth(false);
    console.log("FAILURE");
  })

/*****Conditional render for if the authentication check above
      returns back true or not.
      
      The socket.emit in this statement simply joins the socket
      to the requested room and does nothing else. *****/
  if(auth){
    socket.emit('roomrequest', name, roomCode);
    return <Whiteboard socket={socket} name={name} roomCode={roomCode} setAuth={setAuth} />
  }

  /* --- If authentication is false or user is visiting first time,
          this will be rendered -- */
  else{
    return (
      <div className="contss">
        <h1> WHITEBOARD </h1>
                  <div class="alert alert-info" role="alert">
            Enter a nickname as well as the room number you are trying to join. <br></br> If you're creating a room, just type in a room name then press join.
          </div>
        <div className="">
          <form class="formcont">
          {auth === false &&
            <div class="alert alert-danger" role="alert">
              The name entered already exists in this room. Please choose another.
          </div>
          }
            <div class="form-group">
              <label for="exampleInputEmail1">Name:</label>
              <input onChange={e => setName(e.target.value)} type="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp"></input>
            </div>
            <div class="form-group">
              <label for="exampleInputPassword1">Room code:</label>
              <input onChange={e => setRoomCode(e.target.value)} type="password" class="form-control" id="exampleInputPassword1"></input>
            </div>
            <button onClick={e => joinRoom(e)} class="btn btn-primary w-75">Join</button>
            <div class="alert alert-warning" role="alert">
              As of right now, this app works both mobile and desktop. However, if you try to resize...
              that's not working yet.
            </div>
          </form>
        </div>
      </div>
    );
  }
}
export default App;
