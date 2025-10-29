import express from "express";
import User from "../models/user.js";
import bcrypt from "bcryptjs";



const router = express.Router();

// =======================
// GET /auth/sign-up
// Prikaz forme za registraciju
// =======================
router.get("/sign-up", (req, res) => {
  res.render("auth/sign-up");
});

// =======================
// POST /auth/sign-up
// Obrada registracije
// =======================
router.post("/sign-up", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Provjeri da li korisnik već postoji
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      return res.send("Korisnik sa tim username-om ili email-om već postoji.");
    }



    // Hash lozinke
const hashedPassword = await bcrypt.hash(password, 10);



    // Kreiraj korisnika
    const newUser = new User({
      username,
      email,
      password,
    });

    await newUser.save();

    // Automatski login nakon registracije
    req.session.userId = newUser._id;
    req.session.user = {
      username: newUser.username,
      email: newUser.email,
    };

    res.redirect("/artworks");
  } catch (err) {
    console.error(err);
    res.status(500).send("Greška pri registraciji");
  }
});

// =======================
// GET /auth/sign-in
// Prikaz forme za login
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

    // Pronađi korisnika po username-u
    const user = await User.findOne({ username });
    if (!user) return res.send("Username or password is incorrect!");

    // Provjeri lozinku
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.send("Neispravan username ili password");

    // Spremi u session
    req.session.userId = user._id;
    req.session.user = {
      username: user.username,
      _id: user._id,
      email: user.email
      
    };

    res.redirect("/artworks");
  } catch (err) {
    console.error(err);
    res.status(500).send("Greška pri login-u");
  }
});

// =======================
// POST /auth/sign-out
// Odjava korisnika
// =======================
router.post("/sign-out", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Greška pri odjavi");
    }
    res.redirect("/");
  });
});

export default router;
