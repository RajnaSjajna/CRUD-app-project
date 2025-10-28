import express from "express";
import User from "../models/user.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// =======================
// GET /auth/sign-up
// Prikaz forme za registraciju
// =======================
router.get("/sign-up", (req, res) => {
  res.render("auth/sign-up.ejs");
});

// =======================
// POST /auth/sign-up
// Obrada registracije
// =======================
router.post("/sign-up", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Provjeri da li korisnik već postoji
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).send("Korisnik već postoji");

    // Kreiraj novog korisnika
    const user = new User({ username, email, password });
    await user.save();

    // Postavi session
    req.session.userId = user._id;
    req.session.user = {
      username: user.username,
      email: user.email,
    };

    res.redirect("/artworks");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// =======================
// GET /auth/sign-in
// Prikaz forme za login
// =======================
router.get("/sign-in", (req, res) => {
  res.render("auth/sign-in.ejs");
});

// =======================
// POST /auth/sign-in
// Obrada logina
// =======================
router.post("/sign-in", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Pronađi korisnika po username-u
    const user = await User.findOne({ username });
    if (!user) return res.status(400).send("Neispravni podaci");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send("Neispravni podaci");

    // Postavi session
    req.session.userId = user._id;
    req.session.user = {
      username: user.username,
      email: user.email,
    };

    res.redirect("/artworks");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// =======================
// POST /auth/sign-out
// Odjava korisnika
// =======================
router.post("/sign-out", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send("Greška pri odjavi");
    res.redirect("/");
  });
});

export default router;
