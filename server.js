require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');

const app = express();

// Import routes
const artworkRoutes = require('./controllers/artworks');
const authRoutes = require('./controllers/auth');

// Middleware-// omogućava public folder za slike i CSS
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


app.use(express.static('public'));

app.use(session({ secret: 'fineart-secret', resave: false, saveUninitialized: false }));

// Set view engine-// postavi view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Pass user to views (middleware example)
const passUserToView = require('./middleware/pass-user-to-view');
app.use(passUserToView);

// Routes
app.use('/artworks', artworkRoutes);
app.use('/auth', authRoutes);



// ruta za početnu stranicu
app.get('/', (req, res) => {
  res.render('index');
});






const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
