const mongoose = require('mongoose');
const Task = require('../models/Task');
const Board = require('../models/Board');
const cloudinary = require('../config/cloudinary');
const {
  HttpError,
  assertBoardAccess,
  assertTaskAccess,
  assertWorkspaceAccess,
  handleError,
  emitToBoard,
} = require('../utils/access');

const TASK_POPULATE = [
  { path: 'assignees', select: 'name email avatar' },
  { path: 'comments.userId', select: 'name email avatar' },
]

const loadPopulatedTask = (id) => Task.findById(id).populate(TASK_POPULATE);

const parseMaybeJSON = (value, fallback) => {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    throw new HttpError(400, 'Malformed JSON field in request');
  }
}

const cleanSubtasks = (list) =>
  (Array.isArray(list) ? list : [])
    .filter((s) => s && String(s.title || '').trim())
    .map((s) => {
      const out = { title: String(s.title).trim(), completed: !!s.completed };
      const rawId = s._id || s.id;
      if (rawId && mongoose.Types.ObjectId.isValid(rawId)) out._id = rawId;
      return out;
    })

const cleanAssignees = (list) =>
  (Array.isArray(list) ? list : [])
    .map((a) => (a && typeof a === 'object' ? a._id || a.id : a))
    .filter((a) => mongoose.Types.ObjectId.isValid(a));

const uploadToCloudinary = (fileBuffer, originalname) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'sprintcraft_attachments',
        resource_type: 'auto',
        public_id: `${Date.now()}_${originalname.replace(/[^\w.-]+/g, '_')}`,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          filename: originalname,
          public_id: result.public_id,
        });
      }
    );
    stream.end(fileBuffer);
})

const listTasks = async (req, res) => {
  try {
    const { workspaceId, boardId } = req.query;
    let boardIds;

    if (boardId) {
      await assertBoardAccess(boardId, req.user._id);
      boardIds = [boardId];
    } else if (workspaceId) {
      await assertWorkspaceAccess(workspaceId, req.user._id);
      const boards = await Board.find({ workspaceId }).select('_id');
      boardIds = boards.map((b) => b._id);
    } else {
      return res.status(400).json({ message: 'workspaceId or boardId query parameter is required' });
    }

    const tasks = await Task.find({ boardId: { $in: boardIds } })
      .populate(TASK_POPULATE)
      .sort({ order: 1 });
    return res.json(tasks);
  } catch (error) {
    return handleError(res, error, 'List Tasks Error', 'Server error listing tasks');
  }
}

const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      boardId,
      columnId = 'todo',
      priority = 'Medium',
      tag = '',
      dueDate,
      order,
    } = req.body;

    if (!title || !title.trim() || !boardId) {
      return res.status(400).json({ message: 'Task title and boardId are required' });
    }

    const { board } = await assertBoardAccess(boardId, req.user._id);

    if (!board.columns.some((c) => c.id === columnId)) {
      return res.status(400).json({ message: `Column "${columnId}" does not exist on this board` });
    }

    const assignees = cleanAssignees(parseMaybeJSON(req.body.assignees, []));
    const subtasks = cleanSubtasks(parseMaybeJSON(req.body.subtasks, []));

    const attachments = [];
    if (req.file) {
      attachments.push(await uploadToCloudinary(req.file.buffer, req.file.originalname));
    }

    let finalOrder = Number(order);
    if (!Number.isFinite(finalOrder) || order === undefined || order === '') {
      const last = await Task.findOne({ boardId, columnId }).sort({ order: -1 }).select('order');
      finalOrder = last ? last.order + 1 : 0;
    }

    const task = await Task.create({
      title: title.trim(),
      description: description || '',
      boardId,
      columnId,
      priority,
      tag,
      dueDate: dueDate || null,
      assignees,
      subtasks,
      attachments,
      order: finalOrder,
    });

    const populatedTask = await loadPopulatedTask(task._id);
    emitToBoard(req, boardId, 'card:created', { task: populatedTask });
    return res.status(201).json(populatedTask);
  } catch (error) {
    return handleError(res, error, 'Create Task Error', 'Server error creating task');
  }
}

const ALLOWED_UPDATE_FIELDS = ['title', 'description', 'priority', 'tag', 'dueDate', 'columnId'];

