import { useState, useCallback, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { Filter, SlidersHorizontal, Plus, Check } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import Column from '../components/board/Column';
import TaskDetailModal from '../components/modals/TaskDetailModal';
import CreateTaskModal from '../components/modals/CreateTaskModal';
import { AvatarGroup } from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';

export default function BoardView() {
  const { boardId } = useParams();
  const {
    loading,
    getBoard,
    getColumnTasks,
    moveTasks,
    addColumn,
    joinBoard,
    leaveBoard,
    refreshBoard,
    onlineUserIds,
    searchQuery,
    tasks,
  } = useBoard();
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [actionError, setActionError] = useState('');
  const [filterPriority, setFilterPriority] = useState(null);
  const [activeColumnForTask, setActiveColumnForTask] = useState(null);

  // New column form state
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  const board = getBoard(boardId);
  const boardExists = !!board;
  const columns = board?.columns || [];
  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || null;

  // Join the realtime room for this board and pull the freshest tasks.
  useEffect(() => {
    if (!boardId || !boardExists) return undefined;
    joinBoard(boardId);
    refreshBoard(boardId).catch((err) => setActionError(err.message));
    return () => leaveBoard(boardId);
  }, [boardId, boardExists, joinBoard, leaveBoard, refreshBoard]);

  const handleCreateColumn = async (e) => {
    e.preventDefault();
    if (!newColumnTitle.trim()) return;
    try {
      await addColumn(boardId, newColumnTitle.trim(), '#8B5CF6');
      setNewColumnTitle('');
      setIsAddingColumn(false);
    } catch (err) {
      setActionError(err.message);
    }
  };

  // Reordering while a filter/search hides cards would give wrong positions.
  const dragDisabled = !!filterPriority || !!searchQuery;

  const onDragEnd = useCallback(
    (result) => {
      const { destination, source, draggableId } = result;
      if (!destination) return;
      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      )
        return;

      const sourceColumn = source.droppableId;
      const destColumn = destination.droppableId;
      const opts = { ignoreSearch: true };

      const destIds = getColumnTasks(boardId, destColumn, opts).map((t) => t.id);
      if (sourceColumn === destColumn) destIds.splice(source.index, 1);
      destIds.splice(destination.index, 0, draggableId);

      const items = destIds.map((id, index) => ({ id, columnId: destColumn, order: index }));

      if (sourceColumn !== destColumn) {
        getColumnTasks(boardId, sourceColumn, opts)
          .filter((t) => t.id !== draggableId)
          .forEach((t, index) => items.push({ id: t.id, columnId: sourceColumn, order: index }));
      }

      setActionError('');
      moveTasks(boardId, items).catch((err) =>
        setActionError(`Could not move task: ${err.message}`)
      );
    },
    [boardId, getColumnTasks, moveTasks]
  );

  const boardTitle = board?.title || 'Sprint Board';
  const priorities = ['High', 'Medium', 'Low'];

  if (loading && !boardExists) {
    return <div className="p-8 text-sm text-slate-500">Loading board...</div>;
  }

  if (!boardExists) {
    return (
      <div className="p-8 max-w-md mx-auto text-center space-y-3">
        <h1 className="text-xl font-bold text-slate-100">Board not found</h1>
        <p className="text-sm text-slate-500">
          This board doesn't exist or you don't have access to it.
        </p>
        <Link to="/dashboard" className="text-violet-400 hover:text-violet-300 text-sm">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col animate-in">
      {/* Board Header */}
      <div className="px-6 py-4 border-b border-slate-800/40 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-100">{boardTitle}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {columns.length} columns ·{' '}
            {getColumnTasks(boardId, 'done', { ignoreSearch: true }).length} completed
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Assignees */}
          <div className="hidden sm:block">
            <AvatarGroup
              userIds={onlineUserIds}
              max={3}
              size="sm"
            />
          </div>

          <div className="w-px h-8 bg-slate-700/40 hidden sm:block" />

          {/* Priority filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-slate-500" />
            {priorities.map((p) => (
              <button
                key={p}
                onClick={() =>
                  setFilterPriority(filterPriority === p ? null : p)
                }
                className={`cursor-pointer transition-all duration-200 ${
                  filterPriority === p ? 'scale-110' : 'opacity-60 hover:opacity-100'
                }`}
              >
                <Badge label={p} size="xs" />
              </button>
            ))}
            {filterPriority && (
              <button
                onClick={() => setFilterPriority(null)}
                className="text-xs text-slate-500 hover:text-slate-300 ml-1 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <button className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/40 transition-colors cursor-pointer">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {actionError && (
        <div className="mx-6 mt-3 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400 flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError('')} className="text-xs text-red-300 hover:text-white cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Board Canvas */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-5 p-6 h-full min-w-max">
            {columns.map((column) => (
              <Droppable key={column.id} droppableId={column.id}>
                {(provided, snapshot) => (
                  <Column
                    column={column}
                    boardId={boardId}
                    provided={provided}
                    isDraggingOver={snapshot.isDraggingOver}
                    onTaskClick={(task) => setSelectedTaskId(task.id)}
                    dragDisabled={dragDisabled}
                    onAddClick={(colId) => setActiveColumnForTask(colId)}
                    filterPriority={filterPriority}
                  />
                )}
              </Droppable>
            ))}
            {/* Add Column Button / Form */}
            <div className="w-[300px] flex-shrink-0">
              {isAddingColumn ? (
                <form
                  onSubmit={handleCreateColumn}
                  className="glass-card rounded-xl p-3 border border-slate-700/50 space-y-2 animate-in fade-in"
                >
                  <input
                    type="text"
                    placeholder="Column title..."
                    autoFocus
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-violet-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingColumn(false)}
                      className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Add Column
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setIsAddingColumn(true)}
                  className="w-full h-12 rounded-xl border-2 border-dashed border-slate-800/80 hover:border-violet-500/40 bg-slate-900/30 hover:bg-slate-800/20 flex items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-300 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Column
                </button>
              )}
            </div>
          </div>
        </DragDropContext>
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTaskId(null)}
      />

      {/* Column Add Task Modal */}
      <CreateTaskModal
        isOpen={!!activeColumnForTask}
        defaultColumnId={activeColumnForTask || columns[0]?.id || 'todo'}
        defaultBoardId={boardId}
        onClose={() => setActiveColumnForTask(null)}
      />
    </div>
  );
}
