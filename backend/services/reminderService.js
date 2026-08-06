const cron = require('node-cron');
const taskRepository = require('../repositories/taskRepository');
const emailService = require('./emailService');

class ReminderService {
  /**
   * Start the reminder cron job — runs every minute
   */
  start() {
    cron.schedule('* * * * *', async () => {
      try {
        await this.checkReminders();
      } catch (error) {
        console.error('⏰ Reminder cron error:', error.message);
      }
    });
    console.log('⏰ Reminder service started (checking every minute)');
  }

  /**
   * Check for due reminders and send notifications
   */
  async checkReminders() {
    const dueTasks = await taskRepository.findDueReminders();

    if (dueTasks.length === 0) return;

    console.log(`⏰ Found ${dueTasks.length} due reminder(s)`);

    for (const task of dueTasks) {
      try {
        // Send email notification
        if (task.user && task.user.email) {
          await emailService.sendReminder(
            task.user.email,
            task.title,
            task.description,
            task.dueDate
          );
        }

        // Mark reminder as sent
        await taskRepository.markReminderSent(task._id);
        console.log(`⏰ Reminder sent for task: "${task.title}"`);
      } catch (error) {
        console.error(`⏰ Failed to process reminder for task ${task._id}:`, error.message);
      }
    }
  }
}

module.exports = new ReminderService();
