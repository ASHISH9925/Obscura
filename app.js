const dotenv = require("dotenv");
const HealthRoutes = require("./routes/HealthCheckRoute");
const EncodeRoutes = require("./routes/EncodeRoutes");
const DecocdeRoutes = require("./routes/DecodeRoutes");
const express = require("express");

dotenv.config({
  path: "./.env",
});

const app = express();
const port = process.env.PORT || 8002;
console.log(`server is listening at port --> ${port}`);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(HealthRoutes);
app.use(EncodeRoutes);
app.use(DecodeRoutes);

app.listen(port);
