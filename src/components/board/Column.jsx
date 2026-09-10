import { Draggable } from '@hello-pangea/dnd';
import { Plus, Circle, Timer, Eye, CheckCircle2 } from 'lucide-react';
import { useBoard } from '../../context/BoardContext';
import TaskCard from './TaskCard';

const columnIcons = {
  circle: Circle,
  timer: Timer,
  eye: Eye,
  'check-circle': CheckCircle2,
};

export default function Column({
  column,
  boardId,
  provided,
  isDraggingOver,
  onTaskClick,
  onAddClick,
  filterPriority,
}) {
  const { getColumnTasks } = useBoard();
  let columnTasks = getColumnTasks(boardId, column.id);

  if (filterPriority) {
    columnTasks = columnTasks.filter((t) => t.priority === filterPriority);
  }

  const Icon = columnIcons[column.icon] || Circle;

  return (
    <div className="w-[320px] flex-shrink-0 flex flex-col h-full">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2.5">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: column.color }}
          />
          <h3 className="text-sm font-semibold text-slate-300">{column.title}</h3>
          <span className="text-xs font-medium text-slate-600 bg-slate-800/80 px-2 py-0.5 rounded-full">
            {columnTasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddClick && onAddClick(column.id)}
          className="p-1 rounded-md text-slate-600 hover:text-slate-400 hover:bg-slate-700/40 transition-colors cursor-pointer"
          title={`Add task to ${column.title}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Droppable Area */}
      <div
        ref={provided.innerRef}
        {...provided.droppableProps}
        className={`flex-1 space-y-2.5 rounded-xl p-2 transition-colors duration-200 overflow-y-auto ${
          isDraggingOver
            ? 'bg-violet-500/5 ring-1 ring-violet-500/20'
            : 'bg-transparent'
        }`}
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}
      >
        {columnTasks.map((task, index) => (
          <Draggable key={task.id} draggableId={task.id} index={index}>
            {(dragProvided, dragSnapshot) => (
              <TaskCard
                task={task}
                provided={dragProvided}
                isDragging={dragSnapshot.isDragging}
                onClick={() => onTaskClick(task)}
              />
            )}
          </Draggable>
        ))}
        {provided.placeholder}

        {/* Empty State */}
        {columnTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Icon className="w-8 h-8 text-slate-700 mb-2" />
            <p className="text-xs text-slate-600">No tasks here</p>
          </div>
        )}
      </div>
    </div>
  );
}
