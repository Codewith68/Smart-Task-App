const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');
const { validate, taskRules, taskUpdateRules } = require('../middleware/validate');

// All task routes require authentication
router.use(auth);

// Dashboard stats (must be before /:id to avoid conflict)
router.get('/stats', taskController.getStats);
router.get('/recent', taskController.getRecentTasks);

// CRUD
router.post('/', taskRules, validate, taskController.createTask);
router.get('/', taskController.getTasks);
router.get('/:id', taskController.getTask);
router.put('/:id', taskUpdateRules, validate, taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

// Toggle completion
router.patch('/:id/complete', taskController.toggleComplete);

module.exports = router;
