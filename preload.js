const idle = require("@paulcbetts/system-idle-time");
const moment = require("moment");

const intervalMs = 1000;
const breakTime = 5 * 60 * intervalMs;

let activityStartTime = moment();
const breaks = [];

let inBreak = false;
let notified = false;

const showNotification = (title, body) => {
  const notification = new Notification(title, { body });
  notification.onclick = () => {
    console.log("notification click");
  };
};

function inMinutes(counter) {
  return Math.round(counter / 60);
}

function updateView() {

  const diff = moment().diff(activityStartTime);
  const duration = moment.duration(diff);
  const msg = Math.floor(duration.asHours()) + moment.utc(diff).format(":mm:ss");

  document.querySelector(
    "#time"
  ).textContent = `${idle.getIdleTime()}s - ${activityStartTime}`;
  document.querySelector(
    "#active-use-time"
  ).textContent = `${msg}`;
  document.querySelector("#breaks").textContent = breaks.join(", ");
}

function every() {
  if (moment().subtract(55, "minutes").isAfter(activityStartTime) && !inBreak && !notified) {
    showNotification("Time for a break", "Take a break!");
    notified = true;
  }

  const idleTime = idle.getIdleTime();
  if (idleTime > breakTime) {
    if (!inBreak) {
      breaks.push(`Start break: ${moment().subtract(5, 'minute').format()}`);
    }
    inBreak = true;
  } else {
    if (inBreak) {
      breaks.push(`End break: ${moment().format()}`);
      activityStartTime = moment();
      notified = false;
    }
    inBreak = false;
  }

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
  setTimeout(every, intervalMs);
});
