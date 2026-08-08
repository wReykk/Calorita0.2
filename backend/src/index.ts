import express from 'express';
import cors from 'cors';
import productRoutes from './routes/product.routes.js';
import authRoutes from './routes/auth.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';
import diaryRouter from './routes/diary.routes.js';
import userRoutes from './routes/user.routes.js'
import waterRoutes from './routes/water.routes.js'
import 'dotenv/config';
import recipeRoutes from './routes/recipe.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/diary', diaryRouter);
app.use('/api/recipes', recipeRoutes);
app.use('/api/water', waterRoutes)

// app.get('/ping', (req, res) => res.send('pong'))

app.use('/api/users', userRoutes)

app.use(errorHandler)

app.listen(PORT, () => {
    console.log(`Started on http://localhost:${PORT}`);
});