import express from 'express';
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    loginUser,
    setup2FA,
    verify2FASetup,
    verifyOTP
} from '../controllers/user.js'

import authMiddleware from '../middlewares/auth.js';

// Router /users
const router = express.Router();

// HTTP Verbs for RESTful APIs GET, POST, PUT, DELETE
router.get('/', authMiddleware, getAllUsers);
router.get('/:id', authMiddleware, getUserById);
router.post('/', createUser);
router.put('/:id', authMiddleware, updateUser);
router.delete('/:id', authMiddleware, deleteUser);
router.post('/login', loginUser)

// Define routes for 2FA
router.post('/setup-2fa', setup2FA);
router.post('/verify-2fa-setup', verify2FASetup);
router.post('/verify-otp', verifyOTP);

export default router;