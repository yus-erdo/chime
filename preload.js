const moment = require("moment");
const gkm = require("gkm");

const interval = 1000;
const maxActiveTime = 55;
const minBreakTime = 3;

let activity = true;
let active = 0;
let notActive = 0;

const showNotification = (title, body) => {
  const notification = new Notification(title, { body });
  notification.onclick = () => {
    console.log("notification click");
  };
};

// Listen to all key events (pressed, released, typed)
gkm.events.on("key.*", function (data) {
  activity = true;
});

// Listen to all mouse events (click, pressed, released, moved, dragged)
gkm.events.on("mouse.*", function (data) {
  activity = true;
});

function every() {
  console.log({ active, notActive });
  if (activity) {
    active++;
    notActive = 0;

    if (active === maxActiveTime) {
      showNotification(
        "☕️ Time to take a break",
        "It's been 55m without a break."
      );
    }
  } else {
    notActive++;
    
    if (notActive === minBreakTime) {
      showNotification(
        "Feel free to get back",
        "...."
      );
      active = 0;
    }
  }
  activity = false;
  setTimeout(every, interval);
}

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const type of ["chrome", "node", "electron"]) {
    replaceText(`${type}-version`, process.versions[type]);
  }

  console.log("setTimeout");
  setTimeout(every, interval);
});
