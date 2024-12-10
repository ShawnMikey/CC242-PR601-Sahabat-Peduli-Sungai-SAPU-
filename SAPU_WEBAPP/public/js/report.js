// Exit any specific page to main
function exitToHome() {
    // SweetAlert2 confirmation dialog
    Swal.fire({
        title: 'Apakah anda yakin?',
        text: "Semua progress akan hilang jika anda keluar!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33', // Red button
        cancelButtonColor: '#3085d6', // Blue button
        confirmButtonText: 'Ya, keluar',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
        // Reset all fields and hide sections
        document.getElementById('fileInput').value = "";
        document.getElementById('imagePreview').innerHTML = "";
        document.getElementById('reportTitle').value = "";
        document.getElementById('reportDescription').value = "";

        // Show "Choose Image" button and hide other sections
        document.getElementById('confirmBtn').style.display = 'none';
        document.getElementById('formSection').style.display = 'none';

        // Scroll to the top (optional)
        window.scrollTo(0, 0);

        // Show ambil foto atau galeri kembali
        document.getElementById('ambil-foto-Btn').style.display = 'inline-block';
        document.getElementById('pilih-galeri-Btn').style.display = 'inline-block';
        
        window.location.href = '/index';

        // Show a toast notification for feedback
        Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Exited successfully',
            showConfirmButton: false,
            timer: 1500
        });
        }
    });
}

// Add map
let selectedLocation = null;

// Initialize Map
const map = L.map('map').setView([0, 0], 2); // Default world view
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
}).addTo(map);

// Add Marker on Click
let marker = null;
map.on('click', function (e) {
    const { lat, lng } = e.latlng;

    // Update marker position
    if (marker) {
        marker.setLatLng(e.latlng);
    } else {
        marker = L.marker(e.latlng).addTo(map);
    }

    // Save coordinates
    selectedLocation = { lat, lng };
    alert(`Lokasi dipilih: ${lat}, ${lng}`);
});

// Handle file after selecting location
function preInput() {
    document.getElementById('mapSection').style.display = "none";
    document.getElementById('uploadSection').style.display = "flex";
 }

// Handle file input for taking a photo or uploading from gallery
function handleFileInput() {
    uploadedImage = document.getElementById('fileInput').click();
    document.getElementById('uploadSection').style.display = "none";
    document.getElementById('confirmationSection').style.display = "flex";
 }

// Retake the image
function retakeImage() {
    document.getElementById('uploadSection').style.display = "flex";
    document.getElementById('confirmationSection').style.display = "none";
}

// Show form after confirm
function showForm() {
    document.getElementById('confirmationSection').style.display = "none";
    document.getElementById('formSection').style.display = 'block'; // Show form
}

// Object detection
let uploadedImage = null; // To store the uploaded image
let model = null; // To store the loaded model

// Load the model when the page loads
async function loadModel() {
    model = await tf.loadGraphModel("/model/model.json");
    console.log("Model loaded successfully!");
}

// Preview image after upload
function handleFileUpload() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onloadend = function () {
            const img = document.createElement('img');
            img.src = reader.result;
            img.style.maxWidth = '100%';
            img.style.maxHeight = '100%';

            // Display the image preview
            document.getElementById('imagePreview').innerHTML = '';
            document.getElementById('imagePreview').appendChild(img);

            // Save the uploaded image file for later use
            uploadedImage = file;

            // Show additional buttons
            document.getElementById('confirmBtn').style.display = 'inline-block';
            document.getElementById('retakeBtn').style.display = 'inline-block';
        };

        reader.readAsDataURL(file);
    }
}

// Preprocess the image
async function preprocessImage() {
    // Access the dynamically created image element in the preview
    const imgElement = document.querySelector('#imagePreview img'); // Select the <img> inside #imagePreview
    
    if (!imgElement) {
        console.error("No image found for preprocessing.");
        return;
    }

    // Convert image element to Tensor and preprocess
    let tensor = tf.browser.fromPixels(imgElement)
        .resizeBilinear([512, 512]) // Resize the image to match model input size
        .toInt()
        .expandDims(0); // Add batch dimension

    return tensor;
}

// Run Inference with the Model
async function runObjectDetection() {
    if (!uploadedImage) {
        alert("Silakan upload gambar terlebih dahulu!");
        return;
    }

    // Preprocess the image
    const inputTensor = await preprocessImage();

    // Run the model prediction
    const predictions = await model.executeAsync(inputTensor);
    console.log("Predictions:", predictions);

    // Visualize predictions (customize based on your model output)
    displayPredictions(predictions);
    inputTensor.dispose();

    // Change h1 tag
    const h1 = document.getElementById("step_2"); // Select the h1 tag
    h1.innerText = "Prediksi ML model"; // Update the content

    // Hide and Show button
    document.getElementById('confirmBtn').style.display = "none";
    document.getElementById('retakeBtn').style.display = "none";
    document.getElementById('runDetectionBtn').style.display = "block";
}

