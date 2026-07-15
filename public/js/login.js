const form = document.getElementById('loginForm');
const errorMsg = document.getElementById('errorMsg');

// Se já estiver logado, vai direto para a home
fetch('/api/auth/me')
  .then(r => r.ok ? window.location.href = '/home.html' : null)
  .catch(() => {});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorMsg.style.display = 'none';

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (!res.ok) {
      errorMsg.textContent = data.error || 'Erro ao entrar';
      errorMsg.style.display = 'block';
      return;
    }

    window.location.href = '/home.html';
  } catch (err) {
    errorMsg.textContent = 'Erro de conexão com o servidor';
    errorMsg.style.display = 'block';
  }
});
