const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const https = require("https");

const app = express();
const port = 5600;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `${timestamp}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|gif/;
  const ext = path.extname(file.originalname).toLowerCase();
  const isAllowed = allowedFileTypes.test(ext);
  const hasDoubleExtension = path.basename(file.originalname).includes(".exe");

  if (isAllowed && !hasDoubleExtension) {
    cb(null, true);
  } else {
    const error = hasDoubleExtension
      ? "Double extensions are not allowed!"
      : "Only image files are allowed!";
    cb(new Error(error));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, 
  },
});

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/uploadImage/:city", (req, res) => {
  const city = req.params.city;
  const successMessage = `File uploaded successfully to ${city} folder.`;
  const errorMessage = "Error uploading file.";

  const cityFolderPath = path.join(__dirname, "uploads", city);
  if (!fs.existsSync(cityFolderPath)) {
    fs.mkdirSync(cityFolderPath);
  }

  try {
    upload.single("image")(req, res, (err) => {
      if (err) {
        console.error("Error uploading file:", err.message);
        return res.status(400).json({ message: err.message });
      }

      if (req.file) {
        const newFilePath = path.join(cityFolderPath, req.file.filename);
        fs.renameSync(req.file.path, newFilePath);
        console.log("File moved to:", newFilePath);
        return res.json({ message: successMessage });
      } else {
        console.error("Error uploading file.");
        return res.status(500).json({ message: errorMessage });
      }
    });
  } catch (err) {
    console.error("Unexpected error:", err.message);
    return res.status(500).json({ message: errorMessage });
  }
});

const privateKeyPath = "./private-key.pem";
const certificatePath = "./certificate.pem";
const privateKey = fs.readFileSync(privateKeyPath, "utf8");
const certificate = fs.readFileSync(certificatePath, "utf8");
const credentials = { key: privateKey, cert: certificate };

const httpsServer = https.createServer(credentials, app);
httpsServer.listen(port, () => {
  console.log(`Server is running on https://localhost:${port}`);
});
