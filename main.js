const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('node:path');
require("./ipcHandlers");

let mainWindow, loginWindow; // Global reference to the window

app.whenReady().then(() => {
	createMainWindow();
	mainWindow.webContents.openDevTools();
});

const createLoginWindow = () => {
	loginWindow = new BrowserWindow({
		width: 400,
		height: 300,
		webPreferences: {
		nodeIntegration: true,
		contextIsolation: false,
		},
	});
	loginWindow.setMenu(null);
	loginWindow.loadFile(path.join(__dirname, "login.html"));
};

const createMainWindow = () => {
	const { width, height } = require("electron").screen.getPrimaryDisplay().workAreaSize;
	mainWindow = new BrowserWindow({
		width: width,
		height: height,
		show: false,
		webPreferences: {
		nodeIntegration: true,
		contextIsolation: false,
		preload: path.join(__dirname, 'preload.js')
		}
	});
	mainWindow.setMenu(null);
	mainWindow.loadFile(path.join(__dirname, "views", "barangay-clearance.html"));
	mainWindow.once("ready-to-show", () => {
        mainWindow.show(); // Show the window only when it's ready
    });
};

function loadPage(page) {
	if (mainWindow) {
		mainWindow.loadFile(`src/views/services/${page}`);
	}
}








