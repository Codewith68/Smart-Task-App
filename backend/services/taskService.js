const taskRepository = require('../repositories/taskRepository');

class TaskService {
  /**
   * Create a new task
   */
  async createTask(userId, taskData) {
    const task = await taskRepository.create({
      ...taskData,
      user: userId,
    });
    return task;
  }

  /**
   * Get all tasks for user with filters
   */
  async getTasks(userId, queryOptions) {
    return await taskRepository.findAll(userId, queryOptions);
  }

  /**
   * Get a single task by ID
   */
  async getTaskById(taskId, userId) {
    const task = await taskRepository.findById(taskId, userId);
    if (!task) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }
    return task;
  }

  /**
   * Update a task
   */
  async updateTask(taskId, userId, updateData) {
    // If marking as completed, set completedAt
    if (updateData.completed === true) {
      updateData.completedAt = new Date();
    } else if (updateData.completed === false) {
      updateData.completedAt = null;
    }

    // If reminder is updated, reset reminderSent
    if (updateData.reminder) {
      updateData.reminderSent = false;
    }

    const task = await taskRepository.updateById(taskId, userId, updateData);
    if (!task) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }
    return task;
  }

  /**
   * Delete a task
   */
  async deleteTask(taskId, userId) {
    const task = await taskRepository.deleteById(taskId, userId);
    if (!task) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }
    return task;
  }

  /**
   * Toggle task completion
   */
  async toggleComplete(taskId, userId) {
    const task = await taskRepository.toggleComplete(taskId, userId);
    if (!task) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }
    return task;
  }

  /**
   * Toggle subtask completion
   */
  async toggleSubtask(taskId, userId, subtaskId) {
    const task = await taskRepository.toggleSubtask(taskId, userId, subtaskId);
    if (!task) {
      const error = new Error('Subtask or task not found');
      error.statusCode = 404;
      throw error;
    }
    return task;
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(userId) {
    return await taskRepository.getStats(userId);
  }

  /**
   * Get recent tasks
   */
  async getRecentTasks(userId, limit = 5) {
    return await taskRepository.getRecent(userId, limit);
  }
}

module.exports = new TaskService();
