const idle = require("@paulcbetts/system-idle-time");
const date = require("date-fns");
const ipc = require("electron").ipcRenderer;
const settingsClient = require("electron-settings").default;

const savedSettings = settingsClient.getSync("settings");
console.log({ savedSettings });
let settings = {
  activeTimeInMinutes: 55,
  breakTimeInMinutes: 5,
  ...(savedSettings ? savedSettings : {}),
};
console.log({ settings });

const intervalMs = 1000;
// const breakTimeInMinutes = 5;
// const activeTimeInMinutes = 55;
const breakTime = settings.breakTimeInMinutes * 60 * intervalMs;

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
  const now = new Date();
  const secs = date.differenceInSeconds(now, activityStartTime);
  let activityDurationMsg;
  if (secs < 60) {
    activityDurationMsg = `${secs} seconds`;
  } else {
    activityDurationMsg = `${date.differenceInMinutes(
      now,
      activityStartTime
    )} minutes`;
  }

  const percentageCalc =
    100 - 100 * (activeSoFarInMinutes() / settings.activeTimeInMinutes);
  const percentage = Math.round(percentageCalc < 0 ? 0 : percentageCalc);
  const width = Math.round(
    (200 * (settings.activeTimeInMinutes - activeSoFarInMinutes())) /
      settings.activeTimeInMinutes
  );

  // document.querySelector(
  //   "#time"
  // ).textContent = `${idle.getIdleTime()}s - ${activityStartTime}`;
  document.querySelector("#percentage").textContent = `${percentage}%`;
  document.querySelector("#active-use-time").textContent = activityDurationMsg;
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
  lastActivity.end = date.subMinutes(new Date(), settings.breakTimeInMinutes);
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
      date.subMinutes(new Date(), settings.activeTimeInMinutes),
      activityStartTime
    ) &&
    !inBreak &&
    !notified
  ) {
    showNotification(
      "Time for a break",
      `It's been ${date.differenceInMinutes(
        new Date(),
        settings.activeTimeInMinutes
      )} minutes and you haven't taken a break. Take ${
        settings.breakTimeInMinutes
      } minutes to reset your mind and body.`
    );
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

  document.querySelector("#launch-at-login").onclick = () => {
    ipc.send(
      "launch-at-login",
      document.querySelector("#launch-at-login").checked
    );
  };

  document.querySelector(
    "#active-duration-val"
  ).textContent = `${settings.activeTimeInMinutes}`;
  document.querySelector(
    "#break-duration-val"
  ).textContent = `${settings.breakTimeInMinutes}`;

  buttonAction(
    "#active-duration-minus",
    "#active-duration-val",
    (val) => --val,
    updateSetting("settings.activeTimeInMinutes")
  );
  buttonAction(
    "#active-duration-plus",
    "#active-duration-val",
    (val) => ++val,
    updateSetting("settings.activeTimeInMinutes")
  );
  buttonAction(
    "#break-duration-minus",
    "#break-duration-val",
    (val) => --val,
    updateSetting("settings.breakTimeInMinutes")
  );
  buttonAction(
    "#break-duration-plus",
    "#break-duration-val",
    (val) => ++val,
    updateSetting("settings.breakTimeInMinutes")
  );

  setTimeout(every, intervalMs);
});

function buttonAction(buttonId, valId, action, onAction) {
  document.querySelector(buttonId).onclick = () => {
    const text = document.querySelector(valId).textContent;
    const val = parseInt(text);
    const updatedVal = action(val);
    const actualVal = updatedVal < 0 ? 0 : updatedVal;
    document.querySelector(valId).textContent = `${actualVal}`;
    onAction(actualVal);
  };
}

function updateSetting(settingPath) {
  return (val) => {
    settingsClient.setSync(settingPath, val);
    const settingsFromFile = settingsClient.getSync("settings");
    settings = settingsFromFile;
  };
}
