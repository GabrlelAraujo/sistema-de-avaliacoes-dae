const bcrypt = require('bcryptjs');
const db = require('./db');

const SALT_ROUNDS = 10;

function upsertUser(name, username, plainPassword, role) {
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  const hash = bcrypt.hashSync(plainPassword, SALT_ROUNDS);

  if (existing) {
    db.prepare('UPDATE users SET name = ?, password = ?, role = ? WHERE username = ?')
      .run(name, hash, role, username);
    console.log(`Atualizado: ${username}`);
  } else {
    db.prepare('INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)')
      .run(name, username, hash, role);
    console.log(`Criado: ${username} (senha: ${plainPassword})`);
  }
}

console.log('Populando banco de dados...\n');

// Admin
upsertUser('Administrador', 'admin', 'admin123', 'admin');

// criar atendentes
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(texto) {
  return new Promise(resolve => {
    rl.question(texto, resolve);
  });
}

// funcão de listar usuarios do db
function listarUsuarios() {
  const usuarios = db.prepare(`
    SELECT id, name, username, role
    FROM users
    WHERE role = 'attendant'
    ORDER BY id
  `).all();

  if (usuarios.length === 0) {
    console.log('\nNenhum usuário cadastrado.\n');
    return [];
  }

  console.log('\n===== USUÁRIOS CADASTRADOS =====');

  usuarios.forEach(user => {
    console.log(
      `${user.id} - ${user.name} | Usuário: ${user.username} | Cargo: ${user.role}`
    );
  });

  console.log();

  return usuarios;
}



async function seed() {
  while (true) {
    console.log('\n===== MENU =====');
    console.log('1 - Cadastrar atendente');
    console.log('2 - Excluir atendente');
    console.log('3 - Sair');

    const opcao = await question('Escolha uma opção: ');

    switch (opcao) {
      case '1':
        const nome = await question('Nome: ');
        const usuario = await question('Usuário: ');
        const senha = await question('Senha: ');

        upsertUser(nome, usuario, senha, 'attendant');

        console.log('Atendente criado!\n');
        break;

      case '2':
        listarUsuarios();

          const id = await question('Digite o ID do usuário que deseja excluir: ');
          const result = db.prepare('DELETE FROM users WHERE id = ?').run(id);

          if (result.changes > 0) {
            console.log('Usuário excluído com sucesso!\n');
              } else {
                console.log('Usuário não encontrado.\n');
                }
        break;

      case '3':
        rl.close();
        return;

      default:
        console.log('Opção inválida!');
    }
  }
}

(async () => {
  await seed();

  console.log('\nBanco populado com sucesso!');
  console.log('Login do admin -> usuário: admin | senha: admin123');
})();
