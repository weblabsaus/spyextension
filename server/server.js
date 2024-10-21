const express = require('express');
const fs = require('fs');
const ip = require('ip');
const path = require('path');

const app = express();
app.use(express.json());

const dataDir = path.join(__dirname, 'data');

// Ensure the 'data' directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Endpoint to receive object data from the extension
app.post('/upload', (req, res) => {
  const objects = req.body.objects;
  const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || ip.address();

  // Format the file name based on the user's IP
  const fileName = `${userIp.replace(/[:.]/g, '_')}.txt`;
  const filePath = path.join(dataDir, fileName);

  // Format the object data as a comma-separated string
  const formattedObjects = objects.map(obj => obj.join(', ')).join(', ');

  // Append the objects to the IP-specific file
  fs.appendFile(filePath, `${formattedObjects}\n`, (err) => {
    if (err) {
      console.error('Error saving objects:', err);
      return res.status(500).send('Failed to save objects');
    }
    console.log(`Objects saved for IP ${userIp}: ${formattedObjects}`);
    res.send('Objects received and saved');
  });
});

// Start the server on port 3000
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
