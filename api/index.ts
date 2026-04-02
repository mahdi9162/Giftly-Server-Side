import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../src/app';
import { connectDB } from '../src/lib/connectDB';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await connectDB();
  return app(req, res);
}