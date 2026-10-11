const express = require('express');
const router = express.Router();
const {
  listTasks,
  createTask,
  updateTask,
  addComment,
  deleteTask,
  reorderTask,
  reorderMany,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.get('/', listTasks);
router.post('/', upload.single('attachment'), createTask);
router.put('/reorder-many', reorderMany);
router.put('/:id', upload.single('attachment'), updateTask);
router.delete('/:id', deleteTask);
router.put('/:id/reorder', reorderTask);
router.post('/:id/comments', addComment);

module.exports = router;
