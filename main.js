const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('node:path');
const db = require("./src/database/database");

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

  loginWindow.loadFile(path.join(__dirname, "src", "views", "login.html"));
};

const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });
  mainWindow.loadFile(path.join(__dirname, "src", "views", "index.html"));

  // Updated menu with "Services" instead of "Pages"
  const menuTemplate = [
    { role: 'windowMenu' },
    { role: 'help' },
    {
      label: 'Services',
      submenu: [
        { label: 'Barangay Certificate', click: () => loadPage('barangay-certificate.html') },
        { label: 'Barangay Clearance', click: () => loadPage('barangay_clearance/barangay-clearance.html') },
        { label: 'Barangay Permit', click: () => loadPage('barangay-permit.html') },
        { label: 'Barangay Business Permit', click: () => loadPage('barangay-business-permit.html') },
        { label: 'Certificate of Indigency', click: () => loadPage('certificate-of-indigency.html') },
        { label: 'Blotter Report', click: () => loadPage('blotter-report.html') }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
};

function loadPage(page) {
  if (mainWindow) {
    mainWindow.loadFile(`src/views/services/${page}`);
  }
}

ipcMain.on("login", (event, credentials) => {
  const { username, password } = credentials;

  db.get(
    "SELECT * FROM users WHERE username = ? AND password = ?",
    [username, password],
    (err, row) => {
      if (err) {
        event.reply("login-response", { success: false, message: "Error occurred." });
      } else if (row) {
        event.reply("login-response", { success: true });
        loginWindow.close();
        createMainWindow();
      } else {
        event.reply("login-response", { success: false, message: "Invalid credentials." });
      }
    }
  );
});

ipcMain.on("fetch-clearance-data", (event) => {
  db.all("SELECT id, lastName, address, purpose, dateIssued FROM barangay_clearance", [], (err, rows) => {
      if (err) {
          console.error("Error fetching data:", err.message);
          event.reply("clearance-data", []);
      } else {
          event.reply("clearance-data", rows);
      }
  });
});

ipcMain.on("add-barangay-clearance", (event, recordData) => {
  const sql = `
      INSERT INTO barangay_clearance (lastName, firstName, middleName, address, birthdate, birthplace, purpose, findings, civilStatus, gender, contactNumber)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const { lastName, firstName, middleName, address, birthdate, birthplace, purpose, findings, civilStatus, gender, contactNumber } = recordData;

  db.run(sql, 
    [lastName, firstName, middleName, address, birthdate, birthplace, purpose, findings, civilStatus, gender, contactNumber], 
    function (err) {
      if (err) {
        console.error("Error inserting data:", err);
      } else {
        console.log("Record inserted successfully!");
        event.reply("barangay-clearance-added"); // Notify renderer process
      }
    }
  );
});

ipcMain.on("search-clearance-data", (event, query) => {
  const sql = `SELECT * FROM barangay_clearance WHERE lastName LIKE ?`;
  db.all(sql, [`%${query}%`], (err, rows) => {
      if (err) {
          console.error("Search Error:", err);
          event.reply("search-clearance-results", []);
      } else {
          event.reply("search-clearance-results", rows);
      }
  });
});

ipcMain.on("update-clearance", (event, updatedData) => {
  const sql = `
    UPDATE barangay_clearance 
    SET lastName = ?, firstName = ?, middleName = ?, address = ?, birthdate = ?, birthplace = ?, 
        purpose = ?, findings = ?, civilStatus = ?, gender = ?, contactNumber = ?
    WHERE id = ?
  `;

  const { lastName, firstName, middleName, address, birthdate, birthplace, purpose, findings, civilStatus, gender, contactNumber, id } = updatedData;

  db.run(sql, [lastName, firstName, middleName, address, birthdate, birthplace, purpose, findings, civilStatus, gender, contactNumber, id], (err) => {
      if (err) {
          console.error("Update Error:", err);
      } else {
          console.log("Record Updated Successfully");
          event.reply("clearance-updated");
      }
  });
});

ipcMain.on("delete-clearance", (event, id) => {
  const sql = `DELETE FROM barangay_clearance WHERE id = ?`;
  db.run(sql, [id], (err) => {
      if (err) {
          console.error("Delete Error:", err);
      } else {
          console.log("Record Deleted Successfully");
          event.reply("clearance-deleted");
      }
  });
});



// Function to load the selected page

