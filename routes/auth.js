const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database/db');

const router = express.Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username.trim().toLowerCase());

  if (!user) {
    return res.status(401).json({ error: 'Usuário ou senha inválidos' });
  }

  const senhaValida = bcrypt.compareSync(password, user.password);
  if (!senhaValida) {
    return res.status(401).json({ error: 'Usuário ou senha inválidos' });
  }

  req.session.user = {
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role
  };

  res.json({ success: true, user: req.session.user });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  res.json({ user: req.session.user });
});

module.exports = router;
