import { NewsLetterSubscriber } from '../model/newsLetter/newsletter.model';

export const subscribeToNewsletterIntoDB = async (email: string, source = 'homepage') => {
  const existingSubscriber = await NewsLetterSubscriber.findOne({ email });

  if (existingSubscriber) {
    return {
      alreadySubscribed: true,
      subscriber: existingSubscriber,
    };
  }

  const subscriber = await NewsLetterSubscriber.create({
    email,
    source,
  });

  return {
    alreadySubscribed: false,
    subscriber,
  };
};
