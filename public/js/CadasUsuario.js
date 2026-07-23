const usersBody = document.getElementById('usersBody');
const emptyUsers = document.getElementById('emptyUsers');

// checa se é admin
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

// carrega os usuarios
async function loadUsers() {

    try {
        const res = await fetch ("/api/admin/attendants");
        const data = await res.json();

        usersBody.innerHTML = '';
        
        if (!data.attendants.length) {

            emptyUsers.style.display = 'block';
            return;
        }
        emptyUsers.style.display = 'none';

        data.attendants.forEach(user => {

            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td>${user.name}</td>
                <td>${user.username}</td>
                <td>
                    <button class="delete-btn" data-id="${user.id}">
                        Excluir
                    </button>
                </td>
            `;

            usersBody.appendChild(tr);

        });

        document.querySelectorAll('.delete-btn').forEach(btn => {

        btn.addEventListener('click', () => {

        deleteUser(btn.dataset.id);

    });

});

    }  catch (err) {
        emptyUsers.style.display = 'block';
        emptyUsers.textContent = 'Erro ao carregar os usuários.';
    }
}

// deleta usuario
async function deleteUser(id) {

    const confirmar = confirm(
        'Tem certeza que deseja excluir este atendente?\n\nTodas as avaliações dele também serão apagadas.'
    );

    if (!confirmar) return;

    try {

        const res = await fetch(`/api/admin/attendants/${id}`, {

            method: 'DELETE'

        });

        const data = await res.json();

        if (!res.ok) {

            alert(data.error);
            return;

        }

        alert('Atendente excluído com sucesso.');

        loadUsers();

    } catch (err) {

        alert('Erro ao excluir o atendente.');

    }

}

// criar usuario
async function saveUser() {

        const name = document.getElementById('name').value.trim();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

    if (!name || !username || !password) {
        alert('Preencha todos os campos.');
        return;
    }

    try {
        const res = await fetch ("/api/admin/attendants", {
            
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name,
                username,
                password
            })
        })

        const data = await res.json()

     if (!res.ok) {

        alert(data.error);
        return;

        }

         alert('Atendente Cadastrado com sucesso.');

        // Limpa os campos
        document.getElementById('name').value = '';
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';

        // Atualiza a tabela
        await loadUsers();

    } catch (err) {
        alert("erro ao cadastrar atendente")
    }
  
}



document.getElementById('saveBtn').addEventListener('click', () => {

    saveUser();

});



document.getElementById('backBtn').addEventListener('click', () => {
    window.location.href = '/admin.html';
});

(async () => {

    const ok = await checkAdmin();

    if (ok) {
        await loadUsers();
    }

})();