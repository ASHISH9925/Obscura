const express = require("express");
const HealthCheck = require("../controllers/HealthCheck.js");

const router = express.Router();

router.get("/api/HealthCheckRoute", HealthCheck);

module.exports = router;
