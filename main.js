// Modules to control application life and create native browser window
const { app, BrowserWindow, Tray } = require("electron");
const path = require("path");
const assetsDirectory = path.join(__dirname, "assets");
const ipc = require("electron").ipcMain;

let window;

// Don't show the app in the dock
app.dock.hide();

const createWindow = () => {
  // Create the browser window.
  window = new BrowserWindow({
    width: 230,
    height: 130,
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: false,
    transparent: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  window.loadFile("index.html");

  // Open the DevTools.
  //window.webContents.openDevTools();

  // Hide the window when it loses focus
  window.on("blur", () => {
    window.hide();
  });
};

const createTray = () => {
  tray = new Tray(path.join(assetsDirectory, "icon-17.png"));
  tray.on("right-click", toggleWindow);
  tray.on("double-click", toggleWindow);
  tray.on("click", function (event) {
    toggleWindow();

    // Show devtools when command clicked
    if (window.isVisible() && process.defaultApp && event.metaKey) {
      window.openDevTools({ mode: "detach" });
    }
  });
};

const toggleWindow = () => {
  if (window.isVisible()) {
    window.hide();
  } else {
    showWindow();
  }
};

const getWindowPosition = () => {
  const windowBounds = window.getBounds();
  const trayBounds = tray.getBounds();

  // Center window horizontally below the tray icon
  const x = Math.round(
    trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2
  );

  // Position window 4 pixels vertically below the tray icon
  const y = Math.round(trayBounds.y + trayBounds.height + 4);

  return { x, y };
};

const showWindow = () => {
  const position = getWindowPosition();
  window.setPosition(position.x, position.y, false);
  window.show();
  window.focus();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();
  createTray();
});

// Quit when all windows are closed.
app.on("window-all-closed", function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

ipc.on("update-icon", function (event, arg) {
  const iconNum = Math.round(17 / 100 * arg);
  tray.setImage(path.join(assetsDirectory, `icon-${iconNum}.png`));
});
