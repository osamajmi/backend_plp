require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const productRoutes = require('./routes/products');

const app = express();

const allowedOrigins = [
  "http://localhost:5173",                // Vite dev server
  "https://pl-pfrontend.vercel.app"      // Vercel frontend
];

app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true); // Postman, server-to-server
    if(allowedOrigins.indexOf(origin) === -1){
      return callback(new Error('CORS policy does not allow access from this origin.'), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if(!MONGO_URI){
  console.error('MONGO_URI missing in .env');
  process.exit(1);
}

// Connect DB and start server
(async function startServer(){
  try{
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    app.use('/api/products', productRoutes);

    app.get('/', (req,res) => res.send('Backend running'));

    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  }catch(err){
    console.error('❌ Failed to connect to MongoDB:', err);
    process.exit(1);
  }
})();
