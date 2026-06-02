import express from 'express';
import { redirectShortUrl } from '../controllers/redirectController.js';

const router = express.Router();

router.get('/:shortCode', redirectShortUrl);

export default router;
