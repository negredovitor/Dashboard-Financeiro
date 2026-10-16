// Redireciona se já estiver logado
if (localStorage.getItem('token')) {
    window.location.href = 'index.html';
}

const API_URL = window.location.origin;

const formLogin = document.getElementById('form-login');
const formRegister = document.getElementById('form-register');
const feedback = document.getElementById('mensagem-feedback');
const subtitle = document.getElementById('login-subtitle');
const btnLogin = document.getElementById('btn-login-submit');
const btnRegister = document.getElementById('btn-register-submit');

// Toggle entre Login e Registro
document.getElementById('show-register').addEventListener('click', (e) => {
    e.preventDefault();
    formLogin.style.display = 'none';
    formRegister.style.display = 'block';
    subtitle.textContent = 'Crie sua conta para começar';
    hideFeedback();
});

document.getElementById('show-login').addEventListener('click', (e) => {
    e.preventDefault();
    formRegister.style.display = 'none';
    formLogin.style.display = 'block';
    subtitle.textContent = 'Faça login para gerenciar suas finanças';
    hideFeedback();
});

function showFeedback(message, isError = true) {
    feedback.textContent = message;
    feedback.style.display = 'block';
    feedback.className = isError ? 'erro-login' : 'sucesso-login';
    feedback.style.display = 'block';
}

function hideFeedback() {
    feedback.style.display = 'none';
}

// LOGIN
formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-senha').value;

    if (!email || !password) {
        showFeedback('Preencha e-mail e senha.');
        return;
    }

    btnLogin.disabled = true;
    btnLogin.textContent = 'Entrando...';

    try {
        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            showFeedback(data.error || 'Erro ao fazer login.');
            return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('userName', data.user.name);
        localStorage.setItem('userEmail', data.user.email);
        window.location.href = 'index.html';
    } catch (err) {
        showFeedback('Erro de conexão com o servidor.');
    } finally {
        btnLogin.disabled = false;
        btnLogin.textContent = 'Entrar';
    }
});

// REGISTER
formRegister.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-nome').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-senha').value;
    const confirm = document.getElementById('reg-confirmar').value;

    if (!name || !email || !password) {
        showFeedback('Preencha todos os campos.');
        return;
    }

    if (password !== confirm) {
        showFeedback('As senhas não coincidem.');
        return;
    }

    if (password.length < 4) {
        showFeedback('A senha deve ter pelo menos 4 caracteres.');
        return;
    }

    btnRegister.disabled = true;
    btnRegister.textContent = 'Criando...';

    try {
        const res = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            showFeedback(data.error || 'Erro ao criar conta.');
            return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('userName', data.user.name);
        localStorage.setItem('userEmail', data.user.email);
        window.location.href = 'index.html';
    } catch (err) {
        showFeedback('Erro de conexão com o servidor.');
    } finally {
        btnRegister.disabled = false;
        btnRegister.textContent = 'Criar Conta';
    }
});