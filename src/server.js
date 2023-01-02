import http from "http"
import {WebSocket, WebSocketServer} from "ws";
import express, {json} from "express"

const app = express();
app.set("view engine", "pug");
app.set("views", __dirname + "\\views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/",(req, res) => res.render("home"));
app.get("/*",(req,res) => res.redirect("/"));
const handleListen = () => console.log(`Listening on Localhost 3000`);

const server = http.createServer(app);

const wss = new WebSocketServer({server});

const sockets = [];

wss.on("connection", (socket) => {
	sockets.push(socket);
	socket["nick"] = "anonymous";
	socket.on("close", () => console.log("disconnected from Browser"));
	socket.on("message", (msg) => {
		const message = JSON.parse(msg);
		switch (message.type) {
			case "msg":
				sockets.forEach(aSocket => aSocket.send(`${socket.nick}: ${message.payload}`));
			case "nick":
				socket["nick"] = message.payload;
		}
	});
});
server.listen(3000, handleListen);
