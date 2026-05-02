import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import cors from 'cors';
import bodyParser from 'body-parser';
import https from 'https';

import itemRoutes from './routes/Item.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json({ limit: '100mb' }));
app.use(
  bodyParser.urlencoded({
    limit: '100mb',
    extended: true,
    parameterLimit: 100000000, 
  }),
);

// Middleware
dotenv.config();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Middleware for periodic pinging
const pingRenderApp = () => {
  setInterval(() => {
    // Make an HTTPS GET request to the specified URL
    https
      .get('https://promt.onrender.com/', (res) => {
        console.log(`Ping status: ${res.statusCode}`);
      })
      .on('error', (err) => {
        console.error('Error pinging Render app:', err);
      });
  }, 600000); // every 10 minutes (600000 ms)
};

// MongoDB connection
mongoose
  .connect(process.env.MONGO_DB_URL)
  .then(() => {
    console.log('Connected to MongoDB');
    pingRenderApp();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => console.log('Error connecting to MongoDB:', error));

// Routes
// health check
app.get('/', (req, res) => {
  res.send('API is running....');
});

app.use('/api/promts', itemRoutes);
