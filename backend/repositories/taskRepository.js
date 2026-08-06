const Task = require('../models/Task');

class TaskRepository {
  /**
   * Create a new task
   */
  async create(taskData) {
    const task = new Task(taskData);
    return await task.save();
  }

  /**
   * Find task by ID (ensures it belongs to the user)
   */
  async findById(taskId, userId) {
    return await Task.findOne({ _id: taskId, user: userId });
  }

  /**
   * Find all tasks for a user with filters, search, sort, and pagination
   */
  async findAll(userId, options = {}) {
    const {
      search = '',
      priority = '',
      category = '',
      completed = '',
      sort = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10,
    } = options;

    // Build filter query
    const filter = { user: userId };

    // Text search
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Priority filter
    if (priority) {
      filter.priority = priority;
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Completed filter
    if (completed !== '') {
      filter.completed = completed === 'true';
    }

    // Build sort object
    const sortObj = {};
    const sortField = ['createdAt', 'dueDate', 'priority', 'title', 'category'].includes(sort)
      ? sort
      : 'createdAt';

    // Priority needs custom sort order
    if (sortField === 'priority') {
      // We'll handle priority sorting with aggregation or post-sort
      sortObj.priority = order === 'asc' ? 1 : -1;
    } else {
      sortObj[sortField] = order === 'asc' ? 1 : -1;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Task.countDocuments(filter),
    ]);

    return {
      tasks,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    };
  }

  /**
   * Update a task by ID (ensures it belongs to the user)
   */
  async updateById(taskId, userId, updateData) {
    return await Task.findOneAndUpdate(
      { _id: taskId, user: userId },
      updateData,
      { new: true, runValidators: true }
    );
  }

  /**
   * Delete a task by ID (ensures it belongs to the user)
   */
  async deleteById(taskId, userId) {
    return await Task.findOneAndDelete({ _id: taskId, user: userId });
  }

  /**
   * Toggle task completion status
   */
  async toggleComplete(taskId, userId) {
    const task = await Task.findOne({ _id: taskId, user: userId });
    if (!task) return null;

    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date() : null;
    return await task.save();
  }

  /**
   * Get dashboard statistics for a user
   */
  async getStats(userId) {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      priorityStats,
      categoryStats,
      recentCompleted,
      upcomingReminders,
      todayTasks,
    ] = await Promise.all([
      Task.countDocuments({ user: userId }),
      Task.countDocuments({ user: userId, completed: true }),
      Task.countDocuments({ user: userId, completed: false }),
      Task.countDocuments({
        user: userId,
        completed: false,
        dueDate: { $lt: now, $ne: null },
      }),
      Task.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
      Task.find({ user: userId, completed: true })
        .sort({ completedAt: -1 })
        .limit(5)
        .lean(),
      Task.find({
        user: userId,
        reminder: { $gte: now },
        reminderSent: false,
      })
        .sort({ reminder: 1 })
        .limit(10)
        .lean(),
      Task.countDocuments({
        user: userId,
        completed: false,
        dueDate: {
          $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
        },
      }),
    ]);

    // Completion trend (last 7 days)
    const completionTrend = await Task.aggregate([
      {
        $match: {
          user: userId,
          completed: true,
          completedAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$completedAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      todayTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      priorityStats: priorityStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      categoryStats: categoryStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      completionTrend,
      recentCompleted,
      upcomingReminders,
    };
  }

  /**
   * Find tasks with due reminders (for cron job)
   */
  async findDueReminders() {
    const now = new Date();
    return await Task.find({
      reminder: { $lte: now },
      reminderSent: false,
      completed: false,
    }).populate('user', 'name email');
  }

  /**
   * Mark reminder as sent
   */
  async markReminderSent(taskId) {
    return await Task.findByIdAndUpdate(taskId, { reminderSent: true });
  }

  /**
   * Get recent tasks for a user
   */
  async getRecent(userId, limit = 5) {
    return await Task.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }
}

module.exports = new TaskRepository();
