const { ipcRenderer } = require("electron");

const addRecordBtn = document.getElementById("addRecordBtn");
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
                <button onclick="editRecord(${record.id}, '${record.lastName}', '${record.address}', '${record.purpose}')">Edit</button>
                <button onclick="deleteRecord(${record.id})">Delete</button>
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
                <button onclick="editRecord(${record.id}, '${record.lastName}', '${record.address}', '${record.purpose}')">Edit</button>
                <button onclick="deleteRecord(${record.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
});

// Open Edit Modal
function editRecord(id, lastName, address, purpose) {
    document.getElementById("update-id").value = id;
    document.getElementById("update-last-name").value = lastName;
    document.getElementById("update-address").value = address;
    document.getElementById("update-purpose").value = purpose;
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
    if (confirm("Are you sure you want to delete this record?")) {
        ipcRenderer.send("delete-clearance", id);
    }
}

ipcRenderer.on("clearance-deleted", () => {
    loadClearanceData();
});

document.addEventListener("DOMContentLoaded", () => {

    ipcRenderer.send("fetch-clearance-data");
    ipcRenderer.on("clearance-data", (event, data) => {
        const tableBody = document.getElementById("clearanceTableBody");
        tableBody.innerHTML = ""; // Clear existing table data

        data.forEach(row => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${row.id}</td>
                <td>${row.lastName}</td>
                <td>${row.address}</td>
                <td>${row.purpose}</td>
                <td>${row.dateIssued}</td>
                <td>
                <button onclick="editRecord(${row.id}, '${row.lastName}', '${row.address}', '${row.purpose}')">Edit</button>
                <button onclick="deleteRecord(${row.id})">Delete</button>
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

    ipcRenderer.send("add-barangay-clearance", recordData); // Send data to main process
});

// Listen for success response
ipcRenderer.on("barangay-clearance-added", () => {
    addModal.style.display = "none";
    modalOverlay.style.display = "none";
    document.getElementById("createRecordForm").reset();
    loadClearanceData();
});