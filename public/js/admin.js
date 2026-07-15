const summaryBody = document.getElementById('summaryBody');
const summaryEmpty = document.getElementById('summaryEmpty');
const allBody = document.getElementById('allBody');
const allEmpty = document.getElementById('allEmpty');

function badgeFor(value) {
  if (value === null || value === undefined) return '<span class="badge badge-mid">—</span>';
  const v = Number(value);
  if (v >= 4) return `<span class="badge badge-good">${v.toFixed(2)}</span>`;
  if (v >= 2.5) return `<span class="badge badge-mid">${v.toFixed(2)}</span>`;
  return `<span class="badge badge-low">${v.toFixed(2)}</span>`;
}

async function checkAdmin() {
  const res = await fetch('/api/auth/me');
  if (!res.ok) {
    window.location.href = '/login.html';
    return false;
  }
  const data = await res.json();
  if (data.user.role !== 'admin') {
    window.location.href = '/home.html';
    return false;
  }
  return true;
}

async function loadSummary() {
  const res = await fetch('/api/admin/summary');
  const data = await res.json();

  summaryBody.innerHTML = '';
  if (!data.summary.length) {
    summaryEmpty.style.display = 'block';
    return;
  }
  summaryEmpty.style.display = 'none';

  data.summary.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.name}</td>
      <td>${row.total_avaliacoes}</td>
      <td>${badgeFor(row.media_pergunta1)}</td>
      <td>${badgeFor(row.media_pergunta2)}</td>
      <td>${badgeFor(row.media_geral)}</td>
    `;
    summaryBody.appendChild(tr);
  });
}

async function loadAll() {
  const res = await fetch('/api/admin/evaluations');
  const data = await res.json();

  allBody.innerHTML = '';
  if (!data.evaluations.length) {
    allEmpty.style.display = 'block';
    return;
  }
  allEmpty.style.display = 'none';

  data.evaluations.forEach(ev => {
    const tr = document.createElement('tr');
    const date = new Date(ev.created_at).toLocaleString('pt-BR');
    tr.innerHTML = `
      <td>${ev.attendant_name}</td>
      <td>${'★'.repeat(ev.question1_rating)}${'☆'.repeat(5 - ev.question1_rating)}</td>
      <td>${'★'.repeat(ev.question2_rating)}${'☆'.repeat(5 - ev.question2_rating)}</td>
      <td>${date}</td>
    `;
    allBody.appendChild(tr);
  });
}

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
  });
});

document.getElementById('backBtn').addEventListener('click', () => {
  window.location.href = '/home.html';
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/login.html';
});

(async () => {
  const ok = await checkAdmin();
  if (ok) {
    loadSummary();
    loadAll();
  }
})();
