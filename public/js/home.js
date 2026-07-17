const userNameEl = document.getElementById('userName');
const adminBtn = document.getElementById('adminBtn');
const startBtn = document.getElementById('starBtn')


async function loadUser() {
  try {
    const res = await fetch('/api/auth/me');
    if (!res.ok) {
      window.location.href = '/login.html';
      return;
    }
    const data = await res.json();
    userNameEl.textContent = data.user.name;

    if (data.user.role === 'admin') {
      window.location.href = '/admin.html';
     
    } 
  } catch (err) {
    window.location.href = '/login.html';
  }
}

document.getElementById('startBtn').addEventListener('click', () => {
  window.location.href = '/evaluation.html';
});

document.getElementById('switchBtn').addEventListener('click', async () => {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/login.html';
});

// document.getElementById('adminBtn').addEventListener('click', () => {
  // window.location.href = '/admin.html';
// });

loadUser();
