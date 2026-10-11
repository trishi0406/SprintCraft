const Board = require('../models/Board');
const Task = require('../models/Task');
const {assertWorkspaceAccess, assertBoardAccess, handleError, emitToBoard} = require('../utils/access');

const TASK_POPULATE = [{ path: 'assignees', select: 'name email avatar' }, { path: 'comments.userId', select: 'name email avatar' }];

const listBoards = async (req, res) => {
  try{
    const { workspaceId } = req.query;
    if(!workspaceId){
      return res.status(400).json({ message: 'workspaceId query parameter is required' });
    }
    await assertWorkspaceAccess(workspaceId, req.user._id);
    const boards = await Board.find({ workspaceId }).sort({ createdAt: 1 });
    return res.json(boards);
  } 
  catch (error) {
    return handleError(res, error, 'List Boards Error', 'Server error listing boards');
  }
}

const getBoard = async (req, res) => {
  try {
    const { board } = await assertBoardAccess(req.params.id, req.user._id);
    const tasks = await Task.find({ boardId: board._id }).populate(TASK_POPULATE).sort({ order: 1 });
    return res.json({ ...board.toJSON(), tasks });
  } catch (error) {
    return handleError(res, error, 'Get Board Error', 'Server error retrieving board');
  }
}

const createBoard = async (req, res) => {
  try{
    const { title, workspaceId, columns } = req.body;

    if(!title || !title.trim() || !workspaceId) {
      return res.status(400).json({ message: 'Board title and workspaceId are required' });
    }

    const boardData = { title: title.trim(), workspaceId };
    if(Array.isArray(columns) && columns.length > 0) {
      boardData.columns = columns;
    }

    const board = await Board.create(boardData);
    return res.status(201).json(board);
  } 
  catch (error) {
    return handleError(res, error, 'Create Board Error', 'Server error creating board');
  }
}

const updateColumns = async (req, res) => {
  try{
    const { columns } = req.body;

    if(!Array.isArray(columns) || columns.length === 0) {
      return res.status(400).json({ message: 'Valid columns array is required' });
    }

    const { board } = await assertBoardAccess(req.params.id, req.user._id);

    board.columns = columns.map((c, i) => ({
      id: String(c.id),
      title: String(c.title),
      order: i,
      color: c.color || '#8B5CF6',
      icon: c.icon || 'circle',
    }))
    await board.save();

    emitToBoard(req, board._id, 'board:updated', { columns: board.columns });
    return res.json(board);
  } 
  catch (error) {
    return handleError(res, error, 'Update Columns Error', 'Server error updating board columns');
  }
}

module.exports = {listBoards, getBoard, createBoard, updateColumns}
