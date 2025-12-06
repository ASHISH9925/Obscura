const dotenv = require("dotenv");
const HealthRoutes = require("./routes/HealthCheckRoute.js");
const EncodeRoutes = require("./routes/EncodeRoutes.js");
const DecodeRoutes = require("./routes/DecodeRoutes.js");
const FileRoutes = require("./routes/FileRoutes.js");
const GraphRoutes = require("./routes/GraphRoutes.js");
const express = require("express");
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path')

dotenv.config({
  path: "./.env",
});

const File = require('./models/File.js');

const app = express();
const port = process.env.PORT || 8002;
console.log(`server is listening at port --> ${port}`);


let isConnected = false;

async function connectToMongo() {
  try {
    if (isConnected) {
      console.log('Already connected to the database.');
      return;
    }

    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;  // Set to true after successful connection
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to the database:', error);
    throw error;
  }
}

app.use(async (req, res, next) => {
  if(!isConnected){
    await connectToMongo();  // Add await here
  }
  next();
})

const corsOptions = {
  origin: [
    "http://localhost:5173", 
    "http://localhost:3000", 
    /^https:\/\/test-deployment.*\.vercel\.app$/, 
    /^https:\/\/obscura.*\.vercel\.app$/          
  ],
  credentials: true
};

const buildPath = path.join(__dirname, '../client/dist');
app.use(express.static(buildPath));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(HealthRoutes);
app.use(EncodeRoutes);
app.use(DecodeRoutes);
app.use(FileRoutes);
app.use(GraphRoutes);


app.listen(port,()=>{
  console.log("Server is listening at port", port);
});