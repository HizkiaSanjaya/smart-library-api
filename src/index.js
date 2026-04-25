// src/index.js
import express from 'express';
import dotenv from 'dotenv';
import bookRoutes from './routes/bookRoutes.js';
import loanRoutes from './routes/loanRoutes.js'; // Kita pakai ini untuk Top 3 Peminjam
import memberRoutes from './routes/memberRoutes.js'; 
import authorRoutes from './routes/authorRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';

dotenv.config();

const app = express();
app.use(express.json());

// Grouping Routes sesuai Modul 4
app.use('/api/books', bookRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/categories', categoryRoutes);

app.get('/', (req, res) => res.send('Smart Library API is Running...'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(` 🚀 Server running on http://localhost:${PORT}`);
});
