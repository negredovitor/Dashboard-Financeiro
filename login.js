const formLogin = document.getElementById('form-login');
const inputUsuario = document.getElementById('usuario');
const inputSenha = document.getElementById('senha');
const mensagemErro = document.getElementById('mensagem-erro');

formLogin.addEventListener('submit', (e) => {
    e.preventDefault(); // Impede o recarregamento padrão do formulário

    const usuario = inputUsuario.value;
    const senha = inputSenha.value;

    if (usuario === 'admin' && senha === '123') {
        window.location.href = 'index.html';
    } else {
        // Exibe o erro estilizado
        mensagemErro.style.display = 'block';
        inputSenha.value = ''; 
        inputSenha.focus(); 
        
        // Oculta a mensagem de erro automaticamente após 3 segundos
        setTimeout(() => {
            mensagemErro.style.display = 'none';
        }, 3000);
    }
});