const express = require('express');
const router = express.Router();
const {
  listBoards,
  getBoard,
  createBoard,
  updateColumns,
} = require('../controllers/boardController');
const { protect } = require('../middleware/authMiddleware');
const { verifyWorkspaceRole } = require('../middleware/rbacMiddleware');

router.use(protect);

router.get('/', listBoards);
router.get('/:id', getBoard);
router.post('/', verifyWorkspaceRole('Admin', 'Member'), createBoard);
router.put('/:id/columns', updateColumns);

module.exports = router;
