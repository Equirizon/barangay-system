const { ipcRenderer } = require("electron");

const addRecordBtn = document.getElementById("addRecordBtn");
const saveAndPrintBtn = document.getElementById("saveAndPrint");
const modalOverlay = document.getElementById("modalOverlay");
const addModal = document.getElementById("addModal");

const form = document.getElementById("createRecordForm");

function loadClearanceData() {
    ipcRenderer.send("fetch-clearance-data");
}

ipcRenderer.on("clearance-updated", () => {
    loadClearanceData();
});

ipcRenderer.on("clearance-data", (event, data) => {
    const tbody = document.getElementById("clearanceTableBody");
    tbody.innerHTML = "";
    data.forEach(record => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${record.id}</td>
            <td>${record.lastName}</td>
            <td>${record.address}</td>
            <td>${record.purpose}</td>
            <td>${record.dateIssued}</td>
            <td>
                <button onclick="editRecord('update', ${record.id}, '${record.firstName}', '${record.middleName}', '${record.lastName}', '${record.civilStatus}', '${record.birthdate}', '${record.birthplace}', '${record.address}', '${record.findings}', '${record.purpose}', '${record.contactNumber}')">Edit</button>
                <button onclick="printBarangayCertificate('${record.firstName}', '${record.middleName}', '${record.lastName}', '${record.civilStatus}', '${record.birthdate}', '${record.birthplace}', '${record.address}', '${record.findings}', '${record.purpose}')">Print</button>
                <button onclick="deleteRecord(${record.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
});

ipcRenderer.on("search-clearance-results", (event, data) => {
    const tbody = document.getElementById("clearanceTableBody");
    tbody.innerHTML = "";
    data.forEach(record => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${record.id}</td>
            <td>${record.lastName}</td>
            <td>${record.address}</td>
            <td>${record.purpose}</td>
            <td>${record.dateIssued}</td>
            <td>
                <button onclick="manageRecord(${record.id}, '${record.firstName}', '${record.middleName}', '${record.lastName}', '${record.civilStatus}', '${record.birthdate}', '${record.birthplace}', '${record.address}', '${record.findings}', '${record.purpose}', '${record.contactNumber}')">View</button>
                <button onclick="printBarangayCertificate('${record.firstName}', '${record.middleName}', '${record.lastName}', '${record.civilStatus}', '${record.birthdate}', '${record.birthplace}', '${record.address}', '${record.findings}', '${record.purpose}')">Print</button>
                <button onclick="deleteRecord(${record.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
});

document.addEventListener("DOMContentLoaded", () => {
    ipcRenderer.send("fetch-clearance-data");
    ipcRenderer.on("clearance-data", (event, data) => {
        const tableBody = document.getElementById("clearanceTableBody");
        tableBody.innerHTML = ""; // Clear existing table data

        data.forEach(record => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${record.id}</td>
                <td>${record.lastName}</td>
                <td>${record.address}</td>
                <td>${record.purpose}</td>
                <td>${record.dateIssued}</td>
                <td>
                <button onclick="manageRecord(${record.id}, '${record.firstName}', '${record.middleName}', '${record.lastName}', '${record.civilStatus}', '${record.birthdate}', '${record.birthplace}', '${record.address}', '${record.findings}', '${record.purpose}', '${record.contactNumber}')">Manage</button>
                <button onclick="printBarangayCertificate('${record.firstName}', '${record.middleName}', '${record.lastName}', '${record.civilStatus}', '${record.birthdate}', '${record.birthplace}', '${record.address}', '${record.findings}', '${record.purpose}')">Print</button>
                <button onclick="deleteRecord(${record.id})">Delete</button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    });
});

// Search functionality
function searchClearance() {
    const query = document.getElementById("searchInput").value.trim();
    ipcRenderer.send("search-clearance-data", query);
}

function assignInputValue(id, firstName, middleName, lastName, civilStatus, birthdate, birthplace, address, findings, purpose, contactNumber) {
    const values = {
        "manage-id": id,
        "manage-last-name": lastName,
        "manage-first-name": firstName,
        "manage-middle-name": middleName,
        "manage-civil-status": civilStatus,
        "manage-birthdate": birthdate,
        "manage-birthplace": birthplace,
        "manage-address": address,
        "manage-findings": findings,
        "manage-purpose": purpose,
        "manage-contact-number": contactNumber
    };

    Object.keys(values).forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            element.value = values[field];
        }
    });
}

function removeInputValue() {
    const fields = [
        "id", "last-name", "first-name", "middle-name",
        "civil-status", "birthdate", "birthplace", 
        "address", "findings", "purpose", "contact-number"
    ];
    
    fields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            element.value = "";
        }
    });
}

function removeManageInputValue() {
    const fields = [
        "manage-id", "manage-last-name", "manage-first-name", "manage-middle-name",
        "manage-civil-status", "manage-birthdate", "manage-birthplace", 
        "manage-address", "manage-findings", "manage-purpose", "manage-contact-number"
    ];
    
    fields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            element.value = "";
        }
    });
}

