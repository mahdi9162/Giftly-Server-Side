import { Request, Response } from 'express';
import { CreateCheckoutSession } from '../services/payment.service';
import { stripe } from '../config/stripe';

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

export const stripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).json({
      success: false,
      message: 'Missing stripe signature',
    });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET as string);
  } catch (error) {
    console.log('Webhook verification error:', error);

    const message = error instanceof Error ? error.message : 'Webhook signature verification failed';

    return res.status(400).json({
      success: false,
      message,
    });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    console.log('Payment successful for session:', session.id);
  }

  return res.status(200).json({ received: true });
};
