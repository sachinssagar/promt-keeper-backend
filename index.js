import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import cors from 'cors';
import bodyParser from 'body-parser';

import itemRoutes from './routes/Item.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json({ limit: '50mb' }));
app.use(
  bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
    parameterLimit: 50000,
  }),
);

// Middleware
dotenv.config();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_DB_URL)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => console.log('Error connecting to MongoDB:', error));

// Routes

app.get('/', (req, res) => {
  res.json({
    message: 'Server is running',
    status: 'healthy',
  });
});

app.use('/api/items', itemRoutes);
