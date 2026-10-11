const mongoose = require('mongoose');
const Workspace = require('../models/Workspace');
const Board = require('../models/Board');
const Task = require('../models/Task');

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/** Returns 'Admin' | 'Member' | null for the user in the given workspace doc. */
const getRole = (workspace, userId) => {
  const uid = String(userId);
  if (String(workspace.owner) === uid) return 'Admin';
  const member = workspace.members.find((m) => String(m.user) === uid);
  return member ? member.role : null;
};

const assertWorkspaceAccess = async (workspaceId, userId) => {
  if (!isValidId(workspaceId)) throw new HttpError(400, 'Invalid workspace id');
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) throw new HttpError(404, 'Workspace not found');
  if (!getRole(workspace, userId)) {
    throw new HttpError(403, 'Access denied. You are not a member of this workspace.');
  }
  return workspace;
};

const assertBoardAccess = async (boardId, userId) => {
  if (!isValidId(boardId)) throw new HttpError(400, 'Invalid board id');
  const board = await Board.findById(boardId);
  if (!board) throw new HttpError(404, 'Board not found');
  const workspace = await assertWorkspaceAccess(board.workspaceId, userId);
  return { board, workspace };
};

const assertTaskAccess = async (taskId, userId) => {
  if (!isValidId(taskId)) throw new HttpError(400, 'Invalid task id');
  const task = await Task.findById(taskId);
  if (!task) throw new HttpError(404, 'Task not found');
  const { board, workspace } = await assertBoardAccess(task.boardId, userId);
  return { task, board, workspace };
};

/** Sends an error response, preserving HttpError status codes. */
const handleError = (res, error, label, fallbackMessage) => {
  if (error instanceof HttpError) {
    return res.status(error.status).json({ message: error.message });
  }
  if (error && error.name === 'ValidationError') {
    return res.status(400).json({ message: error.message });
  }
  console.error(`${label}:`, error.message);
  return res.status(500).json({ message: fallbackMessage });
};

/** Broadcast a realtime event to everyone viewing a board except the sender's socket. */
const emitToBoard = (req, boardId, event, payload) => {
  const io = req.app.get('io');
  if (!io) return;
  const senderSocketId = req.headers['x-socket-id'];
  let target = io.to(`board:${boardId}`);
  if (senderSocketId) target = target.except(String(senderSocketId));
  target.emit(event, { boardId: String(boardId), ...payload });
};

module.exports = {
  HttpError,
  isValidId,
  getRole,
  assertWorkspaceAccess,
  assertBoardAccess,
  assertTaskAccess,
  handleError,
  emitToBoard,
};
