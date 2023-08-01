import { app, BrowserWindow, ipcMain, Menu, Tray } from 'electron';
import path from 'path';
import { registerHandlers } from './main.handlers';
import logger from './utils/logger';

let mainWindow: BrowserWindow | null;
let tray: Tray | null;

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

const assetsPath =
  process.env.NODE_ENV === 'production'
    ? process.resourcesPath
    : app.getAppPath();

function createWindow () {
  mainWindow = new BrowserWindow({
    icon: path.join(assetsPath, 'assets', 'icon.png'),
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegrationInWorker: true,
      contextIsolation: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      devTools: process.env.NODE_ENV !== 'production', 
    },
    resizable: false,
    autoHideMenuBar: true,
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  mainWindow.on('minimize', () => {
      mainWindow?.hide();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

app.on('ready', createWindow)
  .whenReady()
  .then(() => {
    let iconPath;
    if (process.platform === 'darwin' || process.platform === 'linux') {
      iconPath = path.join(assetsPath, 'assets', 'icon.png');
    } else {
      iconPath = path.join(assetsPath, 'assets', 'icon.ico');
    }
    tray = new Tray(iconPath);
    tray.setContextMenu(Menu.buildFromTemplate([
      { label: 'Quit', click: () => {
          mainWindow?.destroy();
      }}
    ]));
    tray.on('double-click', () => {mainWindow?.show(); mainWindow?.moveTop();});
    registerHandlers(ipcMain, tray);
  })
  .catch((e: Error) => logger.error(e));

app.on('window-all-closed', async () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
});

app.focus({steal: true});