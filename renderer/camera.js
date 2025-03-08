const { ipcRenderer } = require('electron');

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureButton = document.getElementById('capture');
const saveButton = document.getElementById('save');
const retryButton = document.getElementById('retry');
const ctx = canvas.getContext('2d');

let stream;

// Access webcam
navigator.mediaDevices.getUserMedia({ video: true })
    .then(mediaStream => {
        stream = mediaStream;
        video.srcObject = mediaStream;
    })
    .catch(error => {
        console.error('Error accessing webcam:', error);
    });

captureButton.addEventListener('click', () => {
    // Capture the current frame
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Pause the video (freeze effect)
    video.pause();

    // Show Save & Retry buttons
    saveButton.disabled = false;
    retryButton.style.display = 'inline-block';
});

retryButton.addEventListener('click', () => {
    // Resume the video
    video.play();

    // Hide Save & Retry buttons
    saveButton.disabled = true;
    retryButton.style.display = 'none';
});

saveButton.addEventListener('click', () => {
    const imageData = canvas.toDataURL('image/png');
    ipcRenderer.send('save-image', imageData);
});

ipcRenderer.on('save-image-response', (event, message) => {
    alert(message);
});
