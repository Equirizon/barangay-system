const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('node:path');
require("./ipcHandlers");
const fs = require('fs');

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
	mainWindow = new BrowserWindow({
		width: 1200,
		height: 800,
		show: false,
		webPreferences: {
		nodeIntegration: true,
		contextIsolation: false,
		preload: path.join(__dirname, 'preload.js')
		}
	});
	mainWindow.setMenu(null);
	mainWindow.loadFile(path.join(__dirname, "views", "camera.html"));
	mainWindow.once("ready-to-show", () => {
        mainWindow.show(); // Show the window only when it's ready
    });
};

function loadPage(page) {
	if (mainWindow) {
		mainWindow.loadFile(`src/views/services/${page}`);
	}
}

ipcMain.on('save-image', (event, imageData) => {
    const base64Data = imageData.replace(/^data:image\/png;base64,/, '');
	const saveDirectory = path.join(__dirname, 'assets');
    
    // Ensure the directory exists
    if (!fs.existsSync(saveDirectory)) {
        fs.mkdirSync(saveDirectory);
    }

    const filePath = path.join(saveDirectory, `captured_image_${Date.now()}.png`);

    fs.writeFile(filePath, base64Data, 'base64', (err) => {
        if (err) {
            event.reply('save-image-response', 'Failed to save image.');
        } else {
            event.reply('save-image-response', `Image saved at ${filePath}`);
        }
    });
});







