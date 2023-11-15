const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

// Set up multer for handling file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // The 'uploads' directory will be created in your project root
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Keep the original file name
        cb(null, file.originalname);
    },
});

// File filter to allow only image file types
const fileFilter = (req, file, cb) => {
    const allowedFileTypes = /jpeg|jpg|png|gif/;
    const ext = path.extname(file.originalname).toLowerCase();
    const isAllowed = allowedFileTypes.test(ext);
    if (isAllowed) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Handle GET requests to the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle POST requests to '/uploadImage/:city'
app.post('/uploadImage/:city', upload.single('image'), (req, res) => {
    const city = req.params.city;
    const successMessage = `File uploaded successfully to ${city} folder.`;
    const errorMessage = 'Error uploading file.';

    // Check if the folder for the city exists, if not, create it
    const cityFolderPath = path.join(__dirname, 'uploads', city);
    if (!fs.existsSync(cityFolderPath)) {
        fs.mkdirSync(cityFolderPath);
    }

    // Move the uploaded file to the city folder
    if (req.file) {
        const newFilePath = path.join(cityFolderPath, req.file.originalname);
        fs.renameSync(req.file.path, newFilePath);
        console.log('File moved to:', newFilePath);
        res.json({ message: successMessage });
    } else {
        console.error('Error uploading file.');
        res.status(500).json({ message: errorMessage });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
