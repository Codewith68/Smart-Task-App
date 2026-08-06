const aiService = require('../services/aiService');

class AIController {
  /**
   * POST /api/ai/suggest
   * Get smart task suggestions
   */
  async getSuggestions(req, res, next) {
    try {
      const { title, description } = req.body;

      if (!title) {
        return res.status(400).json({
          success: false,
          message: 'Task title is required for suggestions',
        });
      }

      const suggestions = await aiService.getSuggestions(title, description);
      res.status(200).json({
        success: true,
        data: suggestions,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/ai/parse
   * Parse natural language into task fields
   */
  async parseNaturalLanguage(req, res, next) {
    try {
      const { input } = req.body;

      if (!input) {
        return res.status(400).json({
          success: false,
          message: 'Input text is required',
        });
      }

      const parsedTask = await aiService.parseNaturalLanguage(input);
      res.status(200).json({
        success: true,
        data: parsedTask,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/ai/autocomplete?q=...
   * Autocomplete partial task title
   */
  async getAutocomplete(req, res, next) {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Query parameter "q" is required',
        });
      }

      const completion = await aiService.autocompleteTask(q);
      res.status(200).json({
        success: true,
        data: completion,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AIController();
