let meuGrafico; // Armazena a instância do gráfico

const form = document.getElementById('form-transacao');
const displayReceitas = document.getElementById('receitas');
const displayDespesas = document.getElementById('despesas');
const displayBalanco = document.getElementById('balanco');
const listaTransacoes = document.getElementById('lista-transacoes');

const usuarioLogado = 'admin';
const apiUrl = 'http://localhost:3000/transacoes';

const formatarMoeda = (valor) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatarData = (dataStr) => {
    const [ano, mes, dia] = dataStr.split('-');
    return `${dia}/${mes}/${ano}`;
};

// Inicializa a estrutura visual do gráfico
function iniciarGrafico() {
    const ctx = document.getElementById('graficoBalanco').getContext('2d');
    
    meuGrafico = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Receitas', 'Despesas'],
            datasets: [{
                data: [0, 0], 
                backgroundColor: ['#4ade80', '#f87171'],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: document.body.classList.contains('dark-mode') ? '#f8fafc' : '#1e293b'
                    }
                }
            }
        }
    });
}

// READ
async function carregarTransacoes() {
    try {
        const response = await fetch(`${apiUrl}/${usuarioLogado}`);
        const transacoes = await response.json();
        atualizarTela(transacoes);
    } catch (erro) {
        console.error('Erro ao buscar transações.', erro);
    }
}

// CREATE
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const novaTransacao = {
        usuario_id: usuarioLogado,
        descricao: document.getElementById('descricao').value,
        data: document.getElementById('data').value,
        tipo: document.getElementById('tipo').value,
        valor: parseFloat(document.getElementById('valor').value)
    };

    try {
        await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novaTransacao)
        });

        form.reset();
        document.getElementById('descricao').focus();
        carregarTransacoes(); 
    } catch (erro) {
        console.error('Erro ao salvar transação:', erro);
    }
});

// DELETE
async function deletarTransacao(id) {
    if (confirm('Tem certeza que deseja apagar esta transação?')) {
        try {
            await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
            carregarTransacoes();
        } catch (erro) {
            console.error('Erro ao deletar transação:', erro);
        }
    }
}

// Atualiza HTML e o Gráfico
function atualizarTela(transacoes) {
    listaTransacoes.innerHTML = ''; 
    let totalReceitas = 0;
    let totalDespesas = 0;

    transacoes.forEach(t => {
        if (t.tipo === 'receita') totalReceitas += t.valor;
        else totalDespesas += t.valor;

        const li = document.createElement('li');
        li.classList.add(t.tipo === 'receita' ? 'receita-item' : 'despesa-item');
        
        const dataFormatada = formatarData(t.data);
        const tipoTexto = t.tipo === 'receita' ? 'Receita' : 'Despesa';
        const sinal = t.tipo === 'despesa' ? '- ' : '';

        li.innerHTML = `
            <div class="transacao-info">
                <span class="transacao-titulo">${t.descricao} (${tipoTexto})</span>
                <span class="transacao-data">Data: ${dataFormatada}</span>
            </div>
            <div class="transacao-acoes">
                <span class="transacao-valor">${sinal}${formatarMoeda(t.valor)}</span>
                <button onclick="deletarTransacao(${t.id})" class="btn-excluir" title="Excluir">🗑️</button>
            </div>
        `;
        listaTransacoes.appendChild(li);
    });

    const balanco = totalReceitas - totalDespesas;
    displayReceitas.innerText = formatarMoeda(totalReceitas);
    displayDespesas.innerText = formatarMoeda(totalDespesas);
    displayBalanco.innerText = formatarMoeda(balanco);

    const cardBalanco = document.querySelector('.card-balanco h2');
    cardBalanco.style.color = balanco < 0 ? '#f87171' : '#4ade80';

    // Injeta os novos valores no gráfico e atualiza
    meuGrafico.data.datasets[0].data = [totalReceitas, totalDespesas];
    meuGrafico.update(); 
}

// Inicia as funções
iniciarGrafico();
carregarTransacoes();