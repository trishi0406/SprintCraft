import { useState, useEffect } from 'react';
import {
  Calendar,
  Paperclip,
  CheckSquare,
  Square,
  Clock,
  Trash2,
  FileText,
  MessageSquare,
  Edit3,
  Check,
  X,
  Send,
} from 'lucide-react';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import Input, { Textarea, Select } from '../ui/Input';
import { useBoard } from '../../context/BoardContext';
import { useAuth } from '../../context/AuthContext';
import { mockUsers } from '../../data/mockData';

export default function TaskDetailModal({ task, isOpen, onClose }) {
  const { updateTask, deleteTask } = useBoard();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  // Edit form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [tag, setTag] = useState('Frontend');
  const [dueDate, setDueDate] = useState('');

  // Comment state
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setPriority(task.priority || 'Medium');
      setTag(task.tag || 'Frontend');
      setDueDate(task.dueDate || '');
      setIsEditing(false);
    }
  }, [task]);

  if (!task) return null;

  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;
  const progress =
    totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  const toggleSubtask = (subtaskId) => {
    const updatedSubtasks = task.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    updateTask(task.id, { subtasks: updatedSubtasks });
  };

  const handleSaveEdit = () => {
    if (!title.trim()) return;
    updateTask(task.id, {
      title: title.trim(),
      description: description.trim(),
      priority,
      tag,
      dueDate: dueDate || null,
    });
    setIsEditing(false);
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const newComment = {
      id: 'c_' + Date.now(),
      userId: user?.id || 'u1',
      userName: user?.name || 'Trishi Sharma',
      text: commentText.trim(),
      time: 'Just now',
    };
    const updatedComments = [...(task.comments || []), newComment];
    updateTask(task.id, { comments: updatedComments });
    setCommentText('');
  };

  const handleDelete = () => {
    deleteTask(task.id);
    onClose();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No due date';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const priorityDot = {
    High: 'bg-red-400',
    Medium: 'bg-amber-400',
    Low: 'bg-emerald-400',
  };

  const priorities = ['High', 'Medium', 'Low'];
  const tags = ['Frontend', 'Backend', 'Design', 'DevOps'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={null} size="lg">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Badge label={isEditing ? priority : task.priority} />
            {(isEditing ? tag : task.tag) && <Badge label={isEditing ? tag : task.tag} />}
            <span className="text-xs text-slate-600 ml-auto">
              {task.id}
            </span>
          </div>

          {isEditing ? (
            <div className="space-y-4 bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl">
              <Input
                label="Task Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Textarea
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  {priorities.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </Select>
                <Select
                  label="Tag"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                >
                  {tags.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-lg bg-slate-800/60 border border-slate-700/60 px-4 py-2 text-sm text-slate-100 outline-none [color-scheme:dark]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button size="sm" icon={Check} onClick={handleSaveEdit}>
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-slate-100 leading-snug">
                {task.title}
              </h2>
              {task.description && (
                <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                  {task.description}
                </p>
              )}
            </>
          )}
        </div>

        {/* Meta Info */}
        {!isEditing && (
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Details
              </h4>

              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500">Due Date</p>
                  <p className="text-slate-300 font-medium">{formatDate(task.dueDate)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className={`w-4 h-4 rounded-full flex-shrink-0 ${priorityDot[task.priority]}`} />
                <div>
                  <p className="text-xs text-slate-500">Priority</p>
                  <p className="text-slate-300 font-medium">{task.priority}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500">Created</p>
                  <p className="text-slate-300 font-medium">{formatDate(task.createdAt)}</p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Assignees
              </h4>
              {task.assignees.length > 0 ? (
                <div className="space-y-2.5">
                  {task.assignees.map((userId) => {
                    const u = mockUsers.find((m) => m.id === userId);
                    return u ? (
                      <div key={u.id} className="flex items-center gap-2.5">
                        <Avatar userId={u.id} size="sm" showStatus />
                        <div>
                          <p className="text-sm text-slate-300 font-medium">{u.name}</p>
                          <p className="text-xs text-slate-600">{u.email}</p>
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-600">No assignees</p>
              )}
            </div>
          </div>
        )}

        {/* Subtasks */}
        {totalSubtasks > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-slate-500" />
                Subtasks
              </h4>
              <span className="text-xs text-slate-500">
                {completedSubtasks}/{totalSubtasks} · {progress}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  progress === 100
                    ? 'bg-emerald-500'
                    : 'bg-gradient-to-r from-violet-500 to-indigo-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="space-y-1">
              {task.subtasks.map((st) => (
                <button
                  key={st.id}
                  onClick={() => toggleSubtask(st.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 hover:bg-slate-800/40 group text-left cursor-pointer ${
                    st.completed ? 'text-slate-600' : 'text-slate-300'
                  }`}
                >
                  {st.completed ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-600 group-hover:text-slate-400 flex-shrink-0" />
                  )}
                  <span className={st.completed ? 'line-through' : ''}>
                    {st.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Activity & Comments Section */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-slate-500" />
            Comments & Activity
          </h4>

          {/* Comment Form */}
          <form onSubmit={handleAddComment} className="flex gap-3">
            <Avatar userId={user?.id || 'u1'} size="sm" />
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 rounded-lg bg-slate-800/40 border border-slate-700/40 px-4 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-violet-500/40"
              />
              <Button type="submit" size="sm" icon={Send} disabled={!commentText.trim()}>
                Post
              </Button>
            </div>
          </form>

          {/* Existing Comments List */}
          {task.comments && task.comments.length > 0 && (
            <div className="space-y-3 pt-2 max-h-48 overflow-y-auto custom-scrollbar">
              {task.comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
                  <Avatar userId={comment.userId} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200">{comment.userName}</span>
                      <span className="text-[10px] text-slate-500">{comment.time}</span>
                    </div>
                    <p className="text-sm text-slate-300 mt-1">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between pt-2 border-t border-slate-700/30">
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={handleDelete}
          >
            Delete Task
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
            {!isEditing && (
              <Button size="sm" icon={Edit3} onClick={() => setIsEditing(true)}>
                Edit Task
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

