const { ipcRenderer } = require("electron");
const path = require('node:path');

const addRecordBtn = document.getElementById("addRecordBtn");
const saveAndPrintBtn = document.getElementById("saveAndPrint");
const addModal = document.getElementById("addModal");
const canvas = document.getElementById('canvas');
const addCanvas = document.getElementById('add-canvas');
const video = document.getElementById('video');
const captureButton = document.getElementById('capture');
const saveButton = document.getElementById('save');
const retryButton = document.getElementById('retry');
const ctx = canvas.getContext('2d');
const addCtx = addCanvas.getContext('2d');
const addPhotoFileName = document.getElementById("face-file-name");
const photoFileName = document.getElementById("manage-face-file-name");
let isPhotoFileNameChanged = false;

let stream;

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
                <button data-record='${JSON.stringify(record)}' onclick="manageRecord(this)">Manage</button>
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
                <button data-record='${JSON.stringify(record)}' onclick="manageRecord(this)">Manage</button>
                <button onclick="printBarangayCertificate('${record.firstName}', '${record.middleName}', '${record.lastName}', '${record.civilStatus}', '${record.birthdate}', '${record.birthplace}', '${record.address}', '${record.findings}', '${record.purpose}')">Print</button>
                <button onclick="deleteRecord(${record.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
});

function displayFace(imageSrc, canvas, ctx) {
    canvas.style.display = "block";
    const img = new Image();
    img.src = "../views/faces/" + imageSrc; // Make sure the image path is correct
    // Wait for the image to load before drawing
    img.onload = function () {
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const canvasRatio = canvas.width / canvas.height;

        let drawWidth, drawHeight;

        if (canvasRatio > imgRatio) {
            drawHeight = canvas.height;
            drawWidth = drawHeight * imgRatio;
        } else {
            drawWidth = canvas.width;
            drawHeight = drawWidth / imgRatio;
        }

        const xOffset = (canvas.width - drawWidth) / 2;
        const yOffset = (canvas.height - drawHeight) / 2;

        ctx.drawImage(img, xOffset, yOffset, drawWidth, drawHeight);
    };
}

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
                <button data-record='${JSON.stringify(record)}' onclick="manageRecord(this)">Manage</button>
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

function assignInputValue(record) {
    const fieldMapping = {
        "manage-id": record.id,
        "manage-barangay-clearance-number": record.barangayClearanceNumber,
        "manage-document-date": record.documentDate,
        "manage-or-date": record.orDate,
        "manage-document-number": record.documentNumber,
        "manage-or-number": record.orNumber,
        "manage-last-name": record.lastName,
        "manage-first-name": record.firstName,
        "manage-middle-name": record.middleName,
        "manage-address": record.address,
        "manage-birthdate": record.birthdate,
        "manage-birthplace": record.birthplace,
        "manage-civil-status": record.civilStatus,
        "manage-gender": record.gender,
        "manage-contact-number": record.contactNumber,
        "manage-purpose": record.purpose,
        "manage-findings": record.findings,
        "manage-cedula-number": record.cedulaNumber,
        "manage-place-issued": record.placeIssued,
        "manage-date-issued": record.dateIssued,
        "manage-tin-number": record.tinNumber,
        "manage-face-file-name": record.faceFileName
    };

    Object.keys(fieldMapping).forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            element.value = fieldMapping[field] || ""; // Assign value or empty string if undefined
        }
    });
}

function removeInputValue() {
    const fields = [
        "id", "barangay-clearance-number", "document-date", 
        "or-date", "document-number", "face-file-name", 
        "last-name", "first-name", "middle-name", "address", 
        "birthdate", "birthplace", "civil-status", "gender",
        "purpose", "cedula-number", "place-issued", "date-issued", 
        "tin-number", "or-number", "contact-number", "findings"
    ];
    
    fields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            element.value = "";        }
    });
    addCtx.clearRect(0, 0, canvas.width, canvas.height);
}

function removeManageInputValue() {
    const fields = [
        "manage-id", "manage-barangay-clearance-number", "manage-document-date", 
        "manage-or-date", "manage-document-number", "manage-face-file-name", 
        "manage-last-name", "manage-first-name", "manage-middle-name", "manage-address", 
        "manage-birthdate", "manage-birthplace", "manage-civil-status", "manage-gender",
        "manage-purpose", "manage-cedula-number", "manage-place-issued", "manage-date-issued", 
        "manage-tin-number", "manage-or-number", "manage-contact-number", "manage-findings"

    ];
    
    fields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            element.value = "";
        }
    });
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function closeModal(modal, overlay) {
    document.getElementById(modal).style.display = "none";
    document.getElementById(overlay).style.display = "none";
    if (modal === "addModal") {
        removeInputValue();
    }else if (modal === "manageModal") {
        removeManageInputValue();
    }
}

