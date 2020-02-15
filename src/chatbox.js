import React, {useState, useEffect} from 'react';
import './main.css';

function Chatbox(props) {
const [messages, setMessages] = useState([]);
const [messageText, setMessageText] = useState();

  const socket = props.socket; //renaming for easier use
  
  /* ------------------------------------- */
  /* ---------Socket IO listeners--------- */
  /* ------------------------------------- */
  socket.on('leavemessage', (name) => {
    setMessages([...messages, `${name} left the room!`])
  })
  socket.on('loginmessage', (name) => {
    setMessages([...messages, `${name} joined the room!`])
  });
  socket.on('receivemessage', (name, login, message) => {
    setMessages([...messages, `${name} says: ${message}`])
  })

  /* ----------- Message/room related functions ---------- */

  const sendMessage = (e) => {
    e.preventDefault();
    socket.emit('sendmessage', props.name, props.room, messageText);
  }

  const leaveRoom = (e) => {
    e.preventDefault();
    socket.emit('leaveroom', props.room, props.name);
    socket.disconnect();
    props.setAuth(null);
  }

  useEffect(() => {
    //When the chatbox overflows downwards, this keeps the client view at the bottom (for new messages);
    var messageBox = document.querySelector('.messagebox');
    messageBox.scrollTop = messageBox.scrollHeight - messageBox.clientHeight;
  
  })
  return (
      <div>
          <div class="card text-center">
            <div class="card-header headerc">
                <p>Chat!</p>
                   <div className="mr">
                        <button className="btn btn-danger" onClick={e => leaveRoom(e)}>Leave</button>
                    </div>
                    </div>
                    <div className="card-body messagebox">
                        {messages.map(msg => (
                            <p className="card-text">{msg}</p>
                        ))}
                    </div>
                    <div class="card-footer text-muted">
                    <input onChange={(e) => setMessageText(e.target.value)} />
                    <button onClick={e => sendMessage(e)}>SEND</button>
            </div>
        </div>
     </div>
  );
}
export default Chatbox;