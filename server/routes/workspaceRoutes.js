const express = require('express');
const router = express.Router();
const {
  getWorkspaces,
  createWorkspace,
  addMember,
  updateWorkspace,
} = require('../controllers/workspaceController');
const { protect } = require('../middleware/authMiddleware');
const { verifyWorkspaceRole } = require('../middleware/rbacMiddleware');

router.use(protect);

router.get('/', getWorkspaces);
router.post('/', createWorkspace);
router.put('/:id', verifyWorkspaceRole('Admin'), updateWorkspace);
router.post('/:id/members', verifyWorkspaceRole('Admin'), addMember);

module.exports = router;
