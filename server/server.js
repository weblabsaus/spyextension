import express from 'express';
import { connectToDatabase } from './mongodb.js'; // Adjust the path if necessary

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post('/upload', async (req, res) => {
  const { objects } = req.body;
  const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  if (!objects) {
    return res.status(400).send('No objects provided');
  }

  const db = await connectToDatabase();
  const collection = db.collection("objects");

  try {
    await collection.insertOne({ ip: userIp, objects, timestamp: new Date() });
    res.status(200).send('Data saved successfully');
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).send('Error saving data');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
