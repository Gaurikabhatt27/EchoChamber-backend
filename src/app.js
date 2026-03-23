import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import duelRoutes from './routes/duelRoutes.js';
const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Adjust this if your frontend runs on a different port
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/duels', duelRoutes);

export default app;