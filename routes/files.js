const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const authMiddleware = require("../middleware/authMiddleware");
const File = require("../models/File");
const fs = require("fs");

// Storage config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const userFolder = `uploads/${req.user.userId}`;

        if (!fs.existsSync(userFolder)) {
            fs.mkdirSync(userFolder, { recursive: true });
        }

        cb(null, userFolder);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// UPLOAD FILE
router.post("/upload", authMiddleware, upload.single("file"), async (req, res) => {
    try {
        const newFile = new File({
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
            owner: req.user.userId
        });

        await newFile.save();

        res.json({ message: "File uploaded successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET USER FILES
router.get("/", authMiddleware, async (req, res) => {
    const files = await File.find({ owner: req.user.userId });
    res.json(files);
});
// DOWNLOAD FILE
router.get("/download/:id", async (req, res) => {
    try {
        const token = req.query.token;

        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = require("jsonwebtoken").verify(token, process.env.JWT_SECRET);

        const file = await File.findById(req.params.id);

        if (!file || file.owner.toString() !== decoded.userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const filePath = `uploads/${decoded.userId}/${file.filename}`;
        res.download(filePath, file.originalName);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// DELETE FILE
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        if (file.owner.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const filePath = `uploads/${req.user.userId}/${file.filename}`;

        // Delete file from storage
        const fs = require("fs");
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await file.deleteOne();

        res.json({ message: "File deleted successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;
