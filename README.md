# 🚀 v2.0.0 — Dashboard Financeiro Pessoal

Esta atualização transforma o esboço inicial em uma aplicação completa e pronta para uso no dia a dia. Foco em **usabilidade**, **feedback visual** e **estabilidade**.

## ✨ Novidades

### 📊 Dashboard
- **Edição de transações** — agora é possível corrigir qualquer lançamento clicando no ícone ✏️
- **Filtros dinâmicos** — busca por texto, filtro por tipo (receita/despesa) e por mês
- **Exportação CSV** — baixe todo o histórico em um clique, pronto para Excel/Google Sheets
- **Máscara de moeda** — o input de valor formata automaticamente no padrão brasileiro (R$ 1.234,56)
- **Toast notifications** — feedback visual colorido para cada ação (sucesso, erro, info)
- **Loading states** — indicador visual enquanto os dados carregam
- **Confirmação de logout** — evita sair por engano

### 🎨 Interface
- **Modo escuro corrigido** — agora atualiza também as cores do gráfico em tempo real
- **Layout responsivo aprimorado** — melhor experiência em tablets e celulares
- **CSS limpo** — removida a duplicação de estilos
- **Ícones mais claros** — botão "Sair" com seta semântica

### 🔒 Segurança & Backend
- **Rota PUT** `/api/transactions/:id` para edição segura (valida ownership)
- **Escape de HTML** na renderização — proteção contra XSS em títulos e categorias
- **Validações** reforçadas no servidor e no cliente (valor > 0, campos obrigatórios)
- **Tratamento de 401** — redirecionamento automático quando o token expira

### 🛠️ Infraestrutura
- `.gitignore` configurado (`node_modules`, `database.db`, `.env`)
- `package.json` com campo `engines` (Node ≥ 20.17)
- Script `npm run dev` com `--watch` para desenvolvimento
- README completo com documentação da API e exemplos de uso

## 🐛 Correções

- Corrigido erro no `tema.js` quando o botão de tema não existia na página
- Corrigido carregamento do `sqlite3` no Windows (instruções no README)
- Corrigido encoding do CSV (BOM UTF-8 para abrir corretamente no Excel)
- Corrigida a formatação de valores monetários em todas as telas

## 📦 Como atualizar

```bash
git pull
npm install
npm start