function openModal(modal, overlay) {
    document.getElementById(modal).style.display = "block";
    document.getElementById(overlay).style.display = "flex";
}

function openPhotoModal() {
    openModal("photo-modal", "photoModalOverlay");
    canvas.style.display = "none";
    addCanvas.style.display = "none";
    video.play();
    saveButton.disabled = true;
    retryButton.style.display = 'none';
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(mediaStream => {
            stream = mediaStream;
            video.srcObject = mediaStream;
        })
        .catch(error => {
            console.error('Error accessing webcam:', error);
        });
}

function manageRecord(button){
    const record = JSON.parse(button.getAttribute("data-record"));
    assignInputValue(record);
    displayFace(record.faceFileName, canvas, ctx);
    setTimeout(() => {
        openModal("manageModal", "modalOverlay");
    }, 50);
}

function getFormData(prefix) {
    const fields = [
        "id", "barangay-clearance-number", "document-date", 
        "or-date", "document-number", "face-file-name", 
        "last-name", "first-name", "middle-name", "address", 
        "birthdate", "birthplace", "civil-status", "gender",
        "purpose", "cedula-number", "place-issued", "date-issued", 
        "tin-number", "or-number", "contact-number", "findings"
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

document.getElementById("updateRecordBtn").addEventListener("click", (e) => {
    e.preventDefault();
    if (isPhotoFileNameChanged){
        const saveDirectory = path.join(__dirname, "faces");
        const imageData = canvas.toDataURL('image/png');
        const matches = imageData.match(/^data:image\/(\w+);base64,/);
        if (!matches) {
            throw new Error("Invalid image data format.");
        }
        const extension = matches[1];
        const fileName = `captured_image_${Date.now()}.${extension}`;
        const filePath = path.join(saveDirectory, fileName);
        photoFileName.value = fileName;
        ipcRenderer.send("save-image", { imageData, filePath });
        ipcRenderer.send("update-clearance", getFormData("manage-"));
    } else {
        ipcRenderer.send("update-clearance", getFormData("manage-"));
    }
    closeModal("manageModal", "modalOverlay");
});

document.getElementById("createRecordBtn").addEventListener("click", (e) => {
    e.preventDefault();
    if (isPhotoFileNameChanged){
        const saveDirectory = path.join(__dirname, "faces");
        const imageData = addCanvas.toDataURL('image/png');
        const matches = imageData.match(/^data:image\/(\w+);base64,/);
        if (!matches) {
            throw new Error("Invalid image data format.");
        }
        const extension = matches[1];
        const fileName = `captured_image_${Date.now()}.${extension}`;
        const filePath = path.join(saveDirectory, fileName);
        addPhotoFileName.value = fileName;
        ipcRenderer.send("save-image", { imageData, filePath });
        ipcRenderer.send("add-barangay-clearance", getFormData(""));
    } else {
        ipcRenderer.send("add-barangay-clearance", getFormData(""));
    }
    
    closeModal("addModal", "modalOverlay");
});

addRecordBtn.addEventListener("click", (e) => {
    e.preventDefault();
    displayFace("placeholder.jpg", addCanvas, addCtx);
    openModal("addModal", "modalOverlay");
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

function capture(canvas, ctx){
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    video.pause();
    saveButton.disabled = false;
    retryButton.style.display = 'inline-block';
}

function saveFace(canvas) {
    canvas.style.display = "block";
    stream.getTracks().forEach(track => track.stop());
    video.srcObject = null;
}

captureButton.addEventListener('click', () => {
    addModal.style.display === "block" ? capture(addCanvas, addCtx) : capture(canvas, ctx);
});

retryButton.addEventListener('click', () => {
    video.play();
    saveButton.disabled = true;
    retryButton.style.display = 'none';
});

saveButton.addEventListener('click', () => {
    addModal.style.display === "block" ? saveFace(addCanvas) : saveFace(canvas); 
    isPhotoFileNameChanged = true;
});

ipcRenderer.on("save-image-response", (event, response) => {
    if (response.success) {
        console.log("Image saved at:", response.filePath);
        alert(response.filePath);
    } else {
        console.error(response.error);
        alert("Failed to save image.");
    }
});