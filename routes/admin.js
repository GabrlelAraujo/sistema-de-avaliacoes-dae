const express = require('express');
const db = require('../database/db');
const bcrypt = require('bcryptjs')
const { requireAdmin, requireAuth } = require('../middleware/auth');

const SALT_ROUNDS = 10

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

// POST /api/admin/attendants -> cadastra um novo atendente
router.post('/attendants', requireAdmin, (req, res) => {

    const { name, username, password } = req.body;

    const usernameFormatado = username.trim().toLowerCase();

    // Verifica se todos os campos foram preenchidos
    if (!name || !username || !password) {
        return res.status(400).json({
            error: 'Preencha todos os campos.'
        });
    }

    // Verifica se o username já existe
    const exists = db.prepare(`
        SELECT id
        FROM users
        WHERE username = ?
    `).get(usernameFormatado);

    if (exists) {
        return res.status(400).json({
            error: 'Esse usuário já existe.'
        });
    }


    const hash = bcrypt.hashSync(password, SALT_ROUNDS);

    // Insere o novo atendente
    db.prepare(`
        INSERT INTO users
        (
            name,
            username,
            password,
            role
        )
        VALUES
        (?, ?, ?, 'attendant')
    `).run(name, usernameFormatado, hash);

    res.json({
        success: true
    });

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

router.delete('/attendants/:id', requireAdmin, (req, res) => {

    const { id } = req.params;

    // Exclui todas as avaliações do atendente
    db.prepare(`
        DELETE FROM evaluations
        WHERE attendant_id = ?
    `).run(id);

    // Agora exclui o usuário
    const result = db.prepare(`
        DELETE FROM users
        WHERE id = ?
    `).run(id);

    if (result.changes === 0) {
        return res.status(404).json({
            error: 'Usuário não encontrado.'
        });
    }

    res.json({
        success: true
    });

});



module.exports = router;