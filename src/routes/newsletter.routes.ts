import express from 'express';
import { newsletterControllers } from '../controller/newsletter.controller';

const router = express.Router();

router.post('/subscribe', newsletterControllers.subscribeToNewsletter);

export const NewsletterRoutes = router;
