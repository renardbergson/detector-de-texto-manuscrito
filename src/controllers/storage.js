const fs = require('fs-extra');
const multer = require("multer");

// Directory
const directory = "./src/uploads";
!fs.existsSync(directory) ? fs.mkdirSync(directory) : null;

// Storage
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, directory);
  },
  filename: (req, file, callback) => {
    callback(null, `${Date.now()}-${file.originalname}`);
  }
})

// Upload
const upload = multer({storage});

module.exports = {
  directory,
  upload
};