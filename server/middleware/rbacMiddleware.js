const mongoose = require('mongoose');
const Workspace = require('../models/Workspace');

const verifyWorkspaceRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const workspaceId =
        req.params.workspaceId ||
        req.params.id ||
        (req.body && req.body.workspaceId) ||
        req.headers['x-workspace-id'];

      if (!workspaceId) {
        return res.status(400).json({ message: 'Workspace ID is required for role verification' });
      }

      if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
        return res.status(400).json({ message: 'Invalid workspace ID' });
      }

      const workspace = await Workspace.findById(workspaceId);

      if (!workspace) {
        return res.status(404).json({ message: 'Workspace not found' });
      }

      const userIdStr = req.user._id.toString();

      if(workspace.owner.toString() === userIdStr) {
        req.workspace = workspace;
        return next();
      }

      const member = workspace.members.find((m) => {
        const memberUser = m.user || m.userId;
        return memberUser && memberUser.toString() === userIdStr;
      })

      if (!member) {
        return res.status(403).json({ message: 'Access denied. You are not a member of this workspace.' });
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(member.role)) {
        return res.status(403).json({ message: `Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}` });
      }

      req.workspace = workspace;
      return next()
    } 
    catch (error) {
      console.error('RBAC Middleware Error:', error.message);
      return res.status(500).json({ message: 'Internal server error during role authorization' });
    }
  }
}

module.exports = {verifyWorkspaceRole}
