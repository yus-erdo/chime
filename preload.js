const idle = require("@paulcbetts/system-idle-time");
const date = require("date-fns");

const intervalMs = 1000;
const breakTimeInMinutes = 5;
const breakTime = breakTimeInMinutes * 60 * intervalMs;

let activityStartTime = new Date();
const activities = [];
activities.push({
  start: activityStartTime,
  end: null,
});

let inBreak = false;
let notified = false;

const showNotification = (title, body) => {
  const notification = new Notification(title, {
    body,
    requireInteraction: true,
  });
  notification.onclick = () => {
    console.log("notification click");
  };
};

function inMinutes(counter) {
  return Math.round(counter / 60);
}

function updateView() {
  const msg = date.formatDistanceStrict(new Date(), activityStartTime);

  document.querySelector(
    "#time"
  ).textContent = `${idle.getIdleTime()}s - ${activityStartTime}`;
  document.querySelector("#active-use-time").textContent = `${msg}`;
  document.querySelector("#activities").textContent = activities
    .map((a) => `${a.start && a.start} - ${a.end && a.end}`)
    .join(", ");
}

function onBreakStart() {
  const lastActivity = activities.pop();
  lastActivity.end = date.subMinutes(new Date(), breakTimeInMinutes);
  activities.push(lastActivity);
}

function onBreakEnd() {
  activityStartTime = new Date();
  activities.push({
    start: activityStartTime,
    end: null,
  });
}

function every() {
  if (
    date.isAfter(date.subMinutes(new Date(), 55), activityStartTime) &&
    !inBreak &&
    !notified
  ) {
    showNotification("Time for a break", "Take a break!");
    notified = true;
  }

  const idleTime = idle.getIdleTime();
  if (idleTime > breakTime) {
    if (!inBreak) {
      onBreakStart();
    }
    inBreak = true;
  } else {
    if (inBreak) {
      onBreakEnd();
      notified = false;
    }
    inBreak = false;
  }

  updateView();

  //const ctx = document.getElementById("myChart");
  // drawChart(ctx, activities);

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
