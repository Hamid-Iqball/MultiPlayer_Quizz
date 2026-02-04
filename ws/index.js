import dotenv from "dotenv";
import { WebSocketServer } from "ws";
import Game from "./lib/game.js";

dotenv.config({ path: "../.env" });

const cfg = {
  wsPort: process.env.WS_PORT || 8001
};

// create WebSocket server
const wss = new WebSocketServer({
  port: cfg.wsPort,
  perMessageDeflate: false
});

// create ONE game instance
const game = new Game();

console.log(`WebSocket server running on port ${cfg.wsPort}`);

wss.on("connection", (socket, req) => {


  let player = null;

  socket.on("message", (msg) => {
    const { type, data } = parseMessage(msg);

    // PLAYER JOINS GAME
    if (!player && type === "joinGame") {
      const { name } = data;

      if (!name) {
        socket.send(
          JSON.stringify({
            type: "error",
            data: "Player name is required"
          })
        );
        return;
      }

      // create player via Game
      player = game.addPlayer(name);

      console.log(`Player joined: ${player.name}`);


      socket.send(
        JSON.stringify({
          type: "gameState",
          data: game.getStates()
        })
      );

      return;
    }


    if (!player) {
      socket.send(
        JSON.stringify({
          type: "error",
          data: "You must join the game first"
        })
      );
    }
  });

  socket.on("close", () => {
    console.log("Client disconnected");

    if (player) {
      game.removePlayer(player.id);
      console.log(`Player removed: ${player.name}`);
    }
  });
});

// parse incoming message in format "type:jsondata"
// e.g. joinGame:{"name":"Alice"}
function parseMessage(msg) {
  msg = msg.toString().trim();

  let index = msg.indexOf(":");
  let type = null;
  let data = {};

  if (index > 0) {
    type = msg.slice(0, index);
    try {
      data = JSON.parse(msg.slice(index + 1));
    } catch (err) {
      console.error("Invalid JSON payload");
      data = {};
    }
  } else {
    type = msg;
  }

  return { type, data };
}
