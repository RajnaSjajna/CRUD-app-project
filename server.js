import mongoose from "mongoose";
import 'dotenv/config';
import express from 'express';
import path from 'path';
import session from 'express-session';
import artworksRouter from './controllers/artworks.js';
import authRouter from './controllers/auth.js';
import passUserToView from './middleware/pass-user-to-view.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// __dirname u ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'fineart-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on("connected", () => {
  console.log(`Connected on MongoDB: ${mongoose.connection.name}`);
});


// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Pass user to views
app.use(passUserToView);

// Routes
app.use('/artworks', artworksRouter);
app.use('/auth', authRouter);

// Home route
app.get('/', (req, res) => {
  res.render('index');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
