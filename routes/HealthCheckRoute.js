const express = require("express");
const HealthCheck = require("../controllers/HealthCheck.js");

const router = express.Router();

router.get("/HealthCheckRoute", HealthCheck);

module.exports = router;
