💰 Dashboard Financeiro Pessoal
Dashboard web para controle de receitas e despesas, com autenticação JWT, gráfico dinâmico, filtros, edição e exportação em CSV.

https://img.shields.io/badge/status-ativo-success

🚀 Tecnologias
Front-end: HTML5, CSS3, JavaScript, Chart.js

Back-end: Node.js + Express 5

Banco: SQLite3

Auth: JWT + bcryptjs

📦 Instalação
Requer Node.js ≥ 20.17 (por causa do sqlite3@6).

bash
# 1. Clone o projeto
git clone https://github.com/seu-usuario/dashboard-financeiro.git
cd dashboard-financeiro

# 2. Instale as dependências
npm install

# 3. Inicie o servidor
npm start
# ou em modo watch:
npm run dev
Acesse http://localhost:3000 no navegador.

⚠️ Não abra o login.html com duplo clique. Sempre acesse via http://localhost:3000.

🎮 Como usar
Cadastre-se na tela inicial

Adicione transações no formulário à esquerda

Acompanhe os totais nos cards e no gráfico

No histórico você pode:

✏️ Editar

🗑️ Excluir

🔍 Filtrar por busca, tipo ou mês

⬇ Exportar para CSV

📁 Estrutura
text
├── index.html      # Dashboard
├── login.html      # Login/Cadastro
├── style.css       # Estilos
├── script.js       # Lógica do dashboard
├── login.js        # Autenticação
├── tema.js         # Modo claro/escuro
├── server.js       # Servidor + API
└── database.db     # Gerado automaticamente
🔐 API
Método	Rota	Descrição
POST	/api/auth/register	Cria usuário
POST	/api/auth/login	Autentica
GET	/api/transactions	Lista + resumo
POST	/api/transactions	Cria transação
PUT	/api/transactions/:id	Edita transação
DELETE	/api/transactions/:id	Remove transação
Rotas protegidas exigem: Authorization: Bearer <token>

Exemplo
bash
# Registrar
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Maria","email":"maria@teste.com","password":"1234"}'

# Criar transação
curl -X POST http://localhost:3000/api/transactions \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Salário","amount":5000,"type":"income","date":"2026-01-05"}'
🔒 Segurança
Senhas com hash bcrypt

Tokens JWT com expiração de 7 dias

Cada usuário acessa apenas suas transações

Escape de HTML (proteção contra XSS)

🐛 Problemas comuns
Windows — "Could not locate the bindings file" (sqlite3):

Instale o Visual Studio Build Tools 2022 (workload "Desktop development with C++") e o Python 3, depois:

powershell
npm install-scripts approve sqlite3
npm rebuild sqlite3
"Erro de conexão com o servidor":

Confirme que o servidor está rodando (npm start)

Acesse via http://localhost:3000, nunca como arquivo

Abra o DevTools (F12) → Console para ver o erro real

Resetar o banco:

bash
rm database.db
npm start
📄 Licença
ISC

<div align="center">
Feito com ❤️ por Seu Nome

</div>
