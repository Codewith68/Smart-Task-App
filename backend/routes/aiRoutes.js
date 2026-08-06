const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const auth = require('../middleware/auth');

// All AI routes require authentication
router.use(auth);

router.post('/suggest', aiController.getSuggestions);
router.post('/parse', aiController.parseNaturalLanguage);
router.get('/autocomplete', aiController.getAutocomplete);

module.exports = router;
