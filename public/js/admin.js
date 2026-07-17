const summaryBody = document.getElementById('summaryBody');
const summaryEmpty = document.getElementById('summaryEmpty');


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
  try {

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
        <td>
          <button class="details-btn" data-id="${row.id}">
            Ver
          </button>
        </td>
      `;

      summaryBody.appendChild(tr);
    });

    document.querySelectorAll('.details-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        window.location.href = `/attendant.html?id=${btn.dataset.id}`;
      });
    });

  } catch (err) {
    summaryEmpty.style.display = 'block';
    summaryEmpty.textContent = 'Erro ao carregar os dados.';
  }
}





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
    await loadSummary();
  }
})();