var socket = io();

socket.on("connect", () => {
  console.log("Connected to server");
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});

// New message
socket.on("newMessage", message => {
  let formattedTime = moment(message.createdAt).format("h:mm a");
  let li = $("<li></li>");
  li.text(`${message.from}: ${formattedTime} ${message.text}`);
  $("#messages").append(li);
});

let messageTextBox = $("[name=message]");

// Message form
$("#message-form").on("submit", e => {
  e.preventDefault();

  socket.emit(
    "createMessage",
    { from: "User", text: messageTextBox.val() },
    data => {
      // console.log("Seen it, ", data);
      messageTextBox.val("");
    }
  );
});

// New location message
socket.on("newLocationMessage", (locationMessage, callback) => {
  let formattedTime = moment(message.createdAt).format("h:mm a");
  let li = $("<li></li>");
  let link = $(`<a target="_blank">My current location</a>`);

  link.attr("href", locationMessage.url);
  li.text(`${locationMessage.from}: ${formattedTime} `);
  li.append(link);
  $("#messages").append(li);
});

let locationButton = $("#send-location");

locationButton.on("click", e => {
  if (!navigator.geolocation) {
    return alert("Geolocation not supported by your browser!");
  }

  locationButton.attr("disabled", "disabled").text("Sending location...");
  navigator.geolocation.getCurrentPosition(
    position => {
      const { latitude, longitude } = position.coords;
      socket.emit("createLocationMessage", { latitude, longitude });
      locationButton.removeAttr("disabled").text("Send location");
    },
    () => {
      locationButton.removeAttr("disabled").text("Send location");
      alert("Unable to fetch location!.");
    }
  );
});
