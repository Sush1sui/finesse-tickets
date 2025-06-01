import express from 'express';
import { discordLogin, discordCallback, logout, getAuthStatus } from '../controllers/authController';

const router = express.Router();

// Initiates Discord OAuth flow
router.get('/discord', discordLogin);

// Discord OAuth callback
router.get('/discord/callback', discordCallback);

// Logout
router.get('/logout', logout);

// Check authentication status
router.get('/status', getAuthStatus);

export default router;
