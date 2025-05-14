const express = require("express");
const multer = require("multer");
const chokidar = require("chokidar");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3003;

const UPLOAD_DIR = path.join(__dirname, "uploads");
const LAST_IMAGES_COUNT = 2;
const POLLING_TIMER = 1000; // 1 second

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// Storage config for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// Serve frontend
app.use(express.static("public"));
app.use("/uploads", express.static(UPLOAD_DIR));

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/upload", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "upload.html"));
});

app.post("/post", upload.single("image"), (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Uploaded successfully",
    filename: req.file ? req.file.filename : null,
  });
});

// Get last 3 or random images
app.get("/images", (req, res) => {
  fs.readdir(UPLOAD_DIR, (err, files) => {
    if (err) return res.status(500).send("Error reading folder");

    const images = files
      .filter((f) => f.match(/\.(jpg|jpeg|png|gif)$/i))
      .map((f) => ({
        file: f,
        time: fs.statSync(path.join(UPLOAD_DIR, f)).mtime,
      }))
      .sort((a, b) => b.time - a.time);

    if (req.query.mode === "slideshow") {
      // Return random images for slideshow mode using Fisher-Yates shuffle algorithm
      const shuffled = [...images]; // Create a copy to avoid modifying the original array
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap elements
      }
      return res.json(shuffled.slice(0, LAST_IMAGES_COUNT));
    }

    // Check if there are new images compared to the last request
    const latestImages = images.slice(0, LAST_IMAGES_COUNT);
    // Always return the latest images, even if there are no new ones
    return res.json(latestImages);
  });
});
// Serve static files (like CSS) from the current directory or a designated folder
app.use(express.static(path.join(__dirname, "./"))); // Adjust the path if your CSS is in a subfolder

// Watcher (optional logging)
chokidar.watch(UPLOAD_DIR).on("add", (filepath) => {
  console.log("New image added:", path.basename(filepath));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
