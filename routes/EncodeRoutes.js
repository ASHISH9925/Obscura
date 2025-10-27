const express = require("express");
const multer = require("multer");
const router = express.Router();

const processFile = require("../controllers/Encode.js");

const upload = multer({ storage: multer.memoryStorage() });

router.post("/encode", upload.single("file"), processFile);

module.exports = router;
