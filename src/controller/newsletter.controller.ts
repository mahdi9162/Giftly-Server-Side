import { Request, Response } from 'express';
import { subscribeToNewsletterIntoDB } from '../services/newsletter.service';

const subscribeToNewsletter = async (req: Request, res: Response) => {
  try {
    const { email, source } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const result = await subscribeToNewsletterIntoDB(email, source);

    if (result.alreadySubscribed) {
      return res.status(200).json({
        success: true,
        message: 'You are already subscribed.',
        data: result.subscriber,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Subscribed successfully.',
      data: result.subscriber,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: 'Failed to subscribe.',
    });
  }
};

export const newsletterControllers = {
  subscribeToNewsletter,
};
