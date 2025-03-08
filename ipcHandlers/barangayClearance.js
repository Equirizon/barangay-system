const { ipcMain } = require("electron");
const db = require("../database/database");

ipcMain.on("fetch-clearance-data", (event) => {
	db.all("SELECT id, lastName, firstName, middleName, address, birthdate, birthplace, purpose, findings, civilStatus, gender, contactNumber, dateIssued FROM barangay_clearance", [], (err, rows) => {
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

	db.run(sql, [lastName, firstName, middleName, address, birthdate, birthplace, purpose, findings, civilStatus, gender, contactNumber], function (err) {
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