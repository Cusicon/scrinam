var socket = io();
socket.on("connect", () => {
  console.log("Connected to server");

  socket.on("newMessage", message => {
    console.log("newMessage", message);
    let li = $("<li></li>");
    li.text(`${message.from}: ${message.text}`);
    $("#messages").append(li);
  });
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});

$("#message-form").on("submit", e => {
  e.preventDefault();

  socket.emit(
    "createMessage",
    { from: "User", text: $("[name=message]").val() },
    data => {
      // console.log("Seen it, ", data);
    }
  );
});

socket.on("newLocationMessage", (locationMessage, callback) => {
  let li = $("<li></li>");
  let link = $(`<a target="_blank">My current location</a>`);

  link.attr("href", locationMessage.url);
  li.text(`${locationMessage.from}: `);
  li.append(link);
  $("#messages").append(li);
});

let locationButton = $("#send-location");

locationButton.on("click", e => {
  if (!navigator.geolocation) {
    return alert("Geolocation not supported by your browser!");
  }

  navigator.geolocation.getCurrentPosition(
    position => {
      const { latitude, longitude } = position.coords;
      socket.emit("createLocationMessage", { latitude, longitude });
    },
    () => {
      // socket.emit("createLocationMessage", {
      //   latitude: "1212",
      //   longitude: "-234545"
      // });
      alert("Unable to fetch location!.");
    }
  );
});
