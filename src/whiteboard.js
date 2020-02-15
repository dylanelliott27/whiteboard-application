import React, {useState, useEffect} from 'react';
import Chatbox from './chatbox';

function Whiteboard(props) {
  const [isDrawing, setisDrawing] = useState(false);
  const [color, setColor] = useState();
  const socket = props.socket; // Renaming the passed socket prop for easier use
  let canvas;
  let ctx;


  /* ------------------------------------ */
  /* -----------INITIALIZATION------------ */
  /* ------------------------------------ */

  useEffect(() => {
    // Once the component mounts and has access to all dom elements,
    // re-assigns the canvas values to the global variables.
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext("2d");
  })

  useEffect(() => {
    //Positions the canvas relative to the window width + height
    canvas.width = window.innerWidth / 1.3;
    canvas.height = window.innerHeight / 2;
}, [])


  /* ------------------------------------- */
  /* ------- SOCKET IO listener(s)---------- */
  /* ------------------------------------- */


  socket.on('coordinates', (name, clientX, clientY, sockcolor) => {
    // If the name passed from the socket request (the person drawing) matches the client (props.name),
    // only calls the draw function for the other users in the socket room.
    if(name != props.name){
        const e = {"clientX": clientX, "clientY": clientY, "sockcolor": sockcolor}
        drawSocket(e);
    }
  })

  /* -------------------------------------------- */
  /* ----------- DRAWING FUNCTIONS -------------- */
  /* -------------------------------------------- */

  /* This is the sending socket's draw function. It emits the coordinates of the draw to
  all of the other sockets.*/
  const draw = (e) => {
    if(e.type === 'mouseup'){ // If the mouseup event is detected while drawing, restarts the path.
        ctx.beginPath();
    }
    else if(isDrawing){
        let pos = getXY(canvas, e);
        ctx.lineWidth = 10;
        ctx.strokeStyle = color;
        ctx.lineCap = "round";
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        socket.emit('drawing', props.name, props.roomCode, pos.x, pos.y, color)
      }
  }
  /*  This is the receiving sockets draw function. Doesn't emit the coordinates, simply
       paints the coordinates on the screen and listens for the keyup event aswell **/
  const drawSocket = (e) => {
    socket.on('liftup', () => {
        ctx.beginPath();
    })
        ctx.lineWidth = 10;
        ctx.strokeStyle = e.sockcolor;
        ctx.lineCap = "round";
        ctx.lineTo(e.clientX, e.clientY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.clientX, e.clientY);
  }
  /* ----------------------------------------------------------------------- */
  /* ------------------ MOUSE/COORDINATE related functions ----------------- */
  /* ----------------------------------------------------------------------- */

  /* Found on SO. Since the canvas is offset from centering, this aligns the draw position exactly to the 
     mouse cursor.*/
  function getXY(canvas, event) {
    var rect = canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        }
   }  

  const mouseDown = (e) => {
    setisDrawing(true)
    draw(e)
  }
  const mouseUp = (e) => {
    socket.emit('mouseup', props.roomCode);
    setisDrawing(false)
    draw(e);
  }
  /* --------------------------------------------------------------- */
  /* ------------------ TOOLBAR related FUNCTIONS ------------------ */
  /* --------------------------------------------------------------- */
  //Sets the state for color to the chosen value, then gets sent through to the socket and back down to all the clients.
  const changeColor = (color) => {
    switch(color){
        case 'green':
            setColor('#008000');
        break;
        case 'blue':
            setColor("#0000ff");
        break;
        case 'red':
            setColor("#ff0000");
        break;
        case 'black':
            setColor('#000000');
        break;
        case 'white':
            setColor('#f0f0f0');
        break;
    }
  }

  return (
      <>
        <div id="thediv">
            <canvas 
            onMouseDown={(e) => mouseDown(e)}
            onMouseUp={(e) => mouseUp(e)}
            onMouseMove={(e) => draw(e)}
            onTouchStart={e => mouseDown(e)}
            onTouchMove={(e) => draw(e)}
            onTouchEnd={(e) => {mouseUp(e)}}
            id="canvas"></canvas>
            <div className="toolcontainer">
                    <ul className="flex">
                        <li>
                            <div onClick={() => changeColor('green')} className="green"></div>
                        </li>
                        <li>
                            <div onClick={() => changeColor('blue')} className="blue"></div>
                        </li>
                        <li>
                            <div onClick={() => changeColor('red')} className="red"></div>
                        </li>
                        <li>
                            <div onClick={() => changeColor('black')} className="black"></div>
                        </li>
                        <li>
                            <div onClick={() => changeColor('white')} className="eraser"><i class="fas fa-eraser"></i></div>
                        </li>
                    </ul>
            </div>
        </div>
        <Chatbox socket={props.socket} name={props.name} room={props.roomCode} setAuth={props.setAuth} />
      </>
  );
}
export default Whiteboard;