// Define pollution levels
const pollutionLevels = {
    low: { threshold: -Infinity, label: "Low", color: "green" },
    moderate: { threshold: 20, label: "Moderate", color: "orange" },
    high: { threshold: 40, label: "High", color: "red" },
};

// Display Predictions on the Image
function displayPredictions(predictions) {
    const imgContainer = document.getElementById('imagePreview');
    const imgElement = document.querySelector('#imagePreview img'); // Select the image
    if (!imgElement) {
        console.error("No image found for predictions display.");
        return;
    }

    // Create a canvas to draw the image and predictions
    const canvas = document.createElement('canvas');
    canvas.width = imgElement.width;
    canvas.height = imgElement.height;
    const ctx = canvas.getContext('2d');

    // Draw the original image onto the canvas
    ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);

    // Get boxes, scores, and classes
    const boxes = predictions[1].arraySync(); // Bounding boxes
    const scores = predictions[2].arraySync(); // Confidence scores
    const classes = predictions[0].arraySync(); // Class IDs

    console.log(boxes) // Check Bounding boxes
    console.log(scores) // Check Confidence scores
    console.log(classes) // Check Class IDs

    let trashCount = 0; // Count trash
    
    boxes[0].forEach((box, i) => {
      if (scores[0][i] > 0.07) { // Confidence threshold
        trashCount++; // Count detected trash items
          
        const [y1, x1, y2, x2] = box;
    
        // Draw rectangle
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(
          x1 * canvas.width, y1 * canvas.height,
          (x2 - x1) * canvas.width, (y2 - y1) * canvas.height
        );
    
        // Draw label
        const label = `Waste (${Math.round(scores[0][i] * 100)}%)`;
        ctx.fillStyle = 'red';
        ctx.font = '16px Arial';
        ctx.fillText(label, x1 * canvas.width, y1 * canvas.height - 10);
        }
    });

    // Replace the original preview with the annotated canvas
    imgContainer.innerHTML = ""; // Clear existing content
    imgContainer.appendChild(canvas); // Add annotated canvas

    let pollutionLabel = "Low";
    let pollutionColor = "green";
  
    // Determine the pollution level
    if (trashCount >= pollutionLevels.moderate.threshold && trashCount < pollutionLevels.high.threshold) {
      pollutionLabel = pollutionLevels.moderate.label;
      pollutionColor = pollutionLevels.moderate.color;
    } else if (trashCount >= pollutionLevels.high.threshold) {
      pollutionLabel = pollutionLevels.high.label;
      pollutionColor = pollutionLevels.high.color;
    }
  
    // Draw a rectangle for the background box
    const text = `Priority Level: ${pollutionLabel} (${trashCount} wastes)`;
    ctx.font = 'bold 20px Poppins, Arial, sans-serif';
    const textWidth = ctx.measureText(text).width;
    const padding = 10;
  
    // Set rectangle position and size
    const boxX = (canvas.width - textWidth) / 2 - padding;
    const boxY = 10;
    const boxHeight = 30 + padding; // Adjust height to fit text
  
    // Draw the rectangle
    ctx.fillStyle = '#333'; // Dark background for contrast
    ctx.globalAlpha = 0.8;  // Set transparency for the box
    ctx.fillRect(boxX, boxY, textWidth + padding * 2, boxHeight);
    ctx.globalAlpha = 1.0;  // Reset transparency
  
    // Draw pollution level text on the rectangle
    ctx.fillStyle = pollutionColor;
    ctx.textAlign = 'center';
    ctx.fillText(text, canvas.width / 2, boxY + 30); // Adjust vertical position
}

// Call loadModel() when the page loads
window.onload = loadModel;

// Simulate submitting the report
function submitReport() {
    document.getElementById('formSection').style.display = "none";
    document.getElementById('historySection').style.display = "block";
    const title = document.getElementById('reportTitle').value;
    const description = document.getElementById('reportDescription').value;

    if (!title || !description) {
    alert('Please fill in both the title and description.');
    return;
    }

    alert('Report submitted successfully:\n\nTitle: ' + title + '\nDescription: ' + description);
    // In a real app, you'd send this data to a server for further processing
}