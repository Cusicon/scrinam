let socket = io();

let messageTextBox = $("[name=message]");
let sendBtn = $("#send");
let emoticon = $("#emoticon");
let menuButton = $("#menu-button");
let messages = $("#messages");

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
  const userAgent = navigator.userAgent;
  let result = userAgent.toLowerCase();

  if (result.includes("windows")) {
    $(".alertMessages")
      .html(
        `<span id="emoticonSuggestion">Press ( 'Windows key' + '.' ) at once</span>`
      )
      .fadeIn(200);
  } else if (result.includes("macintosh")) {
    $(".alertMessages")
      .html(
        `<span id="emoticonSuggestion">Press ( Command + Ctrl + Space ) at once</span>`
      )
      .fadeIn(200);
  } else if (result.includes("android") || result.includes("iphone")) {
    $(".alertMessages")
      .html(
        `<span id="emoticonSuggestion">Check the bottom of your keyboard</span>`
      )
      .fadeIn(200);
  } else {
    $(".alertMessages")
      .html(`<span id="emoticonSuggestion">Check your keyboard</span>`)
      .fadeIn(200);
  }
  setTimeout(() => {
    $(".alertMessages").fadeOut(200);
  }, 1500);
};

let showUsersonMobile = () => {
  $(".chat__sidebar").toggleClass("showMenu");
};

let hideUsersonMobile = () => {
  $(".chat__sidebar").removeClass("showMenu");
};

// NOTIFICATIONS

/**
 * Set Default Socket For Show Notification
 * @param {type} data
 * @returns {undefined}
 */
socket.on("show_notification", function (data) {
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
    // window.onchange = () => {
    showDesktopNotification(from, text);
    sendNodeNotification(from, text);
    // };
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
    Notification.requestPermission(function (permission) {});
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
    icon: "./img/favicon.png",
  });

  let audio = new Audio("./assets/notify.mp3");
  audio.play().then(() => {
    instance;
  });

  instance.onclick = function () {
    window.open("", "scrinam");
    window.focus();
    instance.close();
  };
  instance.onerror = function () {
    // Something to do
  };
  instance.onshow = function () {
    // Something to do
  };
  instance.onclose = function () {
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
    title: title,
  });
}

// End of NOTIFICATIONS

let setSendButton = () => {
  messageTextBox.on("input", (e) => {
    if (e.target.value !== "") {
      sendBtn.removeClass("hide");
      sendBtn.addClass("show");

      emoticon.removeClass("show");
      emoticon.addClass("hide");
    } else {
      emoticon.removeClass("hide").addClass("show");
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
emoticon.on("click", (e) => {
  alertUserForEmojis();
});

menuButton.on("click", (e) => {
  showUsersonMobile();
});

$(".chat__sidebar, .chat__main > ol.chat__messages").on("click", (e) => {
  hideUsersonMobile();
});

// Global
let params = $.deparam(window.location.search);

socket.on("connect", () => {
  console.log("Connected to server");
  document.getElementById('room').value = params.room;

  socket.emit("join", params, (err) => {
    if (err) {
      window.location.replace("/");
    } else {
      $("#roomChatName").text(toSentenceCase(params.room));
      console.log("@ Chat Room...");
    }
  });
});

let form_upload = document.getElementById('form_upload');
form_upload.addEventListener('change', () => {
  $('#submit_upload').trigger('click');
})

$("#form_upload").submit(function (e) {
  e.preventDefault();
  const formData = new FormData(this);
  $.ajax({
    type: "POST",
    url: `/upload?room=${document.getElementById('room').value}`,
    data: formData,
    processData: false,
    contentType: false,
    success: function (file_link) {
      socket.emit("addLinks", file_link, params.room);
    },
    error: function (e) {
      console.log("some error", e);
    }
  });

});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});

socket.on("updateLinks", (file) => {
  $('#files').append(file);
})

socket.on("updateUserList", (users) => {
  let ol = $("<ol></ol>");

  users.forEach((user) => {
    const { id, name } = user;
    ol.append(
      $(`<li></li>`)
        .attr({
          class: `${
            params.name.toLowerCase() === name.toLowerCase() ? "__me" : ""
          }`,
          id: `${name.toLowerCase()}`,
        })
        .text(toSentenceCase(name))
    );
  });
  $("#users").html(ol);

  let __me = $("#users li.__me");
  __me.remove();
  $("#users ol").prepend(
    __me.append(
      `<a href="javascript:void(0);" onclick="location.replace(location.origin);"><i class="mdi mdi-logout-variant" style="float: right; font-size: 1.5rem; padding: 0px 2.5px;"></i></a> <i class="mdi mdi-webcam" style="float: right; font-size: 1.5rem; padding: 0px 2.5px;"></i>`
    )
  );
});

// Message form
$("#message-form").on("submit", (e) => {
  e.preventDefault();

  var newVals = [];
  messageTextBox
    .val()
    .trim()
    .split(" ")
    .forEach((text) => {
      if (text.includes("http")) {
        text = `[${text}]`;
      }
      newVals.push(text);
    });
  messageTextBox.val(newVals.join(" "));

  socket.emit("createMessage", { text: messageTextBox.val() }, () => {
    messageTextBox.val("");
    emoticon.removeClass("hide").addClass("show");
    sendBtn.removeClass("show").addClass("hide");
  });
});

// New message
socket.on("newMessage", (message) => {
  let formattedTime = moment(message.createdAt).format("h:mm a");
  let anyurlMessageTemplate = $("#anyurl-message-template").html();
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
    createdAt: formattedTime,
  });
  $("#messages").append(messageTemplateHtml);

  message.from.toLowerCase() === params.name.toLowerCase()
    ? ""
    : setNotification(message.from, message.text);
  scrollToBottom();
});

// New location message & Render to Dom
socket.on("newLocationMessage", (locationMessage) => {
  let formattedTime = moment(message.createdAt).format("h:mm a");
  let messageTemplate = $("#location-message-template").html();
  let messageTemplateHtml = Mustache.render(messageTemplate, {
    from: locationMessage.from,
    url: locationMessage.url,
    type:
      params.name.toLowerCase() === locationMessage.from.toLowerCase()
        ? "__me"
        : "others",
    createdAt: formattedTime,
  });
  $("#messages").append(messageTemplateHtml);
  scrollToBottom();
});

let locationButton = $("#send-location");
locationButton.on("click", (e) => {
  if (!navigator.geolocation) {
    return alert("Geolocation not supported by your browser!");
  }

  locationButton
    .attr("disabled", "disabled")
    .html('<i class="mdi mdi-dots-horizontal"></i>');

  navigator.geolocation.getCurrentPosition(
    (position) => {
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
window.addEventListener("beforeunload", function(e) {
  e.preventDefault();
  e.returnValue = "";
});