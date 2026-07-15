const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.join(__dirname, 'avaliacoes.db');
const db = new DatabaseSync(dbPath);

db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

// Tabela de usuários (admin + atendentes)
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'attendant')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Tabela de avaliações
db.exec(`
  CREATE TABLE IF NOT EXISTS evaluations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    attendant_id INTEGER NOT NULL,
    question1_rating INTEGER NOT NULL CHECK(question1_rating BETWEEN 1 AND 5),
    question2_rating INTEGER NOT NULL CHECK(question2_rating BETWEEN 1 AND 5),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (attendant_id) REFERENCES users(id)
  )
`);

module.exports = db;
