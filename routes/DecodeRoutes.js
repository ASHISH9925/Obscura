const express = require("express");
const multer = require("multer");
const router = express.Router();

const { processFile } = require("../controllers/Decode.js");

const upload = multer({ storage: multer.memoryStorage() });

router.post("/decode", upload.single("file"), processFile);

module.exports = router;
