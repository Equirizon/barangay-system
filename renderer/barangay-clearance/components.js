function createTable(data) {
    const tbody = document.getElementById("clearanceTableBody");
    tbody.innerHTML = "";
    data.forEach(record => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${record.id}</td>
            <td>${record.lastName} ${record.firstName}${record.middleName ? ", " + record.middleName : ""}</td>
            <td>${calculateAge(record.birthdate) ?? ""}</td>
            <td>${record.birthplace}</td>
            <td>${record.gender}</td>
            <td>${record.purpose}</td>
            <td>${record.contactNumber}</td>
            <td>${record.findings}</td>
            <td>${record.dateIssued}</td>
            <td>
                <button class="blue" data-record='${JSON.stringify(record)}' onclick="manageRecord(this)">Manage</button>
                <!-- <button class="purple" onclick="printBarangayCertificate('${record.firstName}', '${record.middleName}', '${record.lastName}', '${record.civilStatus}', '${record.birthdate}', '${record.birthplace}', '${record.address}', '${record.findings}', '${record.purpose}')">Print</button>
                <button class="red" onclick="deleteRecord(${record.id})">Delete</button> -->
            </td>
        `;
        tbody.appendChild(row);
    });
}

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
                                <button class="biometrics-finger-btn yellow">SCAN</button>
                            </div>
                        </div>
                        <div>
                            <label>Left Finger 2:</label>
                            <div>
                                <div class="image-box"></div>
                                <button class="biometrics-finger-btn yellow">SCAN</button>
                            </div>
                            
                        </div>
                        <div>
                            <label>Face 3:</label>
                            <div>
                                <input id="face-file-name" style="display: none;">
                                <div class="image-box face"><canvas id="add-canvas"></canvas></div>
                                <button onclick="openPhotoModal()" class="biometrics-face-btn yellow">SUBMIT</button>
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
const manageId = document.getElementById('id');
function addFormButtons() {
    const buttonHTML = isEditing
        ? `
            <button id="updateRecordBtn" class="blue">UPDATE</button>
            <button class="purple">PRINT</button>
            <button class="red" onclick="deleteRecord(${manageId.value})">DELETE</button>
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

function printBarangayCertificate(firstName, middleName, lastName, civilStatus, birthdate, birthplace, address, findings, purpose) {
    const currentDate = new Date().toLocaleDateString();

    const certificateContent = `
        <html>
        <head>
            <title>Barangay Clearance</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .container { max-width: 600px; margin: auto; padding: 20px; border: 2px solid #000; }
                h1, h2 { text-align: center; }
                p { margin: 8px 0; }
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
                .duplicate { display: none; }
                .date-issued { text-align: right; margin-top: 15px; }
                @media print {
                    .no-print { display: none; }
                    .print { display: block; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Barangay Clearance</h1>
                <h2>Republic of the Philippines</h2>
                <h2>Barangay ChatGPT</h2>

                <p><strong>Name:</strong> ${firstName} ${middleName} ${lastName}</p>
                <p><strong>Civil Status:</strong> ${civilStatus}</p>
                <p><strong>Birthdate:</strong> ${birthdate}</p>
                <p><strong>Birthplace:</strong> ${birthplace}</p>
                <p><strong>Address:</strong> ${address}</p>
                <p><strong>Findings:</strong> ${findings}</p>
                <p><strong>Purpose:</strong> ${purpose}</p>
                <p class="date-issued"><strong>Date Issued:</strong> ${currentDate}</p>
            </div>
            <div class="container duplicate print">
                <h1>Barangay Clearance</h1>
                <h2>Republic of the Philippines</h2>
                <h2>Barangay ChatGPT</h2>

                <p><strong>Name:</strong> ${firstName} ${middleName} ${lastName}</p>
                <p><strong>Civil Status:</strong> ${civilStatus}</p>
                <p><strong>Birthdate:</strong> ${birthdate}</p>
                <p><strong>Birthplace:</strong> ${birthplace}</p>
                <p><strong>Address:</strong> ${address}</p>
                <p><strong>Findings:</strong> ${findings}</p>
                <p><strong>Purpose:</strong> ${purpose}</p>
                <p class="date-issued"><strong>Date Issued:</strong> ${currentDate}</p>
            </div>
            <div class="btn-container">
                <button class="print-btn no-print" aria-label="Print Document" onclick="window.print()">Print</button>
                <button class="cancel-btn no-print" aria-label="Close Window" onclick="window.close()">Cancel</button>
            </div>
        </body>
        </html>
    `;

    const docWindow = window.open("", "_blank");
    docWindow.document.write(certificateContent);
    docWindow.document.close();
}

