const gkm = require("gkm");

const ms = 1000;
const interval = 1;
const intervalMs = 1 * ms;
const maxActiveTime = 55 * (60/interval) * ms;
const minBreakTime = 3 * (60/interval) * ms;

let activity = true;
let time = 0;
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

function inMinutes(counter) {
  return Math.round(counter / 60);
}

function updateView() {
  document.querySelector('#time').textContent = `${time}s`;
  document.querySelector('#active-use-time').textContent = `${inMinutes(active)}m`;
  document.querySelector('#tick-active').textContent = `${active}t`;
  document.querySelector('#tick-notActive').textContent = `${notActive}t`;
}

function every() {
  console.log({ active, notActive });
  if (activity) {
    if (notActive > 0) {
      active += notActive;
    }
    active++;
    notActive = 0;

    if (inMinutes(active) === maxActiveTime) {
      showNotification(
        "☕️ Time to take a break",
        "It's been 55m without a break."
      );
    }
  } else {
    notActive++;
    
    if (inMinutes(notActive) === minBreakTime) {
      active = 0;
      showNotification(
        "It was break",
        "Breakkkkkk."
      );
    }
  }
  
  // reset every 30 sec
  if (time % 30 === 0) {
    activity = false;  
  }

  time++;
  updateView();
  setTimeout(every, intervalMs);
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
