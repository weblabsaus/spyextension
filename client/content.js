import { Client } from "@gradio/client";

// Read the host URL from url.txt
async function getHostUrl() {
  const response = await fetch(chrome.runtime.getURL('url.txt'));
  return response.text();
}

// Access camera, capture frames, and identify objects using the API
async function captureAndIdentify() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const video = document.createElement('video');
    video.srcObject = stream;
    video.play();

    // Capture frame every 5 seconds
    setInterval(async () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      
      const client = await Client.connect("grahenr29/eieiei", {
        headers: {
          'Authorization': `Bearer your_access_token_here`
        }
      });

      const result = await client.predict("/predict", { param_0: blob });
      const identifiedObjects = result.data;

      console.log("Identified objects: ", identifiedObjects);

      // Store objects in localStorage to send later
      let existingObjects = JSON.parse(localStorage.getItem('identifiedObjects')) || [];
      existingObjects.push(identifiedObjects);
      localStorage.setItem('identifiedObjects', JSON.stringify(existingObjects));
    }, 5000);
  } catch (error) {
    console.error('Error accessing camera:', error);
  }
}

// Send data to the server every minute
async function sendObjects() {
  const identifiedObjects = JSON.parse(localStorage.getItem('identifiedObjects')) || [];
  if (identifiedObjects.length > 0) {
    try {
      const hostUrl = await getHostUrl();
      await fetch(`${hostUrl}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ objects: identifiedObjects })
      });
      console.log("Data sent to:", hostUrl);

      // Clear stored objects after sending
      localStorage.removeItem('identifiedObjects');
    } catch (err) {
      console.error('Failed to send data to server:', err);
    }
  }
}

// Start capturing video and identifying objects
captureAndIdentify();

// Send objects every minute
setInterval(sendObjects, 60000);
