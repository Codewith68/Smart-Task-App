const User = require('../models/User');

class UserRepository {
  /**
   * Create a new user
   */
  async create(userData) {
    const user = new User(userData);
    return await user.save();
  }

  /**
   * Find user by email (includes password for auth)
   */
  async findByEmail(email) {
    return await User.findOne({ email }).select('+password');
  }

  /**
   * Find user by ID (without password)
   */
  async findById(id) {
    return await User.findById(id);
  }

  /**
   * Find user by ID with password (for password change)
   */
  async findByIdWithPassword(id) {
    return await User.findById(id).select('+password');
  }

  /**
   * Find user by ID with refresh token fields
   */
  async findByIdWithRefreshToken(id) {
    return await User.findById(id).select('+refreshTokenHash +refreshTokenExpire');
  }

  /**
   * Update user by ID
   */
  async updateById(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  /**
   * Find user by reset token
   */
  async findByResetToken(token) {
    return await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    }).select('+password');
  }

  /**
   * Check if email already exists
   */
  async emailExists(email) {
    const user = await User.findOne({ email });
    return !!user;
  }
}

module.exports = new UserRepository();
