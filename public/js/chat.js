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

let alertUserForEmojis = () => {
  const { userAgent } = window.clientInformation;
  let result = userAgent.toLowerCase();
  if (result.includes("microsoft")) {
    alert(`Press ('Windows key' + '.') for emojis on input.`);
  } else if (result.includes("macintosh")) {
    alert(`Right click and select "Emojis & Symbols" on input.`);
  }
};

// Shuffle an array
function shuffle(array) {
  array.sort(() => Math.random() - 0.5);
}

let emoticon = $("#emoticon");
emoticon.on("click", e => {
  alertUserForEmojis();
});

// Global
let params = $.deparam(window.location.search);

socket.on("connect", () => {
  console.log("Connected to server");

  // params = { name: params.name, room: params.room };

  socket.emit("join", params, err => {
    if (err) {
      window.location.href = "/";
    } else {
      $("#roomChatName").text(toSentenceCase(params.room));
      console.log("@ Chat Room...");
    }
  });
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});

socket.on("updateUserList", users => {
  let ol = $("<ol></ol>");

  users.forEach(user => {
    const { id, name } = user;
    ol.append(
      $(`<li></li>`)
        .attr({
          class: `${
            params.name.toLowerCase() === name.toLowerCase() ? "__me" : ""
          }`,
          id: `${name.toLowerCase()}`
        })
        .text(toSentenceCase(name))
    );
  });
  $("#users").html(ol);

  let __me = $("#users li.__me");
  __me.remove();
  $("#users ol").prepend(
    __me.append(
      '<i class="mdi mdi-account" style="float: right; font-size: 20px;"></i>'
    )
  );
});

let messageTextBox = $("[name=message]");

// Message form
$("#message-form").on("submit", e => {
  e.preventDefault();
  socket.emit("createMessage", { text: messageTextBox.val() }, () => {
    messageTextBox.val("");
  });
});

// New message
socket.on("newMessage", message => {
  let formattedTime = moment(message.createdAt).format("h:mm a");
  let messageTemplate = $("#message-template").html();
  let messageTemplateHtml = Mustache.render(messageTemplate, {
    from: message.from.toLowerCase().includes("admin")
      ? message.from.split(" :: ")[1]
      : message.from,
    text: message.text,
    type: message.from.toLowerCase().includes("admin")
      ? "admin"
      : params.name.toLowerCase() === message.from.toLowerCase()
      ? "__me"
      : "others",
    createdAt: formattedTime
  });
  $("#messages").append(messageTemplateHtml);
  scrollToBottom();
});

// New location message & Render to Dom
socket.on("newLocationMessage", locationMessage => {
  let formattedTime = moment(message.createdAt).format("h:mm a");
  let messageTemplate = $("#location-message-template").html();
  let messageTemplateHtml = Mustache.render(messageTemplate, {
    from: locationMessage.from,
    url: locationMessage.url,
    type:
      params.name.toLowerCase() === locationMessage.from.toLowerCase()
        ? "__me"
        : "others",
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

  locationButton
    .attr("disabled", "disabled")
    .html('<i class="mdi mdi-dots-horizontal"></i>');

  navigator.geolocation.getCurrentPosition(
    position => {
      const { latitude, longitude } = position.coords;
      socket.emit("createLocationMessage", { latitude, longitude }, () =>
        console.log("location sent.")
      );

      locationButton
        .removeAttr("disabled")
        .html('<i class="mdi mdi-map-marker-radius"></i>');
    },

    () => {
      locationButton
        .removeAttr("disabled")
        .html('<i class="mdi mdi-map-marker-radius"></i>');
      alert("Unable to fetch location!.");
    }
  );
});
