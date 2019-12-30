let socket = io();

let messageTextBox = $("[name=message]");
let sendBtn = $("#send");
let sendFileBtn = $("#send-file");

// Scroll To Bottom
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

// Alert User For Emojis
let alertUserForEmojis = () => {
  const { userAgent } = window.clientInformation;
  let result = userAgent.toLowerCase();
  if (result.includes("windows")) {
    alert(`Press ('Windows key' + '.') for emojis on input.`);
  } else if (result.includes("macintosh")) {
    alert(`Right click and select "Emojis & Symbols" on input.`);
  }
};

// NOTIFICATIONS

/**
 * Set Default Socket For Show Notification
 * @param {type} data
 * @returns {undefined}
 */
socket.on("show_notification", function(data) {
  showDesktopNotification(data.title, data.message);
});

/**
 * Set Notification Request
 * @type type
 */

function setNotification(from, text) {
  if (from.toLowerCase().includes("admin")) {
    return "";
  } else {
    window.onblur = e => {
      showDesktopNotification(from, text);
      sendNodeNotification(from, text);
    };
  }
}

/**
 * Request Browser Notification Permission
 * @type Arguments
 */
function requestNotificationPermissions() {
  let Notification =
    window.Notification || window.mozNotification || window.webkitNotification;

  if (Notification.permission !== "denied") {
    Notification.requestPermission(function(permission) {});
  }
}

/**
 * Show Desktop Notification If Notification Allow
 * @param {type} title
 * @param {type} message
 * @returns {undefined}
 */
function showDesktopNotification(title, message) {
  let sound = "./assets/notify.mp3";
  let timeout = 4000;

  requestNotificationPermissions();
  let instance = new Notification(title, {
    body: message,
    icon: "./img/favicon.png"
  });

  let audio = new Audio("./assets/notify.mp3");
  audio.play().then(() => {
    instance;
  });

  instance.onclick = function() {
    window.open("", "scrinam");
    window.focus();
    instance.close();
  };
  instance.onerror = function() {
    // Something to do
  };
  instance.onshow = function() {
    // Something to do
  };
  instance.onclose = function() {
    // Something to do
  };
  if (sound) {
    instance.sound;
  }
  setTimeout(instance.close.bind(instance), timeout);
  return false;
}

/**
 * Send Node Notification
 * @param {type} title
 * @param {type} message
 * @returns {undefined}
 */
function sendNodeNotification(title, message) {
  socket.emit("new_notification", {
    message: message,
    title: title
  });
}

// End of NOTIFICATIONS

let setSendButton = () => {
  messageTextBox.on("input", e => {
    if (e.target.value !== "") {
      sendBtn.removeClass("hide");
      sendBtn.addClass("show");

      sendFileBtn.removeClass("show");
      sendFileBtn.addClass("hide");
    } else {
      sendFileBtn.removeClass("hide").addClass("show");
      sendBtn.removeClass("show").addClass("hide");
    }
  });
};
setSendButton();

// Shuffle an array
function shuffle(array) {
  array.sort(() => Math.random() - 0.5);
}

// Emojis Icon
let emoticon = $("#emoticon");
emoticon.on("click", e => {
  alertUserForEmojis();
});

// Global
let params = $.deparam(window.location.search);

socket.on("connect", () => {
  console.log("Connected to server");

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

// Message form
$("#message-form").on("submit", e => {
  e.preventDefault();
  socket.emit("createMessage", { text: messageTextBox.val() }, () => {
    messageTextBox.val("");
    sendFileBtn.removeClass("hide").addClass("show");
    sendBtn.removeClass("show").addClass("hide");
  });
});

// New message
socket.on("newMessage", message => {
  let formattedTime = moment(message.createdAt).format("h:mm a");
  let messageTemplate = !message.from.toLowerCase().includes("admin")
    ? $("#message-template").html()
    : $("#admin-message-template").html();
  let messageTemplateHtml = Mustache.render(messageTemplate, {
    from: message.from.toLowerCase().includes("admin")
      ? toSentenceCase(message.from.split(" :: ")[1])
      : toSentenceCase(message.from),
    text: message.text,
    type: message.from.toLowerCase().includes("admin")
      ? "admin"
      : params.name.toLowerCase() === message.from.toLowerCase()
      ? "__me"
      : "others",
    createdAt: formattedTime
  });
  $("#messages").append(messageTemplateHtml);

  message.from.toLowerCase() === params.name
    ? ""
    : setNotification(message.from, message.text);
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

// Fires an alert before a user closes the chat tab or window.
// window.addEventListener("beforeunload", function(e) {
//   e.preventDefault();
//   e.returnValue = "";
// });

