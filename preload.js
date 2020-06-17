const idle = require("@paulcbetts/system-idle-time");
const date = require("date-fns");
const ipc = require("electron").ipcRenderer;

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
  const percentageCalc =
    100 - 100 * (activeSoFarInMinutes() / activeTimeInMinutes);
  const percentage = Math.round(percentageCalc < 0 ? 0 : percentageCalc);
  const width = Math.round(
    (200 * (activeTimeInMinutes - activeSoFarInMinutes())) / activeTimeInMinutes
  );

  // document.querySelector(
  //   "#time"
  // ).textContent = `${idle.getIdleTime()}s - ${activityStartTime}`;
  document.querySelector("#percentage").textContent = `${percentage}%`;
  document.querySelector("#active-use-time").textContent = `${msg}`;
  document.querySelector("#filled").style.width = `${width}px`;

  let fillColor = "#5ef075";
  if (width < 40 && width >= 20) {
    fillColor = "yellow";
  } else if (width < 20) {
    fillColor = "red";
  }
  document.querySelector("#filled").style.background = fillColor;
  ipc.send("update-icon", percentage);
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
