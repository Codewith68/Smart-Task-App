const { validationResult, body } = require('express-validator');

/**
 * Check validation results and return errors if any
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
};

/**
 * Validation rules for signup
 */
const signupRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    }).withMessage('Password must be at least 8 characters and include uppercase, lowercase, number, and symbol'),
];

/**
 * Validation rules for login
 */
const loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required'),
];

/**
 * Validation rules for forgot password
 */
const forgotPasswordRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
];

/**
 * Validation rules for reset password
 */
const resetPasswordRules = [
  body('token')
    .trim()
    .notEmpty().withMessage('Reset token is required'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    }).withMessage('Password must be at least 8 characters and include uppercase, lowercase, number, and symbol'),
];

/**
 * Validation rules for creating/updating a task
 */
const taskRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Task title is required')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent']).withMessage('Priority must be low, medium, high, or urgent'),
  body('category')
    .optional()
    .isIn(['General', 'Work', 'Personal', 'Health', 'Finance', 'Education', 'Shopping', 'Travel'])
    .withMessage('Invalid category'),
  body('dueDate')
    .optional({ nullable: true })
    .isISO8601().withMessage('Due date must be a valid date'),
  body('reminder')
    .optional({ nullable: true })
    .isISO8601().withMessage('Reminder must be a valid date'),
];

/**
 * Validation rules for updating a task (all fields optional)
 */
const taskUpdateRules = [
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Task title cannot be empty')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent']).withMessage('Priority must be low, medium, high, or urgent'),
  body('category')
    .optional()
    .isIn(['General', 'Work', 'Personal', 'Health', 'Finance', 'Education', 'Shopping', 'Travel'])
    .withMessage('Invalid category'),
  body('completed')
    .optional()
    .isBoolean().withMessage('Completed must be true or false'),
  body('dueDate')
    .optional({ nullable: true })
    .isISO8601().withMessage('Due date must be a valid date'),
  body('reminder')
    .optional({ nullable: true })
    .isISO8601().withMessage('Reminder must be a valid date'),
];

module.exports = {
  validate,
  signupRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
  taskRules,
  taskUpdateRules,
};
