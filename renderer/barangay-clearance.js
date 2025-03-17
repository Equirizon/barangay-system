const { ipcRenderer } = require("electron");
const path = require('node:path');

document.getElementById("modal").innerHTML = `
    <div id="id" hidden></div>
    <div class="modal">
        <div>
            <div>
                <div>
                    <div><label>Barangay Clearance No.</label><input type="text" id="barangay-clearance-number" placeholder="Enter Barangay Clearance No."></div>
                    <div><label>Document Date</label> <input type="text" id="document-date" placeholder="Enter Document Date"></div>
                    <div><label>OR Date</label> <input type="text" id="or-date" placeholder="Enter OR Date"></div>
                    <div><label>Document Number</label> <input type="text" id="document-number" placeholder="Enter Document Number"></div>
                </div>
                <div>
                    <div>
                        <div>
                            <label>Right Finger 1:</label>
                            <div>
                                <div class="image-box"></div>
                                <button class="biometrics-finger-btn">SCAN</button>
                            </div>
                        </div>
                        <div>
                            <label>Left Finger 2:</label>
                            <div>
                                <div class="image-box"></div>
                                <button class="biometrics-finger-btn">SCAN</button>
                            </div>
                            
                        </div>
                        <div>
                            <label>Face 3:</label>
                            <div>
                                <input id="face-file-name" style="display: none;">
                                <div class="image-box face"><canvas id="add-canvas"></canvas></div>
                                <button onclick="openPhotoModal()" class="biometrics-face-btn">SUBMIT</button>
                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>
            <div>
                <div>
                    <input type="text" id="full-name" class="full-name" readonly>
                </div>
                <div>
                    <div>
                        <label>Last Name:</label>
                        <input type="text" id="last-name" placeholder="Enter Last Name">
                    </div>
                    <div>
                        <label>First Name:</label>
                        <input type="text" id="first-name" placeholder="Enter First Name">
                    </div>
                    <div>
                        <label>Middle Name:</label>
                        <input type="text" id="middle-name" placeholder="Enter Middle Name">
                    </div>
                </div>
                <div>
                    <div>
                        <label>Date of Birth</label>
                        <input type="text" id="birthdate" placeholder="Enter Date of Birth">
                    </div>
                    <div>
                        <label>Age</label>
                        <input type="text" id="age" style="width: 92px;" readonly>
                    </div>
                    <div>
                        <label>Place of Birth</label>
                        <input type="text" id="birthplace" style="width: 328px;" placeholder="Enter Place of Birth">
                    </div>
                </div>
                <div>
                    <div>
                        <label>Address</label>
                        <input type="text" id="address" style="width: 668px;" placeholder="Enter Address">
                    </div>
                </div>
                <div>
                    <div class="select-wrapper">
                        <label>Civil Status:</label>
                        <select id="civil-status">
                            <option value="" disabled selected>Select Civil Status</option>
                            <option value="Single">Single</option>
                            <option value="Married">Married</option>
                            <option value="Widowed">Widowed</option>
                        </select>
                    </div>
                    <div class="select-wrapper">
                        <label>Gender:</label>
                        <select id="gender">
                            <option value="" disabled selected>Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>
                    <div class="select-wrapper">
                        <label>Purpose</label>
                        <select id="purpose">
                            <option value="" disabled selected>Select Purpose</option>
                            <option value="Local Employment">Local Employment</option>
                            <option value="Travel Abroad">Travel Abroad</option>
                            <option value="L.T.O Requirement">L.T.O Requirement</option>
                            <option value="Change of Name">Change of Name</option>
                            <option value="NAPOLCOM Requirement">NAPOLCOM Requirement</option>
                            <option value="PNP Requirement">PNP Requirement</option>
                        </select>
                    </div>
                </div>
                <div>
                    <div>
                        <label>Cedula Number:</label>
                        <input type="text" id="cedula-number" placeholder="Enter Cedula Number">
                    </div>
                    <div>
                        <label>Place Issued:</label>
                        <input type="text" id="place-issued" placeholder="Enter Place Issued">
                    </div>
                    <div>
                        <label>Date Issued:</label>
                        <input type="text" id="date-issued" placeholder="Enter Date Issued">
                    </div>
                </div>
                <div>
                    <div>
                        <label>TIN Number:</label>
                        <input type="text" id="tin-number" placeholder="Enter TIN Number">  
                    </div>
                    <div>
                        <label>OR Number:</label>
                        <input type="text" id="or-number" placeholder="Enter OR Number">
                    </div>
                    <div>
                        <label>Contact Number:</label>
                        <input type="text" id="contact-number" placeholder="Enter Contact Number">
                    </div>
                </div>
                <div>
                    <div>
                        <label>Findings:</label>
                        <input type="text" id="findings" style="width: 438px;" placeholder="Enter Findings">
                    </div>
                    <div>
                        <button style="width: 210px;" class="blue">PRINT OTHER CASE</button>
                    </div>
                </div>
            </div>
        </div>
        <div id="formButtons"></div> 
    </div>`;

