import http from "http"
import {Server} from "socket.io";
import {instrument} from "@socket.io/admin-ui"
import express, {json} from "express"

const app = express();
app.set("view engine", "pug");
app.set("views", __dirname + "\\views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/",(req, res) => res.render("home"));
app.get("/*",(req,res) => res.redirect("/"));
// const mysql = require('mysql');
// const connection = mysql.createConnection({
// 	host : 'localhost',
// 	user : '< MySQL username >',
// 	password : '< MySQL password >',
// 	database : 'my_db'
// });
// connection.connect();
// connection.query('SELECT * FROM Users', (error, rows, fields) => {
// 	if (error) throw error;
// 	console.log('User info is : ', rows);
// });
// connection.end();
const handleListen = () => console.log(`Listening on Localhost 3000`);

const server = http.createServer(app);

const wsServer = new Server(server, {
	cors: {
		origin: ["https://admin.socket.io"],
		credentials: true,
	},
});
instrument(wsServer, {
	auth: false,
})

const countRoom = (roomName) => {
	return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}
const publicRooms = () => {
	const {
		sockets: {
			adapter: {sids, rooms},
		},
	} = wsServer;
	const publicRooms = [];
	rooms.forEach((_, key) => {
		if(sids.get(key) === undefined){
			publicRooms.push(key);
		}
	});
	return publicRooms;
}
let room, nick;
const setRoomNick = (Room, Nick) => {
	room = Room;
	nick = Nick;
}
const getRoomNick = {
	room: () => {return room},
	nick: () => {return nick},
}
wsServer.on("connection", (socket) => {
	socket["nickname"] = "anonymous";
	socket.onAny((event) => {
		console.log(`Socket Event: ${event}`)
	})
	socket.on("roomNick", ({roomName, nickName}, done) => {
		console.log(roomName, nickName);
		if(roomName && getRoomNick.room === roomName){
			//have Nick
			if(nickName && getRoomNick.nick === nickName)
				socket["nickname"] = nickName;
			else if(nickName){//new Nick
				setRoomNick(roomName, nickName);
				socket["nickname"] = nickName;
			}
		}else if(nickName){
			setRoomNick(roomName, nickName);
			socket["nickname"] = nickName;
		}
		done();
		socket.join(roomName);
		socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
		wsServer.sockets.emit("roomChange", publicRooms());

	});
	socket.on("disconnecting", () => {
		socket.rooms.forEach(room => socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1));
	})
	socket.on("disconnect", (roomName) => {
		wsServer.sockets.emit("roomChange", publicRooms());
	})
	socket.on("newMsg", (msg, room, done) => {
		done();
		socket.to(room).emit("newMsg", `${socket.nickname}: ${msg}`);

	});
});

server.listen(3000, handleListen);
