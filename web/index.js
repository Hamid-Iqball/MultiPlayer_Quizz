import express from 'express';
import pool from './db.js';
import dotenv from 'dotenv';
import { questionsImport } from './lib/questionsImport.js';
import { questionCount } from './libShared/quizdb.js';



dotenv.config()



const app = express();
const PORT = 3000;

app.set("view engine", "ejs")
app.set("views", "./view")
app.use(express.json());

app.use(express.urlencoded({extended:true}))



app.use("/static",express.static('static'));


app.get('/', async (req, res) => {
  try {
    // Check if import was requested
    let imported = null;
    if (req.query.import !== undefined) {
      imported = await questionsImport();
    }

    // Get current question count from database
    const questions = await questionCount();
    const questionsMax = parseInt(process.env.QUIZ_QUESTIONS_MAX, 10) || 50;

    res.render('home', {
      title: 'Multiplayer Quiz',
      questions,
      questionsMax,
      imported
    });
  } catch (err) {
    console.error('Home page error:', err);
    res.status(500).render('error', { title: 'Error', error: err.message });
  }
});


app.post('/newgame/', (req, res) => {
  const name = (req.body && req.body.name) || 'Player';
  const slug = Math.random().toString(36).slice(2, 8).toUpperCase();
  res.redirect(`/game/${slug}?player=${encodeURIComponent(name)}`);
});


app.post('/joingame/', (req, res) => {
  const name = (req.body && req.body.name) || 'Player';
  const slug = (req.body && req.body.slug) || 'ABC123';
  res.redirect(`/game/${slug}?player=${encodeURIComponent(name)}`);
});


app.get('/game/:slug', (req, res) => {
  const domain = `${req.protocol}://${req.get('host')}`;
  const playerName = (req.query && req.query.player) ? String(req.query.player) : 'Player';

  res.render('game', {
    title: `Quiz Game - ${req.params.slug}`,
    slug: req.params.slug,
    domain,
    wsDomain: `ws://${req.get('host')}`,
    playerName,
    game: {
      id: 1,
      questions_asked: 10
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
