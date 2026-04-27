import { Request, Response } from 'express';
import { CreateCheckoutSession } from '../services/payment.service';
import { stripe } from '../config/stripe';
import { createPaidOrderIntoDB } from '../services/order.service';
import { CreateCheckoutSessionPayload, DeliveryMethod } from '../types/CheckoutSessionPayload';

type CheckoutMetadata = {
  items: string;
  shippingAddress: string;
  customerName: string;
  email: string;
  phone: string;
  deliveryMethod: DeliveryMethod;
};

type CheckoutSession = {
  id: string;
  metadata: CheckoutMetadata | null;
};

type CheckoutItems = CreateCheckoutSessionPayload['items'];
type CheckoutShippingAddress = CreateCheckoutSessionPayload['shippingAddress'];

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
    try {
      const session = event.data.object as CheckoutSession;

      console.log('Session id:', session.id);
      console.log('Session metadata:', session.metadata);

      const metadata = session.metadata;

      if (!metadata) {
        throw new Error('Missing session metadata');
      }

      const items = JSON.parse(metadata.items) as CheckoutItems;
      const shippingAddress = JSON.parse(metadata.shippingAddress) as CheckoutShippingAddress;

      console.log('Parsed items:', items);
      console.log('Parsed shippingAddress:', shippingAddress);

      const payload = {
        customerInfo: {
          fullName: metadata.customerName,
          email: metadata.email,
          phone: metadata.phone,
        },
        shippingAddress,
        deliveryMethod: metadata.deliveryMethod,
        paymentMethod: 'card' as const,
        items,
      };

      console.log('Paid order payload:', payload);

      const order = await createPaidOrderIntoDB(payload, session.id);

      console.log('Paid order created:', order._id);
    } catch (error) {
      console.log('Webhook order creation error:', error);

      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create paid order',
      });
    }
  }

  return res.status(200).json({ received: true });
};
