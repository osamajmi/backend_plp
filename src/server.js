// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const productRoutes = require('../src/routes/products');

const app = express();
app.use(cors({
  origin: [
    "http://localhost:8080",                 
    "https://pl-pfrontend.vercel.app"       
  ],
  methods: ["GET", "POST", "PUT","PATCH", "DELETE"], 
  credentials: true                         
}));
app.use(express.json());

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI missing in .env');
  process.exit(1);
}

// Async IIFE to connect DB and start server
(async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Routes only registered after successful DB connection
    app.use('/api/products', productRoutes);

    app.get('/', (req, res) => res.send('PLP Backend running'));

    app.listen(PORT, () => console.log(`🚀 Server running on port http://127.0.0.1:${PORT}`));
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err);
    process.exit(1);
  }
})();
