const btnTema = document.getElementById('btn-tema');
const body = document.body;

// 1. Verifica se o usuário já havia escolhido o modo escuro antes
const temaSalvo = localStorage.getItem('tema');

if (temaSalvo === 'escuro') {
    body.classList.add('dark-mode');
    btnTema.innerText = '☀️ Claro';
}

// 2. Alterna os modos ao clicar no botão
btnTema.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('tema', 'escuro'); // Salva a preferência
        btnTema.innerText = '☀️ Claro';
    } else {
        localStorage.setItem('tema', 'claro');
        btnTema.innerText = '🌙 Escuro';
    }
});