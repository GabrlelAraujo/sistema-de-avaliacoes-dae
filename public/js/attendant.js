const attendantName = document.getElementById('attendantName');

const totalEvaluations = document.getElementById('totalEvaluations');
const avgQuestion1 = document.getElementById('avgQuestion1');
const avgQuestion2 = document.getElementById('avgQuestion2');
const avgGeneral = document.getElementById('avgGeneral');

const evaluationsBody = document.getElementById('evaluationsBody');
const emptyState = document.getElementById('emptyState');

const id = new URLSearchParams(window.location.search).get('id');

function stars(value) {
    return '★'.repeat(value) + '☆'.repeat(5 - value);
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

async function loadAttendant() {

    try {

        const res = await fetch(`/api/admin/attendant/${id}`);

        const data = await res.json();

        evaluationsBody.innerHTML = '';

        if (!data.evaluations.length) {

            emptyState.style.display = 'block';

            attendantName.textContent = 'Atendente';

            totalEvaluations.textContent = '0';
            avgQuestion1.textContent = '-';
            avgQuestion2.textContent = '-';
            avgGeneral.textContent = '-';

            return;
        }

        emptyState.style.display = 'none';

        attendantName.textContent = data.evaluations[0].attendant_name;

        totalEvaluations.textContent = data.evaluations.length;

        let totalQ1 = 0;
        let totalQ2 = 0;

        data.evaluations.forEach(ev => {

            totalQ1 += ev.question1_rating;
            totalQ2 += ev.question2_rating;

            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td>${new Date(ev.created_at).toLocaleString('pt-BR')}</td>
                <td class="stars">${stars(ev.question1_rating)}</td>
                <td class="stars">${stars(ev.question2_rating)}</td>
            `;

            evaluationsBody.appendChild(tr);

        });

        const mediaQ1 = totalQ1 / data.evaluations.length;
        const mediaQ2 = totalQ2 / data.evaluations.length;
        const mediaGeral = (mediaQ1 + mediaQ2) / 2;

        avgQuestion1.textContent = mediaQ1.toFixed(2);
        avgQuestion2.textContent = mediaQ2.toFixed(2);
        avgGeneral.textContent = mediaGeral.toFixed(2);

    } catch (err) {

        console.error(err);

        emptyState.style.display = 'block';
        emptyState.textContent = 'Erro ao carregar as avaliações.';

    }

}

document.getElementById('backBtn').addEventListener('click', () => {
    window.location.href = '/admin.html';
});

(async () => {

    const ok = await checkAdmin();

    if (ok) {
        await loadAttendant();
    }

})();