const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const city = req.params.city || 'Unknown';
        const folderPath = path.join(__dirname, 'uploads', city);

        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        cb(null, folderPath);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage });

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/uploadImage/:city', upload.single('image'), (req, res) => {
    res.json({ success: true, message: 'Image uploaded successfully!' });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
