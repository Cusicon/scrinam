var socket = io();

let scrollToBottom = () => {
  // Selectors
  let messages = $("#messages");
  let newMessage = messages.children("li:last-child");

  // Heights
  let clientHeight = messages.prop("clientHeight");
  let scrollTop = messages.prop("scrollTop");
  let scrollHeight = messages.prop("scrollHeight");
  let newMessageHeight = newMessage.innerHeight();
  let lastMessageHeight = newMessage.prev().innerHeight();

  if (
    clientHeight + scrollTop + newMessageHeight + lastMessageHeight >=
    scrollHeight
  ) {
    messages.scrollTop(scrollHeight);
  }
};

socket.on("connect", () => {
  console.log("Connected to server");

  let params = $.deparam(window.location.search);

  socket.emit("join", params, err => {
    if (err) {
      window.location.href = "/";
    } else {
      console.log("No errors.");
    }
  });
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});

socket.on("updateUserList", users => {
  let ol = $("<ol></ol>");

  users.forEach(user => {
    ol.append($("<li></li>").text(user));
  });

  $("#users").html(ol);
});

let messageTextBox = $("[name=message]");

// Message form
$("#message-form").on("submit", e => {
  e.preventDefault();
  socket.emit(
    "createMessage",
    { from: "User", text: messageTextBox.val() },
    () => {
      messageTextBox.val("");
    }
  );
});

// New message
socket.on("newMessage", message => {
  let formattedTime = moment(message.createdAt).format("h:mm a");
  let messageTemplate = $("#message-template").html();
  let messageTemplateHtml = Mustache.render(messageTemplate, {
    from: message.from,
    text: message.text,
    createdAt: formattedTime
  });
  $("#messages").append(messageTemplateHtml);
  scrollToBottom();
});

// New location message
socket.on("newLocationMessage", (locationMessage, callback) => {
  let formattedTime = moment(message.createdAt).format("h:mm a");
  let messageTemplate = $("#location-message-template").html();
  let messageTemplateHtml = Mustache.render(messageTemplate, {
    from: locationMessage.from,
    url: locationMessage.url,
    createdAt: formattedTime
  });
  $("#messages").append(messageTemplateHtml);
  scrollToBottom();
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
