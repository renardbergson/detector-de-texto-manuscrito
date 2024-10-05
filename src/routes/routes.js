const express = require("express");
const router = express.Router();
const storage = require("../controllers/storage"); 

const home = require("../controllers/home");
const fileUpload = require("../controllers/fileUpload");
const textFormat = require("../controllers/textFormat");
const textCorrection = require("../controllers/textCorrection");

// home
router.get("/", home);

// file upload
router.post("/file-upload", storage.upload.single("file"), fileUpload);

// text-format (json data)
router.post("/text-format", express.json(), textFormat);

// text-correction (json data)
router.post("/text-correction", express.json(), textCorrection);

// 404 (not found)
router.use((req, res) => {
  res.status(404).json({ message: "Ops, endpoint não encontrado!" });
}) 

module.exports = router;