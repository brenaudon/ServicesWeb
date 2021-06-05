const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');

// Qs imported via script in chat.ejs
const {bot} = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

// Join chatroom
socket.emit('joinChat',bot);

// Message from user
socket.on('message',(message) => {
  outputMessage(message);
  chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll down
});

// Message submit
chatForm.addEventListener('submit',(e) => {
  e.preventDefault();
  let msg = e.target.elements.msg.value; // Get message text
  msg = msg.trim();
  if (!msg) {
    return false;
  }
  socket.emit('chatMessage',{msg,bot}); // Emit message to chat
  e.target.elements.msg.value = ''; // Clear input
  e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = message.username;
  p.innerHTML += `<span>${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message.text;
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);
}

// Leave button
document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Êtes-vous sur de vouloir quitter la discussion ?');
  if (leaveRoom) {
    window.location = '/';
  } else {
  }
});