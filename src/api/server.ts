
import express from 'express';
import cors from 'cors';
import apiRoutes from './routes';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);

app.listen(port, '0.0.0.0', () => {
  console.log(`API server running on port ${port}`);
});

export default app;
