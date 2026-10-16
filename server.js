const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dashboard-financeiro-secret-key-2024';

app.use(cors());
app.use(express.json());

// Arquivos estáticos
app.use(express.static(path.join(__dirname)));

// Banco de dados
const db = new sqlite3.Database('./database.db');

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            amount REAL NOT NULL,
            type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
            category TEXT DEFAULT '',
            date TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);
});

// ========================
// AUTH MIDDLEWARE
// ========================
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Token não fornecido.' });

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.id;
        req.userName = decoded.name;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
}

// ========================
// AUTH ROUTES
// ========================
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }
    if (password.length < 4) {
        return res.status(400).json({ error: 'A senha deve ter pelo menos 4 caracteres.' });
    }

    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
        if (err) return res.status(500).json({ error: 'Erro interno do servidor.' });
        if (row) return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });

        try {
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(password, salt);

            db.run(
                'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
                [name, email, password_hash],
                function (err) {
                    if (err) return res.status(500).json({ error: 'Erro ao criar usuário.' });

                    const token = jwt.sign(
                        { id: this.lastID, name, email },
                        JWT_SECRET,
                        { expiresIn: '7d' }
                    );

                    res.status(201).json({
                        token,
                        user: { id: this.lastID, name, email }
                    });
                }
            );
        } catch (hashErr) {
            res.status(500).json({ error: 'Erro ao processar a senha.' });
        }
    });
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) return res.status(500).json({ error: 'Erro interno do servidor.' });
        if (!user) return res.status(401).json({ error: 'E-mail ou senha incorretos.' });

        try {
            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch) return res.status(401).json({ error: 'E-mail ou senha incorretos.' });

            const token = jwt.sign(
                { id: user.id, name: user.name, email: user.email },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.json({
                token,
                user: { id: user.id, name: user.name, email: user.email }
            });
        } catch (compareErr) {
            res.status(500).json({ error: 'Erro ao verificar a senha.' });
        }
    });
});

// ========================
// TRANSACTIONS (Protected)
// ========================
app.get('/api/transactions', authMiddleware, (req, res) => {
    db.all(
        'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC, id DESC',
        [req.userId],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });

            let totalIncome = 0, totalExpense = 0;
            rows.forEach(t => {
                if (t.type === 'income') totalIncome += t.amount;
                else totalExpense += t.amount;
            });

            res.json({
                transactions: rows,
                summary: {
                    totalIncome,
                    totalExpense,
                    balance: totalIncome - totalExpense
                }
            });
        }
    );
});

app.post('/api/transactions', authMiddleware, (req, res) => {
    const { title, amount, type, category, date } = req.body;

    if (!title || !amount || !type || !date) {
        return res.status(400).json({ error: 'Campos obrigatórios: title, amount, type, date.' });
    }
    if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({ error: 'Tipo deve ser "income" ou "expense".' });
    }
    if (parseFloat(amount) <= 0) {
        return res.status(400).json({ error: 'O valor deve ser maior que zero.' });
    }

    db.run(
        'INSERT INTO transactions (user_id, title, amount, type, category, date) VALUES (?, ?, ?, ?, ?, ?)',
        [req.userId, title, parseFloat(amount), type, category || '', date],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: this.lastID });
        }
    );
});

// PUT - Editar transação
app.put('/api/transactions/:id', authMiddleware, (req, res) => {
    const id = req.params.id;
    const { title, amount, type, category, date } = req.body;

    if (!title || !amount || !type || !date) {
        return res.status(400).json({ error: 'Campos obrigatórios: title, amount, type, date.' });
    }
    if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({ error: 'Tipo deve ser "income" ou "expense".' });
    }

    db.get('SELECT id FROM transactions WHERE id = ? AND user_id = ?', [id, req.userId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Transação não encontrada.' });

        db.run(
            'UPDATE transactions SET title = ?, amount = ?, type = ?, category = ?, date = ? WHERE id = ?',
            [title, parseFloat(amount), type, category || '', date, id],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ updated: this.changes });
            }
        );
    });
});

app.delete('/api/transactions/:id', authMiddleware, (req, res) => {
    const id = req.params.id;

    db.get('SELECT id FROM transactions WHERE id = ? AND user_id = ?', [id, req.userId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Transação não encontrada.' });

        db.run('DELETE FROM transactions WHERE id = ?', [id], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ deleted: this.changes });
        });
    });
});

// ========================
// FALLBACK
// ========================
app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.listen(PORT, () => {
    console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});