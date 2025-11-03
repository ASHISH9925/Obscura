const express = require("express");
const { getFileTypeStats } = require("../controllers/GraphController.js");

const router = express.Router();

router.get("/graph", getFileTypeStats);

module.exports = router;
