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
const helmet = require("helmet");


dotenv.config({
  path: "./.env",
});

const File = require('./models/File.js');

const app = express();
const port = process.env.PORT || 8002;
console.log(`server is listening at port --> ${port}`);


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => {
    console.error('Error connecting to the database:', error);
  });

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


app.use(helmet());

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