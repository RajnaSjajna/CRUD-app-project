const express = require('express');
const router = express.Router();

// Sign-up
router.get('/sign-up', (req, res) => {
  res.render('auth/sign-up');
});

// Sign-in
router.get('/sign-in', (req, res) => {
  res.render('auth/sign-in');
});

module.exports = router;