function closeModal(id) {
    document.getElementById(id).style.display = "none";
    modalOverlay.style.display = "none";
    id === "addModal" ? removeInputValue() : removeManageInputValue();
}

function openModal(id) {
    document.getElementById(id).style.display = "block";
    modalOverlay.style.display = "block";
}

function manageRecord(id, firstName, middleName, lastName, civilStatus, birthdate, birthplace, address, findings, purpose, contactNumber){
    assignInputValue(id, firstName, middleName, lastName, civilStatus, birthdate, birthplace, address, findings, purpose, contactNumber)
    setTimeout(() => {
        openModal("manageModal");
    }, 50);
}

function getFormData(prefix) {
    const fields = [
        "id", "last-name", "first-name", "middle-name",
        "address", "birthdate", "birthplace",
        "purpose", "findings", "civil-status",
        "contact-number", "gender"
    ];
    
    const data = {};
    fields.forEach(field => {
        const element = document.getElementById(`${prefix}${field}`);
        if (element) {
            data[field.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = element.value;
        }
    });
    
    return data;
}

document.getElementById("updateRecordForm").addEventListener("submit", (e) => {
    e.preventDefault();
    ipcRenderer.send("update-clearance", getFormData("manage-"));
    closeModal("manageModal");
});

document.getElementById("createRecordForm").addEventListener("submit", (e) => {
    e.preventDefault();
    ipcRenderer.send("add-barangay-clearance", getFormData(""));
    closeModal("addModal");
});


function deleteRecord(id) {
    ipcRenderer.send("delete-clearance", id);
}

ipcRenderer.on("clearance-deleted", () => {
    loadClearanceData();
});

saveAndPrintBtn.addEventListener("click", () => {
    addRecords();
    printBarangayCertificate(
        document.getElementById("first-name").value,
        document.getElementById("middle-name").value,
        document.getElementById("last-name").value,
        document.getElementById("civil-status").value,
        document.getElementById("birthdate").value,
        document.getElementById("birthplace").value,
        document.getElementById("address").value, 
        document.getElementById("findings").value,
        document.getElementById("purpose").value
    ); 
});

// Listen for success response
ipcRenderer.on("barangay-clearance-added", () => {
    addModal.style.display = "none";
    modalOverlay.style.display = "none";
    document.getElementById("createRecordForm").reset();
    loadClearanceData();
});

function printBarangayCertificate(firstName, middleName, lastName, civilStatus, birthdate, birthplace, address, findings, purpose) {
    const certificateContent = `
        <html>
        <head>
            <title>Barangay Clearance</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .container { max-width: 600px; margin: auto; padding: 20px; border: 1px solid #000; }
                h1, h3 { text-align: center; }
                p { margin: 10px 0; }
                .btn-container { text-align: center; margin-top: 20px; }
                button {
                    padding: 10px 15px;
                    margin: 5px;
                    border: none;
                    cursor: pointer;
                    font-size: 16px;
                }
                .print-btn { background: green; color: white; }
                .cancel-btn { background: red; color: white; }
                .duplicate { display: none }
                @media print {
                    .no-print {
                        display: none;
                    }
                    .print {
                        display: block;
                    }
                }	
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Barangay Clearance</h1>
                <h3>Republic of the Philippines</h3>
                <h3>Barangay ChatGPT</h3>

                <p><strong>Name:</strong> ${firstName} ${middleName} ${lastName}</p>
                <p><strong>Civil Status:</strong> ${civilStatus}</p>
                <p><strong>Birthdate:</strong> ${birthdate}</p>
                <p><strong>Birthplace:</strong> ${birthplace}</p>
                <p><strong>Address:</strong> ${address}</p>
                <p><strong>Findings:</strong> ${findings}</p>
                <p><strong>Purpose:</strong> ${purpose}</p>
            </div>
            <div class="container duplicate print">
                <h1>Barangay Clearance</h1>
                <h3>Republic of the Philippines</h3>
                <h3>Barangay ChatGPT</h3>

                <p><strong>Name:</strong> ${firstName} ${middleName} ${lastName}</p>
                <p><strong>Civil Status:</strong> ${civilStatus}</p>
                <p><strong>Birthdate:</strong> ${birthdate}</p>
                <p><strong>Birthplace:</strong> ${birthplace}</p>
                <p><strong>Address:</strong> ${address}</p>
                <p><strong>Findings:</strong> ${findings}</p>
                <p><strong>Purpose:</strong> ${purpose}</p>
            </div>
            <div class="btn-container">
                <button class="print-btn no-print" onclick="window.print()">Print</button>
                <button class="cancel-btn no-print" onclick="window.close()">Cancel</button>
            </div>
        </body>
        </html>
    `;

    // Open a new window for the document
    const docWindow = window.open("", "_blank");

    // Write content into the new window
    docWindow.document.write(`${certificateContent}`);
    docWindow.document.close();
}
