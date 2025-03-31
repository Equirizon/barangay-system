const { ipcMain } = require("electron");
const db = require("../database/database");
const fs = require('fs');
const path = require('node:path');
const clearanceTable = "barangay_clearance";

const clearanceColumns = [
    "barangayClearanceNumber", "documentDate", "orDate", "documentNumber", "orNumber",
    "lastName", "firstName", "middleName", "address", "birthdate", "birthplace", "civilStatus", "gender", "contactNumber",
    "purpose", "findings", "cedulaNumber", "placeIssued", "dateIssued", "tinNumber",
    "faceFileName", "createdTimestamp"
];

const fetchData = (event, channel, sql, params = []) => {
    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error(`Error fetching data (${channel}):`, err.message);
            event.reply(channel, []);
        } else {
            event.reply(channel, rows);
        }
    });
};

// Utility function to execute INSERT/UPDATE queries
const executeQuery = (event, channel, sql, params, successMessage) => {
    db.run(sql, params, function (err) {
        if (err) {
            console.error(`Error executing query (${channel}):`, err.message);
            event.reply(`${channel}-failed`, err.message);
        } else {
            console.log(successMessage);
            event.reply(channel, this.lastID ? { id: this.lastID } : {});
        }
    });
};

// Fetch all barangay clearance data
ipcMain.on("fetch-clearance-data", (event) => {
    const sql = `SELECT id, ${clearanceColumns.join(", ")} FROM ${clearanceTable}`;
    fetchData(event, "clearance-data", sql);
});

// Add new barangay clearance record
ipcMain.on("add-barangay-clearance", (event, recordData) => {
    const sql = `INSERT INTO ${clearanceTable} (${clearanceColumns.join(", ")}) VALUES (${clearanceColumns.map(() => "?").join(", ")})`;
    const params = clearanceColumns.map(col => col === "createdTimestamp" ? new Date().toISOString() : recordData[col]);
    executeQuery(event, "barangay-clearance-added", sql, params, "Record inserted successfully!");
});

// Search barangay clearance by last name
ipcMain.on("search-clearance-data", (event, query) => {
    const sql = `SELECT * FROM ${clearanceTable} WHERE lastName LIKE ?`;
    fetchData(event, "search-clearance-results", sql, [`%${query}%`]);
});

// Update barangay clearance record
ipcMain.on("update-barangay-clearance", (event, updatedData) => {
    const sql = `UPDATE ${clearanceTable} SET ${clearanceColumns.map(col => `${col} = ?`).join(", ")} WHERE id = ?`;
    const params = [...clearanceColumns.map(col => col === "createdTimestamp" ? new Date().toISOString() : updatedData[col]), updatedData.id];
    executeQuery(event, "clearance-updated", sql, params, "Record updated successfully!");
});

// Delete barangay clearance record
ipcMain.on("delete-clearance", (event, id) => {
    const sql = `DELETE FROM ${clearanceTable} WHERE id = ?`;
    db.run(sql, [id], (err) => {
        event.reply("clearance-deleted", err ? { success: false, error: err.message } : { success: true });
    });
});

ipcMain.on("save-image", async (event, { imageData, filePath }) => {
    try {
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
        const saveDirectory = path.join(__dirname, "faces");
        await fs.promises.mkdir(saveDirectory, { recursive: true });
        await fs.promises.writeFile(filePath, Buffer.from(base64Data, "base64"));
        event.reply("save-image-response", { success: true, filePath });
    } catch (err) {
        event.reply("save-image-response", { success: false, error: "Failed to save image." });
    }
});