const updateTask = async (req, res) => {
  try {
    const { task, board } = await assertTaskAccess(req.params.id, req.user._id);
    const body = req.body || {};

    for (const field of ALLOWED_UPDATE_FIELDS) {
      if (body[field] === undefined) continue;
      if (field === 'title' && !String(body.title).trim()) {
        return res.status(400).json({ message: 'Title cannot be empty' });
      }
      if (field === 'columnId' && !board.columns.some((c) => c.id === body.columnId)) {
        return res.status(400).json({ message: `Column "${body.columnId}" does not exist on this board` });
      }
      task[field] = field === 'dueDate' && !body.dueDate ? null : body[field];
    }

    if (body.assignees !== undefined) {
      task.assignees = cleanAssignees(parseMaybeJSON(body.assignees, []));
    }
    if (body.subtasks !== undefined) {
      task.subtasks = cleanSubtasks(parseMaybeJSON(body.subtasks, []));
    }
    if (req.file) {
      task.attachments.push(await uploadToCloudinary(req.file.buffer, req.file.originalname));
    }

    await task.save();

    const updatedTask = await loadPopulatedTask(task._id);
    emitToBoard(req, task.boardId, 'card:updated', { task: updatedTask });
    return res.json(updatedTask);
  } catch (error) {
    return handleError(res, error, 'Update Task Error', 'Server error updating task');
  }
}

const addComment = async (req, res) => {
  try {
    const text = String(req.body.text || '').trim();
    if (!text) return res.status(400).json({ message: 'Comment text is required' });

    const { task } = await assertTaskAccess(req.params.id, req.user._id);
    task.comments.push({ userId: req.user._id, text });
    await task.save();

    const updatedTask = await loadPopulatedTask(task._id);
    emitToBoard(req, task.boardId, 'card:updated', { task: updatedTask });
    return res.status(201).json(updatedTask);
  } catch (error) {
    return handleError(res, error, 'Add Comment Error', 'Server error adding comment');
  }
}

const deleteTask = async (req, res) => {
  try {
    const { task } = await assertTaskAccess(req.params.id, req.user._id);
    const boardId = task.boardId;
    await task.deleteOne();

    emitToBoard(req, boardId, 'card:deleted', { taskId: String(task._id) });
    return res.json({ message: 'Task deleted successfully', id: String(task._id) });
  } catch (error) {
    return handleError(res, error, 'Delete Task Error', 'Server error deleting task');
  }
}

const reorderTask = async (req, res) => {
  try {
    const { columnId, order } = req.body;

    if (!columnId || order === undefined || Number.isNaN(Number(order))) {
      return res.status(400).json({ message: 'columnId and numeric order are required' });
    }

    const { task, board } = await assertTaskAccess(req.params.id, req.user._id);
    if (!board.columns.some((c) => c.id === columnId)) {
      return res.status(400).json({ message: `Column "${columnId}" does not exist on this board` });
    }

    task.columnId = columnId;
    task.order = Number(order);
    await task.save();

    emitToBoard(req, task.boardId, 'card:moved', {
      items: [{ id: String(task._id), columnId: task.columnId, order: task.order }],
    });
    return res.json({
      message: 'Task reordered successfully',
      id: task._id,
      columnId: task.columnId,
      order: task.order,
    });
  } catch (error) {
    return handleError(res, error, 'Reorder Task Error', 'Server error reordering task');
  }
}

const reorderMany = async (req, res) => {
  try {
    const { boardId, items } = req.body;
    if (!boardId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'boardId and a non-empty items array are required' });
    }

    const { board } = await assertBoardAccess(boardId, req.user._id);
    const validColumns = new Set(board.columns.map((c) => c.id));

    const ops = [];
    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.id) || !validColumns.has(item.columnId)) {
        return res.status(400).json({ message: 'Invalid task id or column in items' });
      }
      ops.push({
        updateOne: {
          filter: { _id: item.id, boardId },
          update: { $set: { columnId: item.columnId, order: Number(item.order) || 0 } },
        },
      });
    }

    await Task.bulkWrite(ops);

    emitToBoard(req, boardId, 'card:moved', {
      items: items.map((i) => ({ id: String(i.id), columnId: i.columnId, order: Number(i.order) || 0 })),
    });
    return res.json({ message: 'Tasks reordered successfully', count: items.length });
  } catch (error) {
    return handleError(res, error, 'Reorder Many Error', 'Server error reordering tasks');
  }
}

module.exports = {
  listTasks,
  createTask,
  updateTask,
  addComment,
  deleteTask,
  reorderTask,
  reorderMany,
}
