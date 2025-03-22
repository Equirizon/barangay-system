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

