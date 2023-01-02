import http from "http"
import {Server} from "socket.io";
import express, {json} from "express"

const app = express();
app.set("view engine", "pug");
app.set("views", __dirname + "\\views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/",(req, res) => res.render("home"));
app.get("/*",(req,res) => res.redirect("/"));
const handleListen = () => console.log(`Listening on Localhost 3000`);

const server = http.createServer(app);

const wsServer = new Server(server);

const setRoomNick = (room, nick) => {
	localStorage.setItem("room", room);
	localStorage.setItem("nick", nick);
}
wsServer.on("connection", (socket) => {
	socket["nickname"] = "anonymous";
	socket.onAny((event) => {
		console.log(`Socket Event: ${event}`)
	})
	socket.on("roomNick", ({roomName, nickName}, done) => {
		if(roomName && localStorage.getItem("room") === roomName){
			//have Nick
			if(nickName && localStorage.getItem("nick") === nickName)
				socket["nickname"] = nickName;
			else if(nickName){//new Nick
				setRoomNick(roomName, nickName);
				socket["nickname"] = nickName;
			}

		}
		socket.join(roomName);
		done();
		socket.to(roomName).emit("welcome", socket.nickname);
	});
	socket.on("disconnecting", () => {
		socket.rooms.forEach(room => socket.to(room).emit("bye", socket.nickname));
	})
	socket.on("newMsg", (msg, room, done) => {
		socket.to(room).emit("newMsg", `${socket.nickname}: ${msg}`);
		done();
	});
	// socket.on("nickname", nick => {
	// 	socket["nickname"] = nick;
	// 	setRoomNick(roomName, socket.nickname);
	// })
});

server.listen(3000, handleListen);
