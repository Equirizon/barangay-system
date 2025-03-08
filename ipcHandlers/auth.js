const { ipcMain } = require("electron");
const db = require("../database/database");

ipcMain.on("login", (event, credentials) => {
	const { username, password } = credentials;
	db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, row) => {
		if (err) {
			event.reply("login-response", { success: false, message: "Error occurred." });
		} else if (row) {
			event.reply("login-response", { success: true });
			loginWindow.close();
			createMainWindow();
		} else {
			event.reply("login-response", { success: false, message: "Invalid credentials." });
		}
	});
});