const express = require("express");
const {retrieveSingleTextFile} = require("../controllers/FileHandlers");

const router = express.Router();

router.get("/api/file/:id", retrieveSingleTextFile);

module.exports = router;