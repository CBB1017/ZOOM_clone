const messageList = document.querySelector("ul");
const nickForm = document.querySelector("#nick");
const messageForm = document.querySelector("#message");
const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener("open", () => console.log("Connected to Server"));
socket.addEventListener("message", (socket) => {
	// const parsedData = JSON.parse(data);
	const li = document.createElement('li');
	li.innerText = socket.data;
	messageList.append(li);
});
socket.addEventListener("close", () => console.log("Closed"));

nickForm.addEventListener("submit", (event) => {
	event.preventDefault();
	const input = nickForm.querySelector("input");
	socket.send(makeMessage("nick", input.value));
});


messageForm.addEventListener("sub mit", (event) => {
	event.preventDefault();
	const input = messageForm.querySelector("input");
	socket.send(makeMessage("msg", input.value));
	input.value = "";
});
const makeMessage = (type, payload) => {
	console.log(type,payload)
	const msg = {type, payload};
	return JSON.stringify(msg);
}