const fields = [
    "id", "barangay-clearance-number", "document-date", 
    "or-date", "document-number", "face-file-name", 
    "last-name", "first-name", "middle-name", "address", 
    "birthdate", "birthplace", "civil-status", "gender",
    "purpose", "cedula-number", "place-issued", "date-issued", 
    "tin-number", "or-number", "contact-number", "findings"
];

let isEditing = false;

function addFormButtons() {
    const buttonHTML = isEditing
        ? `
            <button id="updateRecordBtn" class="blue">UPDATE</button>
            <button class="purple">PRINT</button>
            <button class="red">DELETE</button>
            <button onclick="cancelModal()" class="red">CANCEL</button>
        `
        : `
            <button id="createRecordBtn" class="blue">SAVE</button>
            <button id="saveAndPrint" class="purple">SAVE AND PRINT</button>
            <button type="button" onclick="cancelModal()" class="purple">CANCEL</button>
        `;

    document.getElementById("formButtons").innerHTML = buttonHTML;
    
    document.getElementById("createRecordBtn")?.addEventListener("click", createRecord);
    document.getElementById("updateRecordBtn")?.addEventListener("click", updateRecord);
    document.getElementById("saveAndPrint")?.addEventListener("click", saveAndPrintBtn);
}

addFormButtons();

const addRecordBtn = document.getElementById("addRecordBtn");
const modal = document.getElementById("modal");
const modalOverlay = document.getElementById("modalOverlay");
const faceInput = document.getElementById('face-file-name');
const addPhotoFileName = document.getElementById("face-file-name");
const canvas = document.getElementById('add-canvas');
const ctx = canvas.getContext('2d');
const captureButton = document.getElementById('capture');
const retryButton = document.getElementById('retry');
const saveButton = document.getElementById('save');
const video = document.getElementById('video');

const lastName = document.getElementById("last-name");
const firstName = document.getElementById("first-name");
const middleName = document.getElementById("middle-name");

const fullName = document.getElementById("full-name");
const birthdate = document.getElementById("birthdate");
const ageInput = document.getElementById("age");


let stream;
let isPhotoFileNameChanged = false;

function updateFullName() {
    let middle = middleName.value.trim();
    fullName.value = (lastName.value + " " + firstName.value + (middle ? ", " + middle : "")).toUpperCase();
}

function createTable(data) {
    const tbody = document.getElementById("clearanceTableBody");
    tbody.innerHTML = "";
    data.forEach(record => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${record.id}</td>
            <td>${record.lastName} ${record.firstName}${record.middleName ? ", " + record.middleName : ""}</td>
            <td>${calculateAge(record.birthdate)}</td>
            <td>${record.birthplace}</td>
            <td>${record.gender}</td>
            <td>${record.purpose}</td>
            <td>${record.contactNumber}</td>
            <td>${record.findings}</td>
            <td>${record.dateIssued}</td>
            <td>
                <button class="blue" data-record='${JSON.stringify(record)}' onclick="manageRecord(this)">Manage</button>
                <button class="purple" onclick="printBarangayCertificate('${record.firstName}', '${record.middleName}', '${record.lastName}', '${record.civilStatus}', '${record.birthdate}', '${record.birthplace}', '${record.address}', '${record.findings}', '${record.purpose}')">Print</button>
                <button class="red" onclick="deleteRecord(${record.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

[lastName, firstName, middleName].forEach(input => {
    input.addEventListener("input", updateFullName);
});

function assignInputValue(data) {
    for (const key in data) {
        const input = document.getElementById(key);
        if (input) {
            input.value = data[key];
        }
    }
}

function getFormData() {
    const data = {};
    fields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            const camelCaseKey = field.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
            data[camelCaseKey] = element.value;
        }
    });

    return data;
}

