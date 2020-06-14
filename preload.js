const idle = require("@paulcbetts/system-idle-time");
const date = require("date-fns");

const intervalMs = 1000;
const breakTimeInMinutes = 5;
const activeTimeInMinutes = 55;
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
  const percentage = Math.round(
    100 - 100 * (activeSoFarInMinutes() / activeTimeInMinutes)
  );
  const width = Math.round(
    (200 * (activeTimeInMinutes - activeSoFarInMinutes())) / activeTimeInMinutes
  );

  // document.querySelector(
  //   "#time"
  // ).textContent = `${idle.getIdleTime()}s - ${activityStartTime}`;
  document.querySelector("#percentage").textContent = `${percentage}%`;
  document.querySelector("#active-use-time").textContent = `${msg}`;
  document.querySelector("#filled").style.width = `${width}px`;
  if (width < 40) {
    document.querySelector("#filled").style.background = "yellow";
  }
  if (width < 20) {
    document.querySelector("#filled").style.background = "red";
  }
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

function activeSoFarInMinutes() {
  return date.differenceInMinutes(new Date(), activityStartTime);
}

function every() {
  if (
    date.isAfter(
      date.subMinutes(new Date(), activeTimeInMinutes),
      activityStartTime
    ) &&
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
