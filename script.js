// ========================
// AUTH CHECK
// ========================
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = 'login.html';
}

const API_URL = window.location.origin;
window.meuGrafico = null;

const form = document.getElementById('form-transacao');
const displayReceitas = document.getElementById('receitas');
const displayDespesas = document.getElementById('despesas');
const displayBalanco = document.getElementById('balanco');
const listaTransacoes = document.getElementById('lista-transacoes');
const inputValor = document.getElementById('valor');
const btnSubmit = document.getElementById('btn-submit');
const btnCancelar = document.getElementById('btn-cancelar');
const formTitle = document.getElementById('form-title');

let todasTransacoes = [];
let filtroBusca = '';
let filtroTipo = '';
let filtroMes = '';

// ========================
// USER GREETING & LOGOUT
// ========================
const userName = localStorage.getItem('userName') || 'Usuário';
document.getElementById('user-greeting').textContent = `Olá, ${userName} 👋`;

document.getElementById('btn-logout').addEventListener('click', () => {
    if (confirm('Deseja realmente sair?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        window.location.href = 'login.html';
    }
});

// ========================
// HELPERS
// ========================
function authHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

const formatarMoeda = (valor) =>
    valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatarData = (dataStr) => {
    const [ano, mes, dia] = dataStr.split('-');
    return `${dia}/${mes}/${ano}`;
};

// ========================
// TOAST
// ========================
function toast(msg, tipo = 'info') {
    const container = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = `toast ${tipo}`;
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(10px)';
        setTimeout(() => el.remove(), 300);
    }, 3500);
}

// ========================
// MÁSCARA DE MOEDA
// ========================
inputValor.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (!v) { e.target.value = ''; return; }
    v = (parseInt(v, 10) / 100).toFixed(2);
    v = v.replace('.', ',');
    v = v.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    e.target.value = v;
});

function parseValor(str) {
    if (!str) return NaN;
    return parseFloat(str.replace(/\./g, '').replace(',', '.'));
}

// ========================
// CHART
// ========================
function iniciarGrafico() {
    const ctx = document.getElementById('graficoBalanco').getContext('2d');
    const corTexto = document.body.classList.contains('dark-mode') ? '#f8fafc' : '#1e293b';

    window.meuGrafico = new Chart(ctx, {
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
                    labels: { color: corTexto, font: { family: 'Poppins' } }
                }
            }
        }
    });
}

// ========================
// READ
// ========================
async function carregarTransacoes() {
    listaTransacoes.innerHTML = '<li class="loading-item">Carregando transações...</li>';

    try {
        const response = await fetch(`${API_URL}/api/transactions`, {
            headers: authHeaders()
        });

        if (response.status === 401) {
            localStorage.clear();
            window.location.href = 'login.html';
            return;
        }

        const data = await response.json();
        todasTransacoes = data.transactions || [];
        atualizarResumo(data.summary);
        popularFiltroMeses();
        renderizarLista();
    } catch (erro) {
        console.error('Erro ao buscar transações.', erro);
        listaTransacoes.innerHTML = '<li class="empty-item">Erro ao carregar transações.</li>';
        toast('Erro de conexão com o servidor.', 'erro');
    }
}

// ========================
// CREATE / UPDATE
// ========================
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const editId = document.getElementById('edit-id').value;
    const valor = parseValor(inputValor.value);
    const descricao = document.getElementById('descricao').value.trim();
    const data = document.getElementById('data').value;
    const tipo = document.getElementById('tipo').value;
    const categoria = document.getElementById('categoria').value.trim();

    if (!descricao) { toast('Informe a descrição.', 'erro'); return; }
    if (isNaN(valor) || valor <= 0) { toast('Informe um valor válido.', 'erro'); return; }
    if (!data) { toast('Informe a data.', 'erro'); return; }
    if (!tipo) { toast('Selecione o tipo.', 'erro'); return; }

    const payload = {
        title: descricao,
        amount: valor,
        type: tipo,
        category: categoria,
        date: data
    };

    btnSubmit.disabled = true;
    btnSubmit.textContent = editId ? 'Atualizando...' : 'Adicionando...';

    try {
        const url = editId
            ? `${API_URL}/api/transactions/${editId}`
            : `${API_URL}/api/transactions`;
        const method = editId ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: authHeaders(),
            body: JSON.stringify(payload)
        });

        if (res.status === 401) {
            localStorage.clear();
            window.location.href = 'login.html';
            return;
        }

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            toast(err.error || 'Erro ao salvar transação.', 'erro');
            return;
        }

        toast(editId ? 'Transação atualizada!' : 'Transação adicionada!', 'sucesso');
        resetForm();
        carregarTransacoes();
    } catch (erro) {
        console.error(erro);
        toast('Erro de conexão com o servidor.', 'erro');
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Adicionar Transação +';
    }
});

function resetForm() {
    form.reset();
    document.getElementById('edit-id').value = '';
    formTitle.textContent = 'Nova Transação';
    btnSubmit.textContent = 'Adicionar Transação +';
    btnCancelar.style.display = 'none';
    document.getElementById('data').valueAsDate = new Date();
    document.getElementById('descricao').focus();
}

btnCancelar.addEventListener('click', resetForm);