function removeInputValue() {
    fields.forEach(field => {
        const input = document.getElementById(field);
        if (input) {
            field === "face-file-name" ? input.value = "placeholder.jpg" : input.value = "";
        }
    });
    isEditing = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function manageRecord(button){   
    const record = JSON.parse(button.getAttribute("data-record"));
    const kebabCaseRecord = Object.fromEntries(
    Object.entries(record).map(([key, value]) => [
        key.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase(),
        value
    ])
    );
    assignInputValue(kebabCaseRecord);
    updateFullName();
    ageInput.value = calculateAge(birthdate.value);
    isEditing = true;
    displayFace(record.faceFileName, canvas, ctx);
    setTimeout(() => {
        openModal("modal", "modalOverlay");
        addFormButtons();
    }, 50);
}

function saveRecord(type) {
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
        addPhotoFileName.value = fileName;
        ipcRenderer.send("save-image", { imageData, filePath });
        ipcRenderer.send(`${type}-barangay-clearance`, getFormData());
    } else {
        ipcRenderer.send(`${type}-barangay-clearance`, getFormData());
    }
    
    cancelModal();
}
function updateRecord() {
    saveRecord("update");
}
function createRecord() {
    saveRecord("add");
}
function cancelModal() {
    closeModal("modal", "modalOverlay");
    removeInputValue();
}
addRecordBtn.addEventListener("click", (e) => {
    e.preventDefault();
    displayFace("placeholder.jpg", canvas, ctx);
    faceInput.value = "placeholder.jpg";
    fullName.value = "";
    ageInput.value = calculateAge(birthdate.value);
    openModal("modal", "modalOverlay");
    addFormButtons();
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

function calculateAge(birthDateValue) {
    if (!birthDateValue) return null; // Return null if birthdate is empty

    let birthDate = new Date(birthDateValue);
    let today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    let monthDiff = today.getMonth() - birthDate.getMonth();
    let dayDiff = today.getDate() - birthDate.getDate();

    // Adjust age if birthday hasn't happened yet this year
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
    }

    return age;
}

// Example usage
birthdate.addEventListener("blur", function() {
    let age = calculateAge(birthdate.value);
    if (age !== null) {
        ageInput.value = age;
    }
});



function loadClearanceData() {
    ipcRenderer.send("fetch-clearance-data");
}

ipcRenderer.on("clearance-updated", loadClearanceData);

ipcRenderer.on("clearance-data", (event, data) => {
    createTable(data);
});

ipcRenderer.on("search-clearance-results", (event, data) => {
    createTable(data);
});

document.addEventListener("DOMContentLoaded", () => {
    ipcRenderer.send("fetch-clearance-data");
});

function displayFace(imageSrc) {
    canvas.style.display = "block";
    const img = new Image();
    img.src = "../views/faces/" + imageSrc;
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

function searchClearance() {
    const query = document.getElementById("searchInput").value.trim();
    ipcRenderer.send("search-clearance-data", query);
}

function closeModal(modal, overlay) {
    document.getElementById(modal).style.display = "none";
    document.getElementById(overlay).style.display = "none";
}

function openModal(modal, overlay) {
    document.getElementById(modal).style.display = "block";
    document.getElementById(overlay).style.display = "flex";
}

function openPhotoModal() {
    openModal("photo-modal", "photoModalOverlay");
    canvas.style.display = "none";
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

function deleteRecord(id) {
    ipcRenderer.send("delete-clearance", id);
}

ipcRenderer.on("clearance-deleted", () => {
    loadClearanceData();
});

function saveAndPrintBtn() {
    createRecord();
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
}

ipcRenderer.on("barangay-clearance-added", () => {
    modal.style.display = "none";
    modalOverlay.style.display = "none";
    loadClearanceData();
});

function capture(){
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    video.pause();
    saveButton.disabled = false;
    retryButton.style.display = 'inline-block';
}

function saveFace() {
    canvas.style.display = "block";
    stream.getTracks().forEach(track => track.stop());
    video.srcObject = null;
    isPhotoFileNameChanged = true;
}

captureButton.addEventListener('click', () => {
    capture();
});

retryButton.addEventListener('click', () => {
    video.play();
    saveButton.disabled = true;
    retryButton.style.display = 'none';
});

saveButton.addEventListener('click', () => {
    saveFace();
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



