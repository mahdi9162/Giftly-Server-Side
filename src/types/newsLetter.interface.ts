export interface INewsletterSubscriber {
  email: string;
  status: 'active' | 'unsubscribed';
  source: 'homepage' | 'footer';
}