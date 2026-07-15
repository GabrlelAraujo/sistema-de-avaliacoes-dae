const express = require('express');
const db = require('../database/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Perguntas fixas por enquanto (fácil de expandir depois)
const QUESTIONS = [
  { id: 'question1', section: 1, text: 'Como foi seu atendimento?' },
  { id: 'question2', section: 2, text: 'Como foi seu atendimento?' }
];

// GET /api/evaluations/questions
router.get('/questions', requireAuth, (req, res) => {
  res.json({ questions: QUESTIONS });
});

// POST /api/evaluations
router.post('/', requireAuth, (req, res) => {
  const { question1, question2 } = req.body;
  const attendantId = req.session.user.id;

  const r1 = Number(question1);
  const r2 = Number(question2);

  if (![1, 2, 3, 4, 5].includes(r1) || ![1, 2, 3, 4, 5].includes(r2)) {
    return res.status(400).json({ error: 'As avaliações devem ser entre 1 e 5 estrelas' });
  }

  db.prepare(`
    INSERT INTO evaluations (attendant_id, question1_rating, question2_rating)
    VALUES (?, ?, ?)
  `).run(attendantId, r1, r2);

  res.json({ success: true });
});

module.exports = router;
