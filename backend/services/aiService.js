const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
  constructor() {
    this.model = null;
  }

  /**
   * Initialize Gemini AI
   */
  init() {
    if (process.env.GEMINI_API_KEY) {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
      console.log('🤖 AI service initialized (Gemini)');
    } else {
      console.log('🤖 AI service not configured (missing GEMINI_API_KEY)');
    }
  }

  /**
   * Get smart task suggestions
   * Suggests improved title, description, priority, and category
   */
  async getSuggestions(taskTitle, taskDescription = '') {
    if (!this.model) {
      return this.getFallbackSuggestions(taskTitle, taskDescription);
    }

    try {
      const prompt = `You are a task management assistant. Given the following task details, provide smart suggestions.

Task Title: "${taskTitle}"
${taskDescription ? `Task Description: "${taskDescription}"` : ''}

Respond in STRICT JSON format (no markdown, no code blocks):
{
  "improvedTitle": "A clearer, more actionable version of the title",
  "improvedDescription": "A more detailed description with actionable steps",
  "suggestedPriority": "low|medium|high|urgent",
  "suggestedCategory": "General|Work|Personal|Health|Finance|Education|Shopping|Travel",
  "estimatedDuration": "Estimated time to complete (e.g., '30 minutes', '2 hours')",
  "tips": ["tip1", "tip2", "tip3"]
}`;

      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      
      // Extract JSON from response (handle potential markdown wrapping)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return this.getFallbackSuggestions(taskTitle, taskDescription);
    } catch (error) {
      console.error('🤖 AI suggestion error:', error.message);
      return this.getFallbackSuggestions(taskTitle, taskDescription);
    }
  }

  /**
   * Parse natural language into task fields
   * e.g., "Call dentist tomorrow at 3pm" → { title, dueDate, reminder, priority, category }
   */
  async parseNaturalLanguage(input) {
    if (!this.model) {
      return this.getFallbackParse(input);
    }

    try {
      const now = new Date();
      const prompt = `You are a task parsing assistant. Parse the following natural language input into structured task fields.

Current date/time: ${now.toISOString()}

User input: "${input}"

Respond in STRICT JSON format (no markdown, no code blocks):
{
  "title": "Extracted task title",
  "description": "Any additional details extracted",
  "dueDate": "ISO 8601 date string or null",
  "priority": "low|medium|high|urgent",
  "category": "General|Work|Personal|Health|Finance|Education|Shopping|Travel",
  "reminder": "ISO 8601 date string (15 min before due date) or null"
}`;

      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return this.getFallbackParse(input);
    } catch (error) {
      console.error('🤖 AI parse error:', error.message);
      return this.getFallbackParse(input);
    }
  }

  /**
   * Fallback suggestions when AI is not available
   */
  getFallbackSuggestions(title, description) {
    const keywords = (title + ' ' + description).toLowerCase();
    
    let category = 'General';
    let priority = 'medium';

    if (/work|meeting|project|deadline|report|presentation|client/.test(keywords)) {
      category = 'Work';
      priority = 'high';
    } else if (/gym|health|doctor|exercise|medic|workout/.test(keywords)) {
      category = 'Health';
    } else if (/buy|shop|purchase|order|grocery/.test(keywords)) {
      category = 'Shopping';
    } else if (/pay|bill|bank|invest|tax|budget/.test(keywords)) {
      category = 'Finance';
      priority = 'high';
    } else if (/study|learn|course|exam|class|read/.test(keywords)) {
      category = 'Education';
    } else if (/trip|travel|flight|hotel|vacation/.test(keywords)) {
      category = 'Travel';
    } else if (/personal|family|home|clean|cook/.test(keywords)) {
      category = 'Personal';
    }

    if (/urgent|asap|immediately|critical|emergency/.test(keywords)) {
      priority = 'urgent';
    }

    return {
      improvedTitle: title,
      improvedDescription: description || `Complete: ${title}`,
      suggestedPriority: priority,
      suggestedCategory: category,
      estimatedDuration: '30 minutes',
      tips: [
        'Break this task into smaller steps',
        'Set a specific deadline to stay accountable',
        'Consider delegating if possible',
      ],
    };
  }

  /**
   * Fallback natural language parse
   */
  getFallbackParse(input) {
    const now = new Date();
    let dueDate = null;
    let reminder = null;

    // Simple date parsing
    if (/tomorrow/i.test(input)) {
      dueDate = new Date(now);
      dueDate.setDate(dueDate.getDate() + 1);
      dueDate.setHours(17, 0, 0, 0);
    } else if (/today/i.test(input)) {
      dueDate = new Date(now);
      dueDate.setHours(23, 59, 0, 0);
    } else if (/next week/i.test(input)) {
      dueDate = new Date(now);
      dueDate.setDate(dueDate.getDate() + 7);
      dueDate.setHours(17, 0, 0, 0);
    }

    // Time parsing
    const timeMatch = input.match(/(\d{1,2})\s*(am|pm)/i);
    if (timeMatch && dueDate) {
      let hours = parseInt(timeMatch[1]);
      if (timeMatch[2].toLowerCase() === 'pm' && hours !== 12) hours += 12;
      if (timeMatch[2].toLowerCase() === 'am' && hours === 12) hours = 0;
      dueDate.setHours(hours, 0, 0, 0);
    }

    if (dueDate) {
      reminder = new Date(dueDate.getTime() - 15 * 60 * 1000); // 15 min before
    }

    // Clean title
    const title = input
      .replace(/\b(tomorrow|today|next week|at \d{1,2}\s*(am|pm))\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    const suggestions = this.getFallbackSuggestions(title, '');

    return {
      title: title || input,
      description: '',
      dueDate: dueDate ? dueDate.toISOString() : null,
      priority: suggestions.suggestedPriority,
      category: suggestions.suggestedCategory,
      reminder: reminder ? reminder.toISOString() : null,
    };
  }

  /**
   * Autocomplete a task title based on partial input
   * @param {string} partialText - The text typed by the user so far
   * @returns {string} - The suggested completion
   */
  async autocompleteTask(partialText) {
    if (!this.model || !partialText || partialText.trim().length < 2) {
      return ''; // No AI, or too short
    }

    try {
      const prompt = `You are a smart to-do list autocomplete engine.
The user has typed: "${partialText}"
Complete their thought into a sensible, short task title (max 5 words).
Output ONLY the missing letters/words that should be appended to their input.
For example, if they typed "eati", you might output "ng healthy food".
If you don't have a good suggestion, return nothing.
Do NOT include the original text in your output, ONLY the completion text.`;

      const result = await this.model.generateContent(prompt);
      const completion = result.response.text().trim();
      
      // Clean up the output in case Gemini returns something weird like quotes
      return completion.replace(/^["']|["']$/g, '').trim();
    } catch (error) {
      console.error('🤖 AI autocomplete error:', error.message);
      return '';
    }
  }
}

module.exports = new AIService();
