// tema.js - Alternância de tema claro/escuro (persistente)
document.addEventListener('DOMContentLoaded', () => {
    const btnTema = document.getElementById('btn-tema');
    if (!btnTema) return;

    const body = document.body;
    const temaSalvo = localStorage.getItem('tema');

    if (temaSalvo === 'escuro') {
        body.classList.add('dark-mode');
        btnTema.innerText = '☀️ Claro';
    }

    btnTema.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const escuro = body.classList.contains('dark-mode');
        localStorage.setItem('tema', escuro ? 'escuro' : 'claro');
        btnTema.innerText = escuro ? '☀️ Claro' : '🌙 Escuro';

        // Atualiza a cor da legenda do gráfico, se ele existir
        if (window.meuGrafico) {
            const cor = escuro ? '#f8fafc' : '#1e293b';
            window.meuGrafico.options.plugins.legend.labels.color = cor;
            window.meuGrafico.update();
        }
    });
});