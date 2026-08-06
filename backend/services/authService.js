const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const userRepository = require('../repositories/userRepository');

class AuthService {
  /**
   * Generate short-lived access token
   */
  generateAccessToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m',
    });
  }

  /**
   * Generate long-lived refresh token
   */
  generateRefreshToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
    });
  }

  hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async issueTokens(user) {
    const accessToken = this.generateAccessToken(user._id);
    const refreshToken = this.generateRefreshToken(user._id);

    await userRepository.updateById(user._id, {
      refreshTokenHash: this.hashToken(refreshToken),
      refreshTokenExpire: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken, refreshToken };
  }

  getSafeUser(user) {
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    };
  }

  /**
   * Register a new user
   */
  async signup(name, email, password) {
    // Check if user already exists
    const exists = await userRepository.emailExists(email);
    if (exists) {
      const error = new Error('User with this email already exists');
      error.statusCode = 400;
      throw error;
    }

    // Create user
    const user = await userRepository.create({ name, email, password });

    const { accessToken, refreshToken } = await this.issueTokens(user);

    return {
      accessToken,
      refreshToken,
      user: this.getSafeUser(user),
    };
  }

  /**
   * Login user
   */
  async login(email, password) {
    // Find user with password
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const { accessToken, refreshToken } = await this.issueTokens(user);

    return {
      accessToken,
      refreshToken,
      user: this.getSafeUser(user),
    };
  }

  /**
   * Rotate refresh token and return a fresh access token
   */
  async refresh(refreshToken) {
    if (!refreshToken) {
      const error = new Error('Refresh token missing');
      error.statusCode = 401;
      throw error;
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    } catch {
      const error = new Error('Invalid or expired refresh token');
      error.statusCode = 401;
      throw error;
    }

    const user = await userRepository.findByIdWithRefreshToken(decoded.id);
    if (!user || !user.refreshTokenHash || user.refreshTokenExpire < Date.now()) {
      const error = new Error('Invalid or expired refresh token');
      error.statusCode = 401;
      throw error;
    }

    if (user.refreshTokenHash !== this.hashToken(refreshToken)) {
      const error = new Error('Invalid refresh token');
      error.statusCode = 401;
      throw error;
    }

    const { accessToken, refreshToken: newRefreshToken } = await this.issueTokens(user);

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: this.getSafeUser(user),
    };
  }

  /**
   * Clear persisted refresh token
   */
  async logout(refreshToken) {
    if (!refreshToken) return;

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
      await userRepository.updateById(decoded.id, {
        refreshTokenHash: null,
        refreshTokenExpire: null,
      });
    } catch {
      // Ignore invalid refresh tokens during logout.
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };
  }

  /**
   * Generate password reset token
   */
  async forgotPassword(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists or not (security best practice)
      return { message: 'If an account with that email exists, a reset link has been sent.' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    await userRepository.updateById(user._id, {
      resetPasswordToken: hashedToken,
      resetPasswordExpire: Date.now() + 30 * 60 * 1000, // 30 minutes
    });

    return {
      message: 'If an account with that email exists, a reset link has been sent.',
      resetToken, // In production, this would be sent via email
    };
  }

  /**
   * Reset password with token
   */
  async resetPassword(token, newPassword) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await userRepository.findByResetToken(hashedToken);

    if (!user) {
      const error = new Error('Invalid or expired reset token');
      error.statusCode = 400;
      throw error;
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const { accessToken, refreshToken } = await this.issueTokens(user);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    };
  }
}

module.exports = new AuthService();
