import {createContext,useContext,useState,useCallback,useEffect,useMemo,useRef,} from 'react';
import { api } from '../lib/api';
import { connectSocket, disconnectSocket, getSocket } from '../lib/socket';
import {normalizeBoard,normalizeTask,normalizeUser,normalizeWorkspace,} from '../lib/normalize';
import { useAuth } from './AuthContext';

const BoardContext = createContext(null);

const defaultColumns = [
  { id: 'todo', title: 'To Do', color: '#64748B', icon: 'circle' },
  { id: 'in-progress', title: 'In Progress', color: '#3B82F6', icon: 'timer' },
  { id: 'in-review', title: 'In Review', color: '#F59E0B', icon: 'eye' },
  { id: 'done', title: 'Done', color: '#10B981', icon: 'check-circle' },
];

export function BoardProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id || null;

  const [workspaces, setWorkspaces] = useState([]);
  const [boards, setBoards] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState({});
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const tasksRef = useRef([]);
  const currentBoardRef = useRef(null);
  const loadRef = useRef(null);

  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  // The first workspace is the active one.
  const workspace = workspaces[0] || null;

  /* ---------------------------- users registry --------------------------- */

  const registerUsers = useCallback((list) => {
    const fresh = list.filter(Boolean);
    if (fresh.length === 0) return;
    setUsers((prev) => {
      const next = { ...prev };
      fresh.forEach((u) => {
        next[u.id] = { ...next[u.id], ...u };
      });
      return next;
    });
  }, []);

  useEffect(() => {
    if (user) registerUsers([user]);
  }, [user, registerUsers]);

  const getUser = useCallback(
    (id) => users[id] || (user && user.id === id ? user : null),
    [users, user]
  );

  const isOnline = useCallback(
    (id) => id === userId || onlineUserIds.includes(id),
    [onlineUserIds, userId]
  );

  /* ------------------------------ task helpers --------------------------- */

  const upsertTask = useCallback(
    (raw) => {
      const { task, users: found } = normalizeTask(raw);
      registerUsers(found);
      setTasks((prev) =>
        prev.some((t) => t.id === task.id)
          ? prev.map((t) => (t.id === task.id ? task : t))
          : [...prev, task]
      );
      return task;
    },
    [registerUsers]
  );

  const replaceBoardTasks = useCallback(
    (boardId, rawTasks) => {
      const normalized = rawTasks.map(normalizeTask);
      registerUsers(normalized.flatMap((n) => n.users));
      setTasks((prev) => [
        ...prev.filter((t) => t.boardId !== boardId),
        ...normalized.map((n) => n.task),
      ]);
    },
    [registerUsers]
  );

  const applyMoves = useCallback((items) => {
    const byId = new Map(items.map((i) => [i.id, i]));
    setTasks((prev) =>
      prev.map((t) => {
        const m = byId.get(t.id);
        return m ? { ...t, columnId: m.columnId, order: m.order } : t;
      })
    );
  }, []);

  /* ------------------------------ initial load --------------------------- */

  const loadAll = useCallback(async () => {
    let wsData = await api.get('/workspaces');

    // Brand-new account: create a starter workspace and board.
    if (wsData.length === 0) {
      const created = await api.post('/workspaces', { name: 'My Workspace', description: 'My first workspace' });
      await api.post('/boards', { title: 'My First Board', workspaceId: created.id || created._id });
      wsData = await api.get('/workspaces');
    }

    const parsed = wsData.map(normalizeWorkspace);
    const wsId = parsed[0].workspace.id;

    const [boardsData, tasksData] = await Promise.all([
      api.get(`/boards?workspaceId=${wsId}`),
      api.get(`/tasks?workspaceId=${wsId}`),
    ]);

    const normalizedTasks = tasksData.map(normalizeTask);
    return {
      workspaces: parsed.map((p) => p.workspace),
      boards: boardsData.map(normalizeBoard),
      tasks: normalizedTasks.map((n) => n.task),
      users: [...parsed.flatMap((p) => p.users), ...normalizedTasks.flatMap((n) => n.users)],
    };
  }, []);

  useEffect(() => {
    if (!userId) {
      loadRef.current = null;
      setWorkspaces([]);
      setBoards([]);
      setTasks([]);
      setOnlineUserIds([]);
      setLoadError('');
      setLoading(false);
      return;
    }

    // Share one request between React StrictMode's double effect run so a new
    // account doesn't get two starter workspaces.
    if (!loadRef.current || loadRef.current.userId !== userId) {
      loadRef.current = { userId, promise: loadAll() };
    }
    const { promise } = loadRef.current;

    let cancelled = false;
    setLoading(true);
    setLoadError('');
    promise
      .then((data) => {
        if (cancelled) return;
        setWorkspaces(data.workspaces);
        setBoards(data.boards);
        setTasks(data.tasks);
        registerUsers(data.users);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        loadRef.current = null;
        setLoadError(err.message || 'Failed to load your data');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId, loadAll, registerUsers]);

  const reload = useCallback(() => {
    loadRef.current = null;
    if (!userId) return;
    setLoading(true);
    setLoadError('');
    loadRef.current = { userId, promise: loadAll() };
    loadRef.current.promise
      .then((data) => {
        setWorkspaces(data.workspaces);
        setBoards(data.boards);
        setTasks(data.tasks);
        registerUsers(data.users);
      })
      .catch((err) => {
        loadRef.current = null;
        setLoadError(err.message || 'Failed to load your data');
      })
      .finally(() => setLoading(false));
  }, [userId, loadAll, registerUsers]);

  /* ------------------------------ real-time ------------------------------ */

  useEffect(() => {
    if (!userId) return undefined;
    const socket = connectSocket();
    if (!socket) return undefined;

    const joinCurrent = () => {
      if (currentBoardRef.current) {
        socket.emit('join:board', { boardId: currentBoardRef.current });
      }
    };

    const onConnect = () => {
      joinCurrent();
    };
    const onCreated = ({ task }) => task && upsertTask(task);
    const onUpdated = ({ task }) => task && upsertTask(task);
    const onDeleted = ({ taskId }) => setTasks((prev) => prev.filter((t) => t.id !== taskId));
    const onMoved = ({ items }) => items && applyMoves(items);
    const onBoardUpdated = ({ boardId, columns }) => {
      setBoards((prev) =>
        prev.map((b) =>
          b.id === boardId ? normalizeBoard({ ...b, _id: b.id, columns }) : b
        )
      );
    };
    const onPresence = ({ boardId, activeUsers }) => {
      if (boardId !== currentBoardRef.current) return;
      const list = activeUsers.map((u) => normalizeUser({ ...u, id: u.userId }));
      registerUsers(list);
      setOnlineUserIds(list.map((u) => u.id));
    };

    socket.on('connect', onConnect);
    socket.on('card:created', onCreated);
    socket.on('card:updated', onUpdated);
    socket.on('card:deleted', onDeleted);
    socket.on('card:moved', onMoved);
    socket.on('board:updated', onBoardUpdated);
    socket.on('presence:sync', onPresence);
    if (socket.connected) joinCurrent();

    return () => {
      disconnectSocket();
    };
  }, [userId, upsertTask, applyMoves, registerUsers]);

  const joinBoard = useCallback((boardId) => {
    currentBoardRef.current = boardId;
    const socket = getSocket();
    if (socket && socket.connected) socket.emit('join:board', { boardId });
  }, []);

  const leaveBoard = useCallback((boardId) => {
    const socket = getSocket();
    if (socket && socket.connected) socket.emit('leave:board', { boardId });
    if (currentBoardRef.current === boardId) currentBoardRef.current = null;
    setOnlineUserIds([]);
  }, []);

  /** Fetch the freshest tasks for a board (used when opening it). */
  const refreshBoard = useCallback(
    async (boardId) => {
      const data = await api.get(`/boards/${boardId}`);
      setBoards((prev) => {
        const nb = normalizeBoard(data);
        return prev.some((b) => b.id === nb.id) ? prev.map((b) => (b.id === nb.id ? nb : b)) : [...prev, nb];
      });
      replaceBoardTasks(String(data.id || data._id), data.tasks || []);
    },
    [replaceBoardTasks]
  );

  /* -------------------------------- boards ------------------------------- */

  const getBoard = useCallback((boardId) => boards.find((b) => b.id === boardId) || null, [boards]);

  const addBoard = useCallback(
    async (title) => {
      if (!workspace) throw new Error('No workspace available');
      const data = await api.post('/boards', { title, workspaceId: workspace.id });
      const board = normalizeBoard(data);
      setBoards((prev) => [...prev, board]);
      return board;
    },
    [workspace]
  );

  const addColumn = useCallback(
    async (boardId, title, color = '#8B5CF6') => {
      const board = boards.find((b) => b.id === boardId);
      if (!board) return;
      const columns = [
        ...(board.columns.length ? board.columns : defaultColumns),
        { id: 'col_' + Date.now(), title, color, icon: 'circle' },
      ];
      const data = await api.put(`/boards/${boardId}/columns`, { columns });
      const nb = normalizeBoard(data);
      setBoards((prev) => prev.map((b) => (b.id === nb.id ? nb : b)));
    },
    [boards]
  );

  /* --------------------------------- tasks ------------------------------- */

  const getBoardTasks = useCallback((boardId) => tasks.filter((t) => t.boardId === boardId), [tasks]);

  const getColumnTasks = useCallback(
    (boardId, columnId, { ignoreSearch = false } = {}) =>
      tasks
        .filter((t) => t.boardId === boardId && t.columnId === columnId)
        .filter((t) => {
          if (ignoreSearch || !searchQuery) return true;
          const q = searchQuery.toLowerCase();
          return (
            t.title.toLowerCase().includes(q) ||
            (t.description && t.description.toLowerCase().includes(q)) ||
            (t.tag && t.tag.toLowerCase().includes(q))
          );
        })
        .sort((a, b) => a.order - b.order),
    [tasks, searchQuery]
  );

  /** Optimistically apply a drag & drop result and persist it. */
  const moveTasks = useCallback(
    async (boardId, items) => {
      const previous = tasksRef.current.filter((t) => items.some((i) => i.id === t.id));
      applyMoves(items);
      try {
        await api.put('/tasks/reorder-many', { boardId, items });
      } catch (err) {
        // Roll back to what we had before the drag.
        applyMoves(previous.map((t) => ({ id: t.id, columnId: t.columnId, order: t.order })));
        throw err;
      }
    },
    [applyMoves]
  );

  const addTask = useCallback(
    async ({ attachmentFile, ...task }) => {
      let body;
      if (attachmentFile) {
        body = new FormData();
        Object.entries(task).forEach(([k, v]) => {
          if (v === null || v === undefined) return;
          body.append(k, Array.isArray(v) ? JSON.stringify(v) : v);
        });
        body.append('attachment', attachmentFile);
      } else {
        body = task;
      }
      const data = await api.post('/tasks', body);
      return upsertTask(data);
    },
    [upsertTask]
  );

  const updateTask = useCallback(
    async (taskId, updates) => {
      const before = tasksRef.current.find((t) => t.id === taskId);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t)));
      try {
        const data = await api.put(`/tasks/${taskId}`, updates);
        return upsertTask(data);
      } catch (err) {
        if (before) setTasks((prev) => prev.map((t) => (t.id === taskId ? before : t)));
        throw err;
      }
    },
    [upsertTask]
  );

  const addComment = useCallback(
    async (taskId, text) => {
      const data = await api.post(`/tasks/${taskId}/comments`, { text });
      return upsertTask(data);
    },
    [upsertTask]
  );

  const deleteTask = useCallback(async (taskId) => {
    const before = tasksRef.current.find((t) => t.id === taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    try {
      await api.del(`/tasks/${taskId}`);
    } catch (err) {
      if (before) setTasks((prev) => [...prev, before]);
      throw err;
    }
  }, []);

  /* ------------------------------- workspace ----------------------------- */

  const updateWorkspace = useCallback(async (updates) => {
    if (!workspace) return;
    const data = await api.put(`/workspaces/${workspace.id}`, updates);
    const { workspace: ws, users: found } = normalizeWorkspace(data);
    registerUsers(found);
    setWorkspaces((prev) => prev.map((w) => (w.id === ws.id ? ws : w)));
  }, [workspace, registerUsers]);

  const addWorkspaceMember = useCallback(async (email, role = 'Member') => {
    if (!workspace) return;
    const data = await api.post(`/workspaces/${workspace.id}/members`, { email, role });
    const { workspace: ws, users: found } = normalizeWorkspace(data);
    registerUsers(found);
    setWorkspaces((prev) => prev.map((w) => (w.id === ws.id ? ws : w)));
  }, [workspace, registerUsers]);

const members = useMemo(
  () =>
    (workspace?.members || [])
      .map((m) => ({ ...(users[m.userId] || {}), id: m.userId, role: m.role }))
      .filter((m) => m.name),
  [workspace, users]
);

// DEBUG
console.log('WORKSPACE:', workspace);
console.log('WORKSPACE MEMBERS:', workspace?.members);
console.log('ALL USERS:', users);
console.log('ASSIGNEE MEMBERS:', members);

  const value = {
    loading,
    loadError,
    reload,
    workspace,
    members,
    boards,
    tasks,
    searchQuery,
    setSearchQuery,
    getUser,
    isOnline,
    onlineUserIds,
    joinBoard,
    leaveBoard,
    refreshBoard,
    getBoard,
    addBoard,
    addColumn,
    getBoardTasks,
    getColumnTasks,
    moveTasks,
    addTask,
    updateTask,
    addComment,
    deleteTask,
    updateWorkspace,
    addWorkspaceMember,
    defaultColumns,
  };

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBoard() {
  const ctx = useContext(BoardContext);
  if (!ctx) throw new Error('useBoard must be used within BoardProvider');
  return ctx;
}
