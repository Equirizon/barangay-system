const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("barangay.db");

// Create users table if it doesn't exist
db.run(
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`
);

// Create barangay_clearance table
db.run(
  `CREATE TABLE IF NOT EXISTS barangay_clearance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    barangayClearanceNumber TEXT,
    documentDate TEXT,
    orDate TEXT,
    documentNumber TEXT,
    orNumber TEXT,
    lastName TEXT,
    firstName TEXT,
    middleName TEXT,
    address TEXT,
    birthdate TEXT,
    birthplace TEXT,
    civilStatus TEXT,
    gender TEXT,
    contactNumber TEXT,
    purpose TEXT,
    findings TEXT,
    cedulaNumber TEXT,
    placeIssued TEXT,
    dateIssued DATE DEFAULT (DATE('now')),
    tinNumber TEXT,
    faceFileName TEXT,
    createdTimestamp DATETIME DEFAULT (DATETIME('now'))
  )`,
  function (err) {
    if (err) {
      console.error("Error creating table:", err.message);
      return;
    }

    console.log("Tables created successfully!");

    // Add a default user (username: admin, password: admin123)
    db.get("SELECT * FROM users WHERE username = ?", ["admin"], (err, row) => {
      if (!row) {
        db.run("INSERT INTO users (username, password) VALUES (?, ?)", [
          "admin",
          "admin123",
        ]);
        console.log("Admin user added.");
      }
    });

    // Insert data into barangay_clearance only if table is empty
    db.get("SELECT COUNT(*) AS count FROM barangay_clearance", (err, row) => {
      if (err) {
        console.error("Error checking table:", err.message);
        return;
      }

      if (row.count === 0) {
        db.run(
          `INSERT INTO barangay_clearance (
            barangayClearanceNumber, documentDate, orDate, documentNumber, orNumber,
            lastName, firstName, middleName, address, birthdate, birthplace, civilStatus, gender, contactNumber,
            purpose, findings,
            cedulaNumber, placeIssued, dateIssued, tinNumber,
            faceFileName, createdTimestamp
          ) VALUES (
            'BCN-2025001', '2025-03-09', '2025-03-09', 'DOC-001', 'OR-001',
            'Dela Cruz', 'Juan', 'Santos', '123 Main St', '2000-01-01', 'Manila', 'Single', 'Male', '09091234567',
            'Employment', 'No record',
            'CED-2025', 'Manila', DATE('now'), 'TIN-123456789',
            'juan-dela-cruz.jpg', DATETIME('now')
          )` ,
          function (err) {
            if (err) {
              console.error("Error inserting data:", err.message);
            } else {
              console.log("New record inserted (table was empty).");
            }
          }
        );
      } else {
        console.log("Table already contains data. No insert performed.");
      }
    });
  }
);

module.exports = db;
