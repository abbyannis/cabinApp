const checklistController = require('../controllers/checklist');
const express = require('express');
const router = express.Router();


router.get('/checklists', checklistController.getChecklist);

router.post('/checklists', checklistController.postChecklist);

module.exports = router;