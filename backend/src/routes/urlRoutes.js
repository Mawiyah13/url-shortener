import express from 'express';
import { createUrl, getMyUrls, getUrlDetails, updateUrl, deleteUrl } from '../controllers/urlController.js';
import protect from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createUrl)
  .get(protect, getMyUrls);

router.route('/:id')
  .get(protect, getUrlDetails)
  .put(protect, updateUrl)
  .delete(protect, deleteUrl);

export default router;
