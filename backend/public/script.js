const form = document.getElementById("uploadForm");
const imageInput = document.getElementById("imageInput");
const resultDiv = document.getElementById("result");
const preview = document.getElementById("preview");
const predictionText = document.getElementById("prediction");
const messageText = document.getElementById("message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = imageInput.files[0];
  if (!file) {
    alert("Please select an image!");
    return;
  }

  const formData = new FormData();
  formData.append("image", file);

  predictionText.textContent = "Processing...";
  messageText.textContent = "";
  resultDiv.style.display = "block";
  preview.src = URL.createObjectURL(file);

  try {
    const response = await fetch("/predict", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Server error while processing image.");

    const data = await response.json();

    predictionText.textContent =
      data.prediction === "armyworm"
        ? `Armyworm Detected! (${data.confidence}%)`
        : `No Armyworm Found! (${data.confidence}%)`;

    messageText.textContent = data.message;
    preview.src = data.imageUrl;

    // Update colors
    messageText.style.color =
      data.prediction === "armyworm" ? "#e74c3c" : "#27ae60"; // red/green
    predictionText.style.color =
      data.prediction === "armyworm" ? "#e74c3c" : "#27ae60";
  } catch (error) {
    predictionText.textContent = "Error";
    messageText.textContent = "Failed to connect to the backend.";
    console.error(error);
  }
});
