const dotenv = require("dotenv");
const HealthRoutes = require("./routes/HealthCheckRoute.js");
const EncodeRoutes = require("./routes/EncodeRoutes.js");
const DecodeRoutes = require("./routes/DecodeRoutes.js");
const FileRoutes = require("./routes/FileRoutes.js");
const GraphRoutes = require("./routes/GraphRoutes.js");
const express = require("express");
const mongoose = require('mongoose');
const cors = require('cors');

dotenv.config({
  path: "./.env",
});

const File = require('./models/File');

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully.'))
    .catch(err => console.error('MongoDB connection error:', err));

const app = express();
const port = process.env.PORT || 8002;
console.log(`server is listening at port --> ${port}`);

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(HealthRoutes);
app.use(EncodeRoutes);
app.use(DecodeRoutes);
app.use(FileRoutes);
app.use(GraphRoutes);

app.listen(port);
