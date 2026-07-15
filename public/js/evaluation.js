const questionsContainer = document.getElementById('questionsContainer');
const errorMsg = document.getElementById('errorMsg');
const successMsg = document.getElementById('successMsg');
const submitBtn = document.getElementById('submitBtn');

const ratings = {}; // { question1: n, question2: n }

function renderStars(questionId) {
  const wrapper = document.createElement('div');
  wrapper.className = 'stars';
  wrapper.dataset.question = questionId;

  for (let i = 1; i <= 5; i++) {
    const star = document.createElement('span');
    star.className = 'star';
    star.textContent = '★';
    star.dataset.value = i;
    star.addEventListener('click', () => {
      ratings[questionId] = i;
      updateStars(wrapper, i);
    });
    wrapper.appendChild(star);
  }
  return wrapper;
}

function updateStars(wrapper, value) {
  const stars = wrapper.querySelectorAll('.star');
  stars.forEach(s => {
    s.classList.toggle('filled', Number(s.dataset.value) <= value);
  });
}

async function loadQuestions() {
  try {
    const res = await fetch('/api/evaluations/questions');
    if (!res.ok) {
      window.location.href = '/login.html';
      return;
    }
    const data = await res.json();

    data.questions.forEach(q => {
      const block = document.createElement('div');
      block.className = 'question-block';

      const section = document.createElement('div');
      section.className = 'question-section';
      section.textContent = `Seção ${q.section}`;

      const text = document.createElement('div');
      text.className = 'question-text';
      text.textContent = q.text;

      block.appendChild(section);
      block.appendChild(text);
      block.appendChild(renderStars(q.id));

      questionsContainer.appendChild(block);
    });
  } catch (err) {
    errorMsg.textContent = 'Erro ao carregar perguntas';
    errorMsg.style.display = 'block';
  }
}

submitBtn.addEventListener('click', async () => {
  errorMsg.style.display = 'none';
  successMsg.style.display = 'none';

  if (!ratings.question1 || !ratings.question2) {
    errorMsg.textContent = 'Por favor, avalie todas as perguntas antes de enviar.';
    errorMsg.style.display = 'block';
    return;
  }

  submitBtn.disabled = true;

  try {
    const res = await fetch('/api/evaluations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ratings)
    });
    const data = await res.json();

    if (!res.ok) {
      errorMsg.textContent = data.error || 'Erro ao enviar avaliação';
      errorMsg.style.display = 'block';
      submitBtn.disabled = false;
      return;
    }

    successMsg.textContent = 'Avaliação enviada com sucesso! Redirecionando...';
    successMsg.style.display = 'block';

    setTimeout(() => {
      window.location.href = '/home.html';
    }, 1200);
  } catch (err) {
    errorMsg.textContent = 'Erro de conexão com o servidor';
    errorMsg.style.display = 'block';
    submitBtn.disabled = false;
  }
});

document.getElementById('backBtn').addEventListener('click', () => {
  window.location.href = '/home.html';
});

loadQuestions();
