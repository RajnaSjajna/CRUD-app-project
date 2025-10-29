import express from "express";
import User from "../models/user.js"; 
import bcrypt from "bcryptjs";         
import path from "path";
import multer from "multer";
import Artwork from "../models/artwork.js";
import isSignedIn from "../middleware/is-signed-in.js";

const router = express.Router();

// =======================
// GET /auth/sign-in
// Forma za login
// =======================
router.get("/sign-in", (req, res) => {
  res.render("auth/sign-in"); 
});

// =======================
// POST /auth/sign-in
// Obrada login forme
// =======================
router.post("/sign-in", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(400).send("Neispravni podaci");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send("Neispravni podaci");

    req.session.userId = user._id;
    req.session.user = {
      username: user.username,
      name: user.name,
    };

    res.redirect("/artworks");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Multer storage za upload slika
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// =======================
// GET /artworks
// Svi radovi
// =======================
router.get("/", async (req, res) => {
  try {
    const artworks = await Artwork.find().sort({ createdAt: -1 });
    const artists = await Artwork.distinct("artist");

    res.render("artworks/index", {
      user: req.session.user,
      artworks,
      artists,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// =======================
// GET /artworks/artist/:artist
// Prikaz radova jednog umjetnika
// =======================
router.get("/artist/:artist", async (req, res) => {
  try {
    const artworks = await Artwork.find({ artist: req.params.artist }).sort({ createdAt: -1 });
    if (!artworks.length) return res.status(404).send("Nema radova ovog umjetnika");

    res.render("artworks/artist", {
      user: req.session.user,
      artist: req.params.artist,
      artworks,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// =======================
// GET /artworks/new
// Forma za novi rad
// =======================
router.get("/new", isSignedIn, (req, res) => {
  res.render("artworks/new", { user: req.session.user });
});

// =======================
// POST /artworks
// Kreiranje novog rada
// =======================
router.post("/", isSignedIn, upload.single("image"), async (req, res) => {
  try {
    const { title, artist, description } = req.body;
    const imagePath = req.file ? "/images/uploads/" + req.file.filename : undefined;

    const artwork = new Artwork({
      title,
      artist,
      description,
      imagePath,
      ownerId: req.session.userId,
    });

    await artwork.save();
    res.redirect("/artworks");
  } catch (err) {
    console.error(err);
    res.status(500).send("Neuspelo kreiranje crteža");
  }
});

// =======================
// GET /artworks/:id
// Prikaz jednog rada (samo vlasnik)
// =======================
router.get("/:id", isSignedIn, async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) return res.status(404).send("Artwork not found");
    if (!artwork.ownerId.equals(req.session.userId)) return res.status(403).send("Not authorized");

    res.render("artworks/show", { artwork, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// =======================
// GET /artworks/:id/edit
// Forma za edit (samo vlasnik)
// =======================
router.get("/:id/edit", isSignedIn, async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) return res.status(404).send("Artwork not found");
    if (!artwork.ownerId.equals(req.session.userId)) return res.status(403).send("Not authorized");

    res.render("artworks/edit", { artwork, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// =======================
// PUT /artworks/:id
// Update rada (samo vlasnik)
// =======================
router.put("/:id", isSignedIn, upload.single("image"), async (req, res) => {
  try {
    const { title, artist, description } = req.body;
    const imagePath = req.file ? "/images/uploads/" + req.file.filename : undefined;

    const updateData = { title, artist, description };
    if (imagePath) updateData.imagePath = imagePath;

    const artwork = await Artwork.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.session.userId },
      updateData,
      { new: true }
    );

    if (!artwork) return res.status(404).send("Artwork not found");

    res.redirect("/artworks/" + req.params.id);
  } catch (err) {
    console.error(err);
    res.status(500).send("Neuspješan update crteža");
  }
});

// =======================
// DELETE /artworks/:id
// Brisanje rada (samo vlasnik)
// =======================
router.delete("/:id", isSignedIn, async (req, res) => {
  try {
    const artwork = await Artwork.findOneAndDelete({ _id: req.params.id, ownerId: req.session.userId });
    if (!artwork) return res.status(404).send("Artwork not found");

    res.redirect("/artworks");
  } catch (err) {
    console.error(err);
    res.status(500).send("Neuspješno brisanje crteža");
  }
});

export default router;
