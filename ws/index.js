import dotenv from "dotenv";
import { WebSocketServer } from "ws";
dotenv.config({ path: "../.env" });


const cfg ={
  wsPort: process.env.WS_PORT || 8001
}


const wss = new WebSocketServer({port:cfg.wsPort , perMessageDeflate:false})


wss.on('connection' , function(socket , req){

  let player = null;

  socket.on('message' , async function(msg){
   const {type,data} =  parseMessage(msg)
  })


  if(!player && msg.type === "gameInit" && msg.data){
    
  }

})






// parse incoming message in format "type:jsondata"
// e.g. 'myMessage:{"value",123}' returns { type: "myMessage", data: { "value": 123 }}
function parseMessage(msg){

  //convert the message to string to find the index of the colon
msg = msg.toString().trim()

let
index = msg.indexOf(':')
type = null
data={}

if(index>0){
  type = msg.slice(0,index)
  data = msg.slice(index+1);

try {

  data  =JSON.parse(data)
  
} catch (error) {
  
}

}else{
    type = msg
    data = {}
}

return {type,data}

}