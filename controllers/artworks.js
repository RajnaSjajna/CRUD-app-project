const express = require('express');
const router = express.Router();
const isSignedIn = require('../middleware/is-signed-in');
const { Artwork } = require('../models/artwork');

const multer = require('multer');
const path = require('path');

// Podesi destinaciju i ime fajla
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });





// Svi radovi
router.get('/', (req, res) => {
  res.render('artworks/index', { artworks: Artwork.all() });
});

// Novi rad - forma
router.get('/new', isSignedIn, (req, res) => {
  res.render('artworks/new');
});

// Kreiranje rada
router.post('/', isSignedIn, upload.single('image'), (req, res) => {
  const { title, artist } = req.body;
  const imagePath = req.file ? '/images/uploads/' + req.file.filename : null;

  Artwork.create(title, artist, req.session.user.id, imagePath);
  res.redirect('/artworks');
});


// Prikaz jednog rada
router.get('/:id', (req, res) => {
  const artwork = Artwork.findById(req.params.id);
  if (!artwork) return res.send('Artwork not found');
  res.render('artworks/show', { artwork });
});




// Edit forma
router.get('/:id/edit', isSignedIn, (req, res) => {
  const artwork = Artwork.findById(req.params.id);
  if (!artwork) return res.send('Artwork not found');
  if (artwork.ownerId !== req.session.user.id) return res.send('Not authorized');
  res.render('artworks/edit', { artwork });
});




// Ažuriranje rada
router.put('/:id', isSignedIn, (req, res) => {
  const { title, artist } = req.body;
  const artwork = Artwork.findById(req.params.id);
  if (!artwork) return res.send('Artwork not found');
  if (artwork.ownerId !== req.session.user.id) return res.send('Not authorized');
  Artwork.update(req.params.id, title, artist);
  res.redirect('/artworks/' + req.params.id);
});

// Brisanje rada
router.delete('/:id', isSignedIn, (req, res) => {
  const artwork = Artwork.findById(req.params.id);
  if (!artwork) return res.send('Artwork not found');
  if (artwork.ownerId !== req.session.user.id) return res.send('Not authorized');
  Artwork.delete(req.params.id);
  res.redirect('/artworks');
});

module.exports = router;
