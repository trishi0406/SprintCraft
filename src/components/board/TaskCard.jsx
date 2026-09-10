import {
  Calendar,
  Paperclip,
  MessageSquare,
  CheckSquare,
} from 'lucide-react';
import Badge from '../ui/Badge';
import { AvatarGroup } from '../ui/Avatar';

export default function TaskCard({ task, provided, isDragging, onClick }) {
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;
  const subtaskProgress =
    totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  // Format due date
  const formatDue = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    const formatted = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    const isOverdue = diffDays < 0;
    const isSoon = diffDays >= 0 && diffDays <= 3;
    return { formatted, isOverdue, isSoon };
  };

  const due = formatDue(task.dueDate);

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      onClick={onClick}
      className={`glass-card rounded-xl p-4 cursor-pointer group transition-all duration-200 ${
        isDragging
          ? 'shadow-2xl shadow-violet-500/10 ring-1 ring-violet-500/30 scale-[1.02] rotate-1'
          : 'hover:border-slate-600/40 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5'
      }`}
      style={{
        ...provided.draggableProps.style,
      }}
    >
      {/* Tags & Priority */}
      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
        <Badge label={task.priority} size="xs" />
        {task.tag && <Badge label={task.tag} size="xs" />}
      </div>

      {/* Title */}
      <h4 className="text-sm font-medium text-slate-200 leading-snug mb-3 group-hover:text-white transition-colors line-clamp-2">
        {task.title}
      </h4>

      {/* Subtask Progress */}
      {totalSubtasks > 0 && (
        <div className="mb-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <CheckSquare className="w-3.5 h-3.5" />
              <span>
                {completedSubtasks}/{totalSubtasks}
              </span>
            </div>
            <span className="text-xs text-slate-600">{subtaskProgress}%</span>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                subtaskProgress === 100
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-violet-500 to-indigo-500'
              }`}
              style={{ width: `${subtaskProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          {/* Due Date */}
          {due && (
            <div
              className={`flex items-center gap-1 text-xs ${
                due.isOverdue
                  ? 'text-red-400'
                  : due.isSoon
                  ? 'text-amber-400'
                  : 'text-slate-500'
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>{due.formatted}</span>
            </div>
          )}

          {/* Attachments */}
          {task.attachments.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Paperclip className="w-3 h-3" />
              <span>{task.attachments.length}</span>
            </div>
          )}
        </div>

        {/* Assignees */}
        {task.assignees.length > 0 && (
          <AvatarGroup userIds={task.assignees} max={2} size="xs" />
        )}
      </div>
    </div>
  );
}
