const express = require('express');
const { body } = require('express-validator');
const {
  getTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
} = require('../controllers/task.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// All task routes require a valid JWT
router.use(protect);

router
  .route('/')
  .get(getTasks)
  .post(
    [
      body('title').trim().notEmpty().withMessage('Task title is required'),
      body('status')
        .optional()
        .isIn(['todo', 'in-progress', 'done'])
        .withMessage('Invalid status'),
      body('priority')
        .optional()
        .isIn(['low', 'medium', 'high'])
        .withMessage('Invalid priority'),
    ],
    createTask
  );

router.route('/:id').get(getTask).put(updateTask).delete(deleteTask);

module.exports = router;
