const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

// Set up multer for handling file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const city = req.params.city || 'Unknown';
        const folderPath = path.join(__dirname, 'uploads', city);

        if (!fs.existsSync(folderPath)) {
            fs
