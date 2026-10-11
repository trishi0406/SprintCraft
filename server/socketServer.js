const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Board = require('./models/Board');
const { assertWorkspaceAccess } = require('./utils/access');

const activeBoardUsers = new Map();

function initSocketServer(httpServer) {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  const io = new Server(httpServer, {
    cors: {
      origin: [clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });
  io.use(async (socket, next) => {
    try {
      let token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;

      if (token && token.startsWith('Bearer ')) {
        token = token.split(' ')[1];
      }

      if (!token) {
        return next(new Error('Authentication error: Token not provided'));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'super_secret_jwt_key_sprintcraft_2026'
      );
      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = {
        userId: String(user._id),
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        initials: user.initials,
        color: user.color,
      };

      next();
    } catch (err) {
      console.error('Socket authentication error:', err.message);
      return next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  const getActiveUsersForBoard = (boardId) => {
    const boardMap = activeBoardUsers.get(boardId);
    if (!boardMap) return [];
    return Array.from(boardMap.values()).map(({ socketsCount, ...userData }) => userData);
  };

  const syncPresence = (boardId) => {
    io.to(`board:${boardId}`).emit('presence:sync', {
      boardId,
      activeUsers: getActiveUsersForBoard(boardId),
    });
  };

  const removeUserFromBoard = (boardId, userId) => {
    const boardMap = activeBoardUsers.get(boardId);
    if (!boardMap) return;

    const userEntry = boardMap.get(userId);
    if (userEntry) {
      userEntry.socketsCount -= 1;
      if (userEntry.socketsCount <= 0) {
        boardMap.delete(userId);
      }
    }

    if (boardMap.size === 0) {
      activeBoardUsers.delete(boardId);
    }
  };

  io.on('connection', (socket) => {
    let currentBoardId = null;

    socket.on('join:board', async ({ boardId } = {}) => {
      if (!boardId || currentBoardId === boardId) return;

      try {
        const board = await Board.findById(boardId).select('workspaceId');
        if (!board) return socket.emit('board:error', { boardId, message: 'Board not found' });
        await assertWorkspaceAccess(board.workspaceId, socket.user.userId);
      } catch (err) {
        return socket.emit('board:error', { boardId, message: err.message || 'Access denied' });
      }
      if (currentBoardId === boardId) return;

      if (currentBoardId) {
        socket.leave(`board:${currentBoardId}`);
        removeUserFromBoard(currentBoardId, socket.user.userId);
        syncPresence(currentBoardId);
      }

      currentBoardId = boardId;
      socket.join(`board:${boardId}`);

      if (!activeBoardUsers.has(boardId)) {
        activeBoardUsers.set(boardId, new Map());
      }

      const boardMap = activeBoardUsers.get(boardId);
      const existing = boardMap.get(socket.user.userId);

      if (existing) {
        existing.socketsCount += 1;
      } else {
        boardMap.set(socket.user.userId, { ...socket.user, socketsCount: 1 });
      }

      syncPresence(boardId);
    });

    socket.on('leave:board', ({ boardId } = {}) => {
      const targetBoardId = boardId || currentBoardId;
      if (!targetBoardId || targetBoardId !== currentBoardId) return;

      socket.leave(`board:${targetBoardId}`);
      removeUserFromBoard(targetBoardId, socket.user.userId);
      syncPresence(targetBoardId);
      currentBoardId = null;
    });

    socket.on('disconnect', () => {
      if (currentBoardId && socket.user) {
        removeUserFromBoard(currentBoardId, socket.user.userId);
        syncPresence(currentBoardId);
      }
    });
  });

  return io;
}

module.exports = { initSocketServer };
