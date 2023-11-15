const express = require('express');
const multer = require('multer');
const path = require('path');
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

const upload = multer({ storage: storage });

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

    // Here you can handle the uploaded file and move it to the appropriate folder based on the city
    // You might want to use the 'fs' module to manage files

    // For now, let's just log the file details
    if (req.file) {
        console.log('File details:', req.file);
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
