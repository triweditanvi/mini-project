import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import analyzeRoutes from './routes/analyze.js';
import grammarRoutes from './routes/grammar.js';
import todosRoutes from './routes/todos.js';
import logger from './middleware/logger.js';

dotenv.config();

const app = express();
  
app.use(logger);
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/grammar', grammarRoutes);
app.use('/todos', todosRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.log('MongoDB connection failed, continuing without database');
  }
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();