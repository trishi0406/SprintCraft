import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { mockBoards, mockTasks, defaultColumns } from '../data/mockData';

const BoardContext = createContext(null);

export function BoardProvider({ children }) {
  const [boards, setBoards] = useState(() => {
    try {
      const saved = localStorage.getItem('sprintcraft_boards');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return mockBoards;
    } catch {
      return mockBoards;
    }
  });

  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('sprintcraft_tasks');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((t) => t.id));
          const missingMock = mockTasks.filter((t) => !existingIds.has(t.id));
          return [...parsed, ...missingMock];
        }
      }
      return mockTasks;
    } catch {
      return mockTasks;
    }
  });

  const [searchQuery, setSearchQuery] = useState('');

  const resetData = useCallback(() => {
    try {
      localStorage.removeItem('sprintcraft_boards');
      localStorage.removeItem('sprintcraft_tasks');
    } catch (e) {
      console.error(e);
    }
    setBoards(mockBoards);
    setTasks(mockTasks);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('sprintcraft_boards', JSON.stringify(boards));
    } catch (e) {
      console.error(e);
    }
  }, [boards]);

  useEffect(() => {
    try {
      localStorage.setItem('sprintcraft_tasks', JSON.stringify(tasks));
    } catch (e) {
      console.error(e);
    }
  }, [tasks]);

  const getBoard = useCallback(
    (boardId) => boards.find((b) => b.id === boardId) || boards[0] || mockBoards[0],
    [boards]
  );

  const addBoard = useCallback((title, workspaceId = 'ws1') => {
    const newBoard = {
      id: 'b_' + Date.now(),
      title,
      workspaceId,
      columns: defaultColumns,
    };
    setBoards((prev) => [...prev, newBoard]);
    return newBoard;
  }, []);

  const addColumn = useCallback((boardId, title, color = '#8B5CF6') => {
    const newColId = 'col_' + Date.now();
    const newCol = { id: newColId, title, color, icon: 'circle' };
    setBoards((prev) =>
      prev.map((b) =>
        b.id === boardId
          ? { ...b, columns: [...(b.columns || defaultColumns), newCol] }
          : b
      )
    );
  }, []);

  const getBoardTasks = useCallback(
    (boardId) => tasks.filter((t) => t.boardId === boardId),
    [tasks]
  );

  const getColumnTasks = useCallback(
    (boardId, columnId) =>
      tasks
        .filter((t) => (t.boardId === boardId || (!t.boardId && boardId === 'b1')) && t.columnId === columnId)
        .filter((t) => {
          if (!searchQuery) return true;
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

  const moveTask = useCallback((taskId, newColumnId, newOrder) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, columnId: newColumnId, order: newOrder } : t
      )
    );
  }, []);

  const reorderTasks = useCallback((boardId, columnId, orderedIds) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.boardId === boardId && t.columnId === columnId) {
          const idx = orderedIds.indexOf(t.id);
          return idx !== -1 ? { ...t, order: idx } : t;
        }
        return t;
      })
    );
  }, []);

  const addTask = useCallback((task) => {
    const newTask = {
      ...task,
      id: 't_' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
      comments: [],
    };
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  }, []);

  const updateTask = useCallback((taskId, updates) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
    );
  }, []);

  const deleteTask = useCallback((taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

  return (
    <BoardContext.Provider
      value={{
        boards,
        tasks,
        searchQuery,
        setSearchQuery,
        getBoard,
        addBoard,
        addColumn,
        getBoardTasks,
        getColumnTasks,
        moveTask,
        reorderTasks,
        addTask,
        updateTask,
        deleteTask,
        resetData,
        defaultColumns,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
}

export function useBoard() {
  const ctx = useContext(BoardContext);
  if (!ctx) throw new Error('useBoard must be used within BoardProvider');
  return ctx;
}
