import express from 'express';
import { getUrlAnalytics, getPublicStats } from '../controllers/analyticsController.js';
import protect from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/:id', protect, getUrlAnalytics);
router.get('/public/:shortCode', getPublicStats);

export default router;
