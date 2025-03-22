const { ipcRenderer } = require("electron");
const path = require('node:path');

const fields = [
    "id", "barangay-clearance-number", "document-date", 
    "or-date", "document-number", "face-file-name", 
    "last-name", "first-name", "middle-name", "address", 
    "birthdate", "birthplace", "civil-status", "gender",
    "purpose", "cedula-number", "place-issued", "date-issued", 
    "tin-number", "or-number", "contact-number", "findings"
];

let isEditing = false;

addFormButtons();

const addRecordBtn = document.getElementById("addRecordBtn");
const modal = document.getElementById("modal");
const modalOverlay = document.getElementById("modalOverlay");
const faceInput = document.getElementById('face-file-name');
const canvas = document.getElementById('add-canvas');
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

const ctx = canvas.getContext('2d');


let stream;
let isPhotoFileNameChanged = false;

function updateFullName() {
    let middle = middleName.value.trim();
    fullName.value = (lastName.value + " " + firstName.value + (middle ? ", " + middle : "")).toUpperCase();
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
    if (isPhotoFileNameChanged) {
        const saveDirectory = path.join(__dirname, "faces");
        const imageData = canvas.toDataURL('image/png');
        const matches = imageData.match(/^data:image\/(\w+);base64,/);

        if (!matches) {
            console.error("Invalid image data format.");
            alert("Failed to save the photo. Please try again.");
            return;
        }

        const fileExtension = matches[1];
        const fileName = `captured_image_${Date.now()}.${fileExtension}`;
        const filePath = path.join(saveDirectory, fileName);

        faceInput.value = fileName;
        ipcRenderer.send("save-image", { imageData, filePath });
    }

    // Send form data regardless of photo changes
    ipcRenderer.send(`${type}-barangay-clearance`, getFormData());
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

async function saveAndPrintBtn() {
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



