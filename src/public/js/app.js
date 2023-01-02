const socket = io();

const welcome = document.getElementById("welcome")
const form = welcome.querySelector("form")
const room = document.getElementById("room")
room.hidden = true;
let roomName;

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
	h3.innerText = `Room ${roomName}`;
	const msgForm = room.querySelector("#msg")
	msgForm.addEventListener("submit", handleMessageSubmit);
	const nickForm = room.querySelector("#nick");
	nickForm.addEventListener("submit", handleNickSubmit);
}
const handleRoomSubmit = (event) => {
	event.preventDefault();
	const input = form.querySelector("input");
	socket.emit("room", {roomName: input.value}, backendDone);
	roomName = input.value;
	input.value = "";
}
form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user) => {
	addMessage(`${user} joined!`);
})

socket.on("bye", (left) => {
	addMessage(`${left} left`);
})

socket.on("newMsg", addMessage)