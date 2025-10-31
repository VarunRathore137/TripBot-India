import express from 'express';
import { updateProfile, updatePassword, deleteAccount } from '../controllers/userController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.patch('/profile', auth, updateProfile);
router.patch('/password', auth, updatePassword);
router.delete('/account', auth, deleteAccount);

export default router;