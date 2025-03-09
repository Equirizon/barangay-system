const { ipcMain } = require("electron");
const db = require("../database/database");
const fs = require('fs');
const path = require('node:path');

ipcMain.on("fetch-clearance-data", (event) => {
    const sql = `
        SELECT 
            id, barangayClearanceNumber, documentDate, orDate, documentNumber, orNumber, 
            lastName, firstName, middleName, address, birthdate, birthplace, 
            civilStatus, gender, contactNumber, 
            purpose, findings, 
            cedulaNumber, placeIssued, dateIssued, tinNumber, 
            faceFileName, createdTimestamp
        FROM barangay_clearance
    `;

    db.all(sql, [], (err, rows) => {
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
        INSERT INTO barangay_clearance (
            barangayClearanceNumber, documentDate, orDate, documentNumber, orNumber,
            lastName, firstName, middleName, address, birthdate, birthplace, civilStatus, gender, contactNumber,
            purpose, findings,
            cedulaNumber, placeIssued, dateIssued, tinNumber,
            faceFileName, createdTimestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const {
        barangayClearanceNumber, documentDate, orDate, documentNumber, orNumber,
        lastName, firstName, middleName, address, birthdate, birthplace, civilStatus, gender, contactNumber,
        purpose, findings,
        cedulaNumber, placeIssued, dateIssued, tinNumber,
        faceFileName
    } = recordData;

    db.run(
        sql,
        [
            barangayClearanceNumber, documentDate, orDate, documentNumber, orNumber,
            lastName, firstName, middleName, address, birthdate, birthplace, civilStatus, gender, contactNumber,
            purpose, findings,
            cedulaNumber, placeIssued, dateIssued, tinNumber,
            faceFileName, new Date().toISOString() // Automatically set createdTimestamp
        ],
        function (err) {
            if (err) {
                console.error("Error inserting data:", err);
                event.reply("barangay-clearance-add-failed", err.message);
            } else {
                console.log("Record inserted successfully!");
                event.reply("barangay-clearance-added", { id: this.lastID });
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
        SET 
            barangayClearanceNumber = ?, documentDate = ?, orDate = ?, documentNumber = ?, orNumber = ?, 
            lastName = ?, firstName = ?, middleName = ?, address = ?, birthdate = ?, birthplace = ?, 
            civilStatus = ?, gender = ?, contactNumber = ?, 
            purpose = ?, findings = ?, 
            cedulaNumber = ?, placeIssued = ?, dateIssued = ?, tinNumber = ?, 
            faceFileName = ?, createdTimestamp = ?
        WHERE id = ?
    `;

    const {
        barangayClearanceNumber, documentDate, orDate, documentNumber, orNumber,
        lastName, firstName, middleName, address, birthdate, birthplace, 
        civilStatus, gender, contactNumber,
        purpose, findings,
        cedulaNumber, placeIssued, dateIssued, tinNumber,
        faceFileName, id
    } = updatedData;

    db.run(
        sql,
        [
            barangayClearanceNumber, documentDate, orDate, documentNumber, orNumber,
            lastName, firstName, middleName, address, birthdate, birthplace, 
            civilStatus, gender, contactNumber,
            purpose, findings,
            cedulaNumber, placeIssued, dateIssued, tinNumber,
            faceFileName, new Date().toISOString(), // Update timestamp to current time
            id
        ],
        (err) => {
            if (err) {
                console.error("Update Error:", err);
                event.reply("clearance-update-failed", err.message);
            } else {
                console.log("Record Updated Successfully");
                event.reply("clearance-updated");
            }
        }
    );
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

ipcMain.on("save-image", async (event, { imageData, filePath }) => {
    try {

        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");

        const saveDirectory = path.join(__dirname, "faces");

        // Ensure the directory exists
        await fs.promises.mkdir(saveDirectory, { recursive: true });

        // Write file as binary (better quality than base64)
        await fs.promises.writeFile(filePath, Buffer.from(base64Data, "base64"));

        // ✅ Send the file path back to the renderer process
        event.reply("save-image-response", { success: true, filePath });

    } catch (err) {
        console.error("Error saving image:", err);
        event.reply("save-image-response", { success: false, error: "Failed to save image." });
    }
});
