import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import router from './routes';
import cookieParser from 'cookie-parser';
import { stripeWebhook } from './controller/payment.controller';

const app: Application = express();

// Parsers
app.use(
  cors({
    origin: ['http://localhost:3000', 'https://giftly-client-side.vercel.app'],
    credentials: true,
  }),
);

// Payment 
app.post('/api/v1/payments/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

app.use(express.json());
app.use(cookieParser());

// Application routes
app.use('/api/v1', router);

// Testing route
app.get('/', (req: Request, res: Response) => {
  res.send('Giftly Server is running!');
});

// Not found route
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

export default app;
