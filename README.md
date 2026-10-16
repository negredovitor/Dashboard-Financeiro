# 💰 Dashboard Financeiro Pessoal

Dashboard web para controle de receitas e despesas, com autenticação JWT,
gráfico dinâmico, filtros, edição e exportação em CSV.

![Status](https://img.shields.io/badge/status-ativo-success)

## 🚀 Tecnologias

- **Front-end:** HTML5, CSS3, JavaScript (Vanilla), Chart.js
- **Back-end:** Node.js + Express 5
- **Banco:** SQLite3
- **Auth:** JWT + bcryptjs

## 📦 Instalação

> Requer **Node.js ≥ 20.17** (por causa do `sqlite3@6`).

```bash
# 1. Clone / extraia o projeto
# 2. Instale as dependências
npm install

# 3. Inicie o servidor
npm start
# ou em modo watch:
npm run dev
