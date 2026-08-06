const taskService = require('../services/taskService');

class TaskController {
  /**
   * POST /api/tasks
   * Create a new task
   */
  async createTask(req, res, next) {
    try {
      const task = await taskService.createTask(req.user._id, req.body);
      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/tasks
   * Get all tasks with filters, search, sort, pagination
   */
  async getTasks(req, res, next) {
    try {
      const result = await taskService.getTasks(req.user._id, req.query);
      res.status(200).json({
        success: true,
        data: result.tasks,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/tasks/stats
   * Get dashboard statistics
   */
  async getStats(req, res, next) {
    try {
      const stats = await taskService.getDashboardStats(req.user._id);
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/tasks/recent
   * Get recent tasks
   */
  async getRecentTasks(req, res, next) {
    try {
      const tasks = await taskService.getRecentTasks(req.user._id, parseInt(req.query.limit) || 5);
      res.status(200).json({
        success: true,
        data: tasks,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/tasks/:id
   * Get a single task
   */
  async getTask(req, res, next) {
    try {
      const task = await taskService.getTaskById(req.params.id, req.user._id);
      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/tasks/:id
   * Update a task
   */
  async updateTask(req, res, next) {
    try {
      const task = await taskService.updateTask(req.params.id, req.user._id, req.body);
      res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/tasks/:id
   * Delete a task
   */
  async deleteTask(req, res, next) {
    try {
      await taskService.deleteTask(req.params.id, req.user._id);
      res.status(200).json({
        success: true,
        message: 'Task deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/tasks/:id/complete
   * Toggle task completion
   */
  async toggleComplete(req, res, next) {
    try {
      const task = await taskService.toggleComplete(req.params.id, req.user._id);
      res.status(200).json({
        success: true,
        message: task.completed ? 'Task marked as completed' : 'Task marked as pending',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TaskController();
