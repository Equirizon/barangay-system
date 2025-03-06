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
    lastName TEXT,
    firstName TEXT,
    middleName TEXT,
    address TEXT,
    birthdate TEXT,
    birthplace TEXT,
    purpose TEXT,
    findings TEXT,
    civilStatus TEXT,
    gender TEXT,
    contactNumber TEXT,
    dateIssued DATE DEFAULT (DATE('now')),
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
          `INSERT INTO barangay_clearance (lastName, firstName, middleName, address, birthdate, birthplace, purpose, findings, civilStatus, gender, contactNumber)
          VALUES ('Dela Cruz', 'Juan', 'Santos', '123 Main St', '2000-01-01', 'Manila', 'Employment', 'No record', 'Single', 'Male', '0909')`,
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
