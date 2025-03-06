const { ipcRenderer } = require("electron");

const addRecordBtn = document.getElementById("addRecordBtn");
const saveAndPrintBtn = document.getElementById("saveAndPrint");
const modalOverlay = document.getElementById("modalOverlay");
const addModal = document.getElementById("addModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const form = document.getElementById("createRecordForm");

// Function to request clearance data from main process
function loadClearanceData() {
    ipcRenderer.send("fetch-clearance-data");
}

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
                <button onclick="editRecord(${record.id}, '${record.firstName}', '${record.middleName}', '${record.lastName}', '${record.civilStatus}', '${record.birthdate}', '${record.birthplace}', '${record.address}', '${record.findings}', '${record.purpose}', '${record.contactNumber}')">Edit</button>
                <button onclick="deleteRecord(${record.id})">Delete</button>
                <button onclick="printBarangayCertificate('${record.firstName}', '${record.middleName}', '${record.lastName}', '${record.civilStatus}', '${record.birthdate}', '${record.birthplace}', '${record.address}', '${record.findings}', '${record.purpose}')">Print</button>
            </td>
        `;
        tbody.appendChild(row);
    });
});

// Search functionality
function searchClearance() {
    const query = document.getElementById("searchInput").value.trim();
    ipcRenderer.send("search-clearance-data", query);
}

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
                <button onclick="editRecord(${record.id}, '${record.firstName}', '${record.middleName}', '${record.lastName}', '${record.civilStatus}', '${record.birthdate}', '${record.birthplace}', '${record.address}', '${record.findings}', '${record.purpose}', '${record.contactNumber}')">Edit</button>
                <button onclick="deleteRecord(${record.id})">Delete</button>
                <button onclick="printBarangayCertificate('${record.firstName}', '${record.middleName}', '${record.lastName}', '${record.civilStatus}', '${record.birthdate}', '${record.birthplace}', '${record.address}', '${record.findings}', '${record.purpose}')">Print</button>
            </td>
        `;
        tbody.appendChild(row);
    });
});

// Open Edit Modal
function editRecord(id, firstName, middleName, lastName, civilStatus, birthdate, birthplace, address, findings, purpose, contactNumber) {
    document.getElementById("update-id").value = id;
    document.getElementById("update-last-name").value = lastName;
    document.getElementById("update-first-name").value = firstName;
    document.getElementById("update-middle-name").value = middleName;
    document.getElementById("update-civil-status").value = civilStatus;
    document.getElementById("update-birthdate").value = birthdate;
    document.getElementById("update-birthplace").value = birthplace;
    document.getElementById("update-address").value = address;
    document.getElementById("update-findings").value = findings;
    document.getElementById("update-purpose").value = purpose;
    document.getElementById("update-contact-number").value = contactNumber;
    
    // Show the modal
    document.getElementById("updateModal").style.display = "block";
}


// Close Edit Modal
function closeUpdateModal() {
    document.getElementById("updateModal").style.display = "none";
    modalOverlay.style.display = "none";

}

// Update Record
document.getElementById("updateRecordForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const updatedData = {
        id: document.getElementById("update-id").value,
        lastName: document.getElementById("update-last-name").value,
        firstName: document.getElementById("update-first-name").value,
        middleName: document.getElementById("update-middle-name").value,
        address: document.getElementById("update-address").value,
        birthdate: document.getElementById("update-birthdate").value,
        birthplace: document.getElementById("update-birthplace").value,
        purpose: document.getElementById("update-purpose").value,
        findings: document.getElementById("update-findings").value,
        civilStatus: document.getElementById("update-civil-status").value,
        contactNumber: document.getElementById("update-contact-number").value,
        gender: document.getElementById("update-gender").value
    };
    ipcRenderer.send("update-clearance", updatedData);
    closeUpdateModal();
});

ipcRenderer.on("clearance-updated", () => {
    loadClearanceData();
});

// Delete Record
function deleteRecord(id) {
    ipcRenderer.send("delete-clearance", id);
}

ipcRenderer.on("clearance-deleted", () => {
    loadClearanceData();
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
                <button onclick="editRecord(${record.id}, '${record.firstName}', '${record.middleName}', '${record.lastName}', '${record.civilStatus}', '${record.birthdate}', '${record.birthplace}', '${record.address}', '${record.findings}', '${record.purpose}', '${record.contactNumber}')">Edit</button>
                <button onclick="deleteRecord(${record.id})">Delete</button>
                <button onclick="printBarangayCertificate('${record.firstName}', '${record.middleName}', '${record.lastName}', '${record.civilStatus}', '${record.birthdate}', '${record.birthplace}', '${record.address}', '${record.findings}', '${record.purpose}')">Print</button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    });
});
addRecordBtn.addEventListener("click", () => {
    modalOverlay.style.display = "block";
    addModal.style.display = "block";
});

// Close modal when "Cancel" button is clicked
closeModalBtn.addEventListener("click", () => {
    modalOverlay.style.display = "none";
    addModal.style.display = "none";
});

// Handle form submission
form.addEventListener("submit", (event) => {
    event.preventDefault(); // Prevent default form submission
    addRecords();
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

function addRecords(){
    const recordData = {
        lastName: document.getElementById("last-name").value,
        firstName: document.getElementById("first-name").value,
        middleName: document.getElementById("middle-name").value,
        address: document.getElementById("address").value,
        birthdate: document.getElementById("birthdate").value,
        birthplace: document.getElementById("birthplace").value,
        purpose: document.getElementById("purpose").value,
        findings: document.getElementById("findings").value,
        civilStatus: document.getElementById("civil-status").value,
        gender: document.getElementById("gender").value,
        contactNumber: document.getElementById("contact-number").value
    };

    ipcRenderer.send("add-barangay-clearance", recordData);
}

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
