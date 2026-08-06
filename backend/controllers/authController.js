const authService = require('../services/authService');
const emailService = require('../services/emailService');

const REFRESH_COOKIE_NAME = 'refreshToken';

const getRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

const getClearRefreshCookieOptions = () => {
  const { maxAge, ...options } = getRefreshCookieOptions();
  return options;
};

const setRefreshCookie = (res, token) => {
  res.cookie(REFRESH_COOKIE_NAME, token, getRefreshCookieOptions());
};

const clearRefreshCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, getClearRefreshCookieOptions());
};

const getCookie = (req, name) => {
  const cookies = req.headers.cookie || '';
  const pair = cookies
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`));

  return pair ? decodeURIComponent(pair.split('=').slice(1).join('=')) : null;
};

class AuthController {
  /**
   * POST /api/auth/signup
   * Register a new user
   */
  async signup(req, res, next) {
    try {
      const { name, email, password } = req.body;
      const result = await authService.signup(name, email, password);
      setRefreshCookie(res, result.refreshToken);
      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: {
          accessToken: result.accessToken,
          user: result.user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   * Login user
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      setRefreshCookie(res, result.refreshToken);
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          accessToken: result.accessToken,
          user: result.user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/me
   * Get current user profile
   */
  async getProfile(req, res, next) {
    try {
      const profile = await authService.getProfile(req.user._id);
      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/refresh
   * Rotate refresh token and return a new access token
   */
  async refresh(req, res, next) {
    try {
      const token = getCookie(req, REFRESH_COOKIE_NAME);
      if (!token) {
        clearRefreshCookie(res);
        return res.status(401).json({
          success: false,
          message: 'Refresh token missing',
        });
      }

      const result = await authService.refresh(token);
      setRefreshCookie(res, result.refreshToken);

      res.status(200).json({
        success: true,
        data: {
          accessToken: result.accessToken,
          user: result.user,
        },
      });
    } catch (error) {
      clearRefreshCookie(res);
      next(error);
    }
  }

  /**
   * POST /api/auth/logout
   * Clear refresh token
   */
  async logout(req, res, next) {
    try {
      const token = getCookie(req, REFRESH_COOKIE_NAME);
      await authService.logout(token);
      clearRefreshCookie(res);

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/forgot-password
   * Send password reset email
   */
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const result = await authService.forgotPassword(email);

      // Send reset email (if token was generated)
      if (result.resetToken) {
        await emailService.sendPasswordReset(email, result.resetToken);
      }

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/reset-password
   * Reset password with token
   */
  async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;
      const result = await authService.resetPassword(token, password);
      setRefreshCookie(res, result.refreshToken);
      res.status(200).json({
        success: true,
        message: 'Password reset successful',
        data: {
          accessToken: result.accessToken,
          user: result.user,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