// ========================
// DELETE
// ========================
async function deletarTransacao(id) {
    if (!confirm('Tem certeza que deseja apagar esta transação?')) return;

    try {
        const res = await fetch(`${API_URL}/api/transactions/${id}`, {
            method: 'DELETE',
            headers: authHeaders()
        });

        if (res.status === 401) {
            localStorage.clear();
            window.location.href = 'login.html';
            return;
        }

        toast('Transação excluída.', 'sucesso');
        carregarTransacoes();
    } catch (erro) {
        console.error('Erro ao deletar transação:', erro);
        toast('Erro ao excluir transação.', 'erro');
    }
}

// ========================
// EDIT
// ========================
function editarTransacao(id) {
    const t = todasTransacoes.find(x => x.id === id);
    if (!t) return;

    document.getElementById('edit-id').value = t.id;
    document.getElementById('descricao').value = t.title;
    document.getElementById('data').value = t.date;
    document.getElementById('tipo').value = t.type;
    document.getElementById('categoria').value = t.category || '';

    // Formata valor de volta para o input (máscara)
    const v = t.amount.toFixed(2).replace('.', ',');
    inputValor.value = v.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    formTitle.textContent = 'Editar Transação';
    btnSubmit.textContent = 'Salvar Alterações';
    btnCancelar.style.display = 'block';
    document.getElementById('descricao').focus();
    window.scrollTo({ top: form.offsetTop - 50, behavior: 'smooth' });
}

// ========================
// FILTROS
// ========================
document.getElementById('filtro-busca').addEventListener('input', (e) => {
    filtroBusca = e.target.value.toLowerCase().trim();
    renderizarLista();
});

document.getElementById('filtro-tipo').addEventListener('change', (e) => {
    filtroTipo = e.target.value;
    renderizarLista();
});

document.getElementById('filtro-mes').addEventListener('change', (e) => {
    filtroMes = e.target.value;
    renderizarLista();
});

function popularFiltroMeses() {
    const select = document.getElementById('filtro-mes');
    const meses = new Set();
    todasTransacoes.forEach(t => {
        const [ano, mes] = t.date.split('-');
        meses.add(`${ano}-${mes}`);
    });

    const nomesMeses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    const atual = select.value;

    select.innerHTML = '<option value="">Todos os meses</option>';
    [...meses].sort().reverse().forEach(m => {
        const [ano, mes] = m.split('-');
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = `${nomesMeses[parseInt(mes)-1]}/${ano}`;
        select.appendChild(opt);
    });

    if (atual) select.value = atual;
}

// ========================
// RENDER
// ========================
function renderizarLista() {
    listaTransacoes.innerHTML = '';

    let filtradas = todasTransacoes.filter(t => {
        if (filtroTipo && t.type !== filtroTipo) return false;
        if (filtroMes && !t.date.startsWith(filtroMes)) return false;
        if (filtroBusca) {
            const alvo = `${t.title} ${t.category || ''}`.toLowerCase();
            if (!alvo.includes(filtroBusca)) return false;
        }
        return true;
    });

    if (filtradas.length === 0) {
        listaTransacoes.innerHTML = '<li class="empty-item">Nenhuma transação encontrada.</li>';
        return;
    }

    filtradas.forEach(t => {
        const li = document.createElement('li');
        li.classList.add(t.type === 'income' ? 'receita-item' : 'despesa-item');

        const dataFormatada = formatarData(t.date);
        const tipoTexto = t.type === 'income' ? 'Receita' : 'Despesa';
        const sinal = t.type === 'expense' ? '- ' : '+ ';
        const categoriaTexto = t.category ? ` • ${t.category}` : '';

        li.innerHTML = `
            <div class="transacao-info">
                <span class="transacao-titulo">${escapeHtml(t.title)} (${tipoTexto}${categoriaTexto})</span>
                <span class="transacao-data">Data: ${dataFormatada}</span>
            </div>
            <div class="transacao-acoes">
                <span class="transacao-valor">${sinal}${formatarMoeda(t.amount)}</span>
                <button class="btn-editar" title="Editar">✏️</button>
                <button class="btn-excluir" title="Excluir">🗑️</button>
            </div>
        `;

        li.querySelector('.btn-editar').addEventListener('click', () => editarTransacao(t.id));
        li.querySelector('.btn-excluir').addEventListener('click', () => deletarTransacao(t.id));

        listaTransacoes.appendChild(li);
    });
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function atualizarResumo(summary) {
    displayReceitas.innerText = formatarMoeda(summary.totalIncome);
    displayDespesas.innerText = formatarMoeda(summary.totalExpense);
    displayBalanco.innerText = formatarMoeda(summary.balance);

    const cardBalanco = document.querySelector('.card-balanco h2');
    cardBalanco.style.color = summary.balance < 0 ? '#f87171' : '#4ade80';

    if (window.meuGrafico) {
        window.meuGrafico.data.datasets[0].data = [summary.totalIncome, summary.totalExpense];
        window.meuGrafico.update();
    }
}

// ========================
// EXPORTAR CSV
// ========================
document.getElementById('btn-exportar').addEventListener('click', () => {
    if (todasTransacoes.length === 0) {
        toast('Nada para exportar.', 'info');
        return;
    }

    const linhas = [['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor']];
    todasTransacoes.forEach(t => {
        linhas.push([
            t.date,
            t.title,
            t.category || '',
            t.type === 'income' ? 'Receita' : 'Despesa',
            t.amount.toFixed(2).replace('.', ',')
        ]);
    });

    const csv = linhas.map(l => l.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transacoes-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast('CSV exportado!', 'sucesso');
});

// ========================
// INIT
// ========================
iniciarGrafico();
document.getElementById('data').valueAsDate = new Date();
carregarTransacoes();