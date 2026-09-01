const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(express.json()); 

// Cria ou conecta ao arquivo do banco de dados
const db = new sqlite3.Database('./database.db');

// Criação da tabela
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS transacoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id TEXT,
            descricao TEXT,
            data TEXT,
            tipo TEXT,
            valor REAL
        )
    `);
});

// CREATE: Adicionar nova transação
app.post('/transacoes', (req, res) => {
    const { usuario_id, descricao, data, tipo, valor } = req.body;
    db.run(
        `INSERT INTO transacoes (usuario_id, descricao, data, tipo, valor) VALUES (?, ?, ?, ?, ?)`,
        [usuario_id, descricao, data, tipo, valor],
        function(err) {
            if (err) return res.status(500).json({ erro: err.message });
            res.json({ id: this.lastID });
        }
    );
});

// READ: Buscar as transações de um usuário
app.get('/transacoes/:usuario_id', (req, res) => {
    const usuario_id = req.params.usuario_id;
    db.all(`SELECT * FROM transacoes WHERE usuario_id = ? ORDER BY id DESC`, [usuario_id], (err, rows) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json(rows);
    });
});

// DELETE: Apagar uma transação
app.delete('/transacoes/:id', (req, res) => {
    const id = req.params.id;
    db.run(`DELETE FROM transacoes WHERE id = ?`, id, function(err) {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ deletados: this.changes });
    });
});

app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});