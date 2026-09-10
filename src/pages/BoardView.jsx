import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { Filter, SlidersHorizontal, Users, Plus, Check } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import Column from '../components/board/Column';
import TaskDetailModal from '../components/modals/TaskDetailModal';
import CreateTaskModal from '../components/modals/CreateTaskModal';
import { AvatarGroup } from '../components/ui/Avatar';
import { mockUsers } from '../data/mockData';
import Badge from '../components/ui/Badge';

const defaultKanbanColumns = [
  { id: 'todo', title: 'To Do', color: '#64748B', icon: 'circle' },
  { id: 'in-progress', title: 'In Progress', color: '#3B82F6', icon: 'timer' },
  { id: 'in-review', title: 'In Review', color: '#F59E0B', icon: 'eye' },
  { id: 'done', title: 'Done', color: '#10B981', icon: 'check-circle' },
];

export default function BoardView() {
  const { boardId = 'b1' } = useParams();
  const { getBoard, getColumnTasks, moveTask, reorderTasks, addColumn } = useBoard();
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterPriority, setFilterPriority] = useState(null);
  const [activeColumnForTask, setActiveColumnForTask] = useState(null);

  // New column form state
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  const board = getBoard(boardId);
  const columns = (board && Array.isArray(board.columns) && board.columns.length > 0)
    ? board.columns
    : defaultKanbanColumns;

  const handleCreateColumn = (e) => {
    e.preventDefault();
    if (!newColumnTitle.trim()) return;
    addColumn(boardId, newColumnTitle.trim(), '#8B5CF6');
    setNewColumnTitle('');
    setIsAddingColumn(false);
  };

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

      // Get tasks in destination column
      const destTasks = getColumnTasks(boardId, destColumn).map((t) => t.id);

      // Remove from source if moving within same column
      if (sourceColumn === destColumn) {
        destTasks.splice(source.index, 1);
      }

      // Insert at new position
      destTasks.splice(destination.index, 0, draggableId);

      // Move the task
      moveTask(draggableId, destColumn, destination.index);

      // Reorder all tasks in destination column
      reorderTasks(boardId, destColumn, destTasks);

      // Reorder source column if cross-column
      if (sourceColumn !== destColumn) {
        const sourceTasks = getColumnTasks(boardId, sourceColumn)
          .filter((t) => t.id !== draggableId)
          .map((t) => t.id);
        reorderTasks(boardId, sourceColumn, sourceTasks);
      }
    },
    [boardId, getColumnTasks, moveTask, reorderTasks]
  );

  const boardTitle = board?.title || 'Sprint Board';
  const priorities = ['High', 'Medium', 'Low'];

  return (
    <div className="h-full flex flex-col animate-in">
      {/* Board Header */}
      <div className="px-6 py-4 border-b border-slate-800/40 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-100">{boardTitle}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {columns.length} columns ·{' '}
            {getColumnTasks(boardId, 'done').length} completed
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Assignees */}
          <div className="hidden sm:block">
            <AvatarGroup
              userIds={mockUsers.filter((u) => u.online).map((u) => u.id)}
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
                    onTaskClick={(task) => setSelectedTask(task)}
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
        onClose={() => setSelectedTask(null)}
      />

      {/* Column Add Task Modal */}
      <CreateTaskModal
        isOpen={!!activeColumnForTask}
        defaultColumnId={activeColumnForTask || 'todo'}
        defaultBoardId={boardId}
        onClose={() => setActiveColumnForTask(null)}
      />
    </div>
  );
}
