import { Request, Response } from 'express';
import { CreateCheckoutSession } from '../services/payment.service';

export const CreateStripeCheckoutSession = async (req: Request, res: Response) => {
  try {
    const session = await CreateCheckoutSession(req.body);

    res.status(200).json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create checkout session';

    res.status(400).json({
      success: false,
      message,
    });
  }
};
