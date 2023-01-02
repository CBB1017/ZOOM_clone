const socket = io();

const welcome = document.getElementById("welcome")
const form = welcome.querySelector("form")
const room = document.getElementById("room")
room.hidden = true;
let roomCount = 1;
let roomName;
let nickName;
const addMessage = (msg) => {
	const ul = room.querySelector("ul");
	const li = document.createElement("li");
	li.innerText = msg;
	ul.appendChild(li);
}
const handleMessageSubmit = (event) => {
	event.preventDefault();
	const input = room.querySelector("#msg input");
	socket.emit("newMsg", input.value, roomName, () => {
		addMessage(`You: ${input.value}`);
	});
}
const handleNickSubmit = (event) => {
	event.preventDefault();
	const input = room.querySelector("#nick input");
	socket.emit("nickname", input.value);
}
const backendDone = () => {
	welcome.hidden = true;
	room.hidden = false;
	const h3 = room.querySelector("h3");
	h3.innerText = `Room ${roomName} (${roomCount})`;
	const msgForm = room.querySelector("#msg")
	msgForm.addEventListener("submit", handleMessageSubmit);
	const nickForm = room.querySelector("#nick");
	nickForm.addEventListener("submit", handleNickSubmit);
}
const handleRoomSubmit = (event) => {
	event.preventDefault();
	const roomInput = document.getElementById("roomName");
	const nickInput = document.getElementById("nickName");
	socket.emit("roomNick", {roomName: roomInput.value, nickName: nickInput.value}, backendDone);
	roomName = roomInput.value;
	roomInput.value = "";
	nickName = nickInput.value;
	document.querySelector("#nick input").value = nickInput.value;
	nickInput.value = "";
}
form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user, userCount) => {
	console.log(userCount)
	roomCount = userCount;
	const h3 = room.querySelector("h3");
	h3.innerText = `Room ${roomName} (${roomCount})`;
	addMessage(`${user} joined!`);
})

socket.on("bye", (left, userCount) => {
	roomCount = userCount;
	const h3 = room.querySelector("h3");
	h3.innerText = `Room ${roomName} (${roomCount})`;
	addMessage(`${left} left`);
})

socket.on("newMsg", addMessage)
socket.on("roomChange", (rooms) => {
	console.log(rooms)
	const roomList = welcome.querySelector("ul");
	roomList.innerHTML = "";
	if(rooms.length === 0){
		return;
	}
	rooms.forEach(room => {
		const li = document.createElement("li");
		li.innerText = room;
		roomList.append(li);
	})
})