const express = require('express');
const db = require('../database/db');
const { requireAdmin, requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/attendants -> lista simples (usada também na troca de usuário)
router.get('/attendants', requireAuth, (req, res) => {
  const attendants = db.prepare(`
    SELECT id, name, username FROM users WHERE role = 'attendant' ORDER BY name
  `).all();
  res.json({ attendants });
});

// GET /api/admin/summary -> médias por atendente
router.get('/summary', requireAdmin, (req, res) => {
  const summary = db.prepare(`
    SELECT
      u.id,
      u.name,
      COUNT(e.id) AS total_avaliacoes,
      ROUND(AVG(e.question1_rating), 2) AS media_pergunta1,
      ROUND(AVG(e.question2_rating), 2) AS media_pergunta2,
      ROUND(AVG((e.question1_rating + e.question2_rating) / 2.0), 2) AS media_geral
    FROM users u
    LEFT JOIN evaluations e ON e.attendant_id = u.id
    WHERE u.role = 'attendant'
    GROUP BY u.id
    ORDER BY u.name
  `).all();
  res.json({ summary });
});


//GET /api/admin/attendant/:id -> lista de avaliações por atendente
router.get('/attendant/:id', requireAdmin, (req, res) => {
  const { id } = req.params

    const stmt = db.prepare(`
        SELECT
            e.id,
            u.name AS attendant_name,
            e.question1_rating,
            e.question2_rating,
            e.created_at
        FROM evaluations e
        JOIN users u ON u.id = e.attendant_id
        WHERE e.attendant_id = ?
        ORDER BY e.created_at DESC
    `).all(id);


    res.json({
      evaluations : stmt
    })

})

module.exports = router;