const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const https = require("https");

const app = express();
const port = 5600;

// Set up multer for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // The 'uploads' directory will be created in your project root
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Use the current timestamp as the filename
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `${timestamp}${ext}`;
    cb(null, filename);
  },
});

// File filter to allow only image file types and check for double extension
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
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Serve static files from the 'public' directory
app.use(express.static("public"));

// Handle GET requests to the root URL
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Handle POST requests to '/uploadImage/:city'
app.post("/uploadImage/:city", (req, res) => {
  const city = req.params.city;
  const successMessage = `File uploaded successfully to ${city} folder.`;
  const errorMessage = "Error uploading file.";

  // Check if the folder for the city exists, if not, create it
  const cityFolderPath = path.join(__dirname, "uploads", city);
  if (!fs.existsSync(cityFolderPath)) {
    fs.mkdirSync(cityFolderPath);
  }

  // Use try-catch to handle errors
  try {
    upload.single("image")(req, res, (err) => {
      if (err) {
        console.error("Error uploading file:", err.message);
        return res.status(400).json({ message: err.message });
      }

      // Move the uploaded file to the city folder
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

// Load SSL certificate and private key
const privateKeyPath = "./private-key.pem";
const certificatePath = "./certificate.pem";
const privateKey = fs.readFileSync(privateKeyPath, "utf8");
const certificate = fs.readFileSync(certificatePath, "utf8");
const credentials = { key: privateKey, cert: certificate };

// Start the server over HTTPS
const httpsServer = https.createServer(credentials, app);
httpsServer.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
