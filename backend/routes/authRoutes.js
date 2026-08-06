const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const {
  validate,
  signupRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
} = require('../middleware/validate');

// Public routes
router.post('/signup', signupRules, validate, authController.signup);
router.post('/login', loginRules, validate, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/forgot-password', forgotPasswordRules, validate, authController.forgotPassword);
router.post('/reset-password', resetPasswordRules, validate, authController.resetPassword);

// Protected routes
router.get('/me', auth, authController.getProfile);

module.exports = router;
