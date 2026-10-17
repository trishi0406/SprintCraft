import { useEffect, useRef, useState } from 'react';
import { Plus, X, Upload, Calendar, Tag, AlertCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import Input, { Textarea, Select } from '../ui/Input';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import { useBoard } from '../../context/BoardContext';

export default function CreateTaskModal({ isOpen, onClose, defaultColumnId, defaultBoardId }) {
  const { addTask, boards, members } = useBoard();
  const fileInputRef = useRef(null);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [tag, setTag] = useState('Frontend');
  const [boardId, setBoardId] = useState(defaultBoardId || '');
  const [columnId, setColumnId] = useState(defaultColumnId || '');
  const [dueDate, setDueDate] = useState('');
  const [selectedAssignees, setSelectedAssignees] = useState([]);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;
    const initialBoard =
      boards.find((b) => b.id === defaultBoardId) || boards[0] || null;
    setBoardId(initialBoard?.id || '');
    const cols = initialBoard?.columns || [];
    setColumnId(
      cols.some((c) => c.id === defaultColumnId) ? defaultColumnId : cols[0]?.id || ''
    );
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, defaultColumnId, defaultBoardId]);

  const selectedBoard = boards.find((b) => b.id === boardId);
  const boardColumns = selectedBoard?.columns || [];

  const handleBoardChange = (id) => {
    setBoardId(id);
    const b = boards.find((x) => x.id === id);
    setColumnId(b?.columns?.[0]?.id || '');
  };

  const toggleAssignee = (userId) => {
    setSelectedAssignees((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const addSubtask = () => {
    if (subtaskInput.trim()) {
      setSubtasks((prev) => [
        ...prev,
        { id: 'st_' + Date.now(), title: subtaskInput.trim(), completed: false },
      ]);
      setSubtaskInput('');
    }
  };

  const removeSubtask = (id) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSubmit = async (e) => {

     console.log('SELECTED ASSIGNEES:', selectedAssignees);
    e.preventDefault();
    const errs = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (!boardId) errs.form = 'Create a board first, then add tasks to it.';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      await addTask({
        title: title.trim(),
        description: description.trim(),
        boardId,
        columnId,
        priority,
        tag,
        dueDate: dueDate || null,
        assignees: selectedAssignees,
        subtasks: subtasks.map(({ title: t, completed }) => ({ title: t, completed })),
        attachmentFile,
      });

      setTitle('');
      setDescription('');
      setPriority('Medium');
      setTag('Frontend');
      setDueDate('');
      setSelectedAssignees([]);
      setSubtasks([]);
      setSubtaskInput('');
      setAttachmentFile(null);
      onClose();
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const tags = ['Frontend', 'Backend', 'Design', 'DevOps'];
  const priorities = ['High', 'Medium', 'Low'];

  console.log('MEMBERS:', members);
console.log('SELECTED ASSIGNEES:', selectedAssignees);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task" size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        {errors.form && (
          <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            {errors.form}
          </div>
        )}
        <Input
          label="Task Title"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
        />

        <Textarea
          label="Description"
          placeholder="Describe the task in detail..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Board"
            value={boardId}
            onChange={(e) => handleBoardChange(e.target.value)}
          >
            {boards.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title}
              </option>
            ))}
          </Select>

          <Select
            label="Column"
            value={columnId}
            onChange={(e) => setColumnId(e.target.value)}
          >
            {boardColumns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">
              <span className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Priority
              </span>
            </label>
            <div className="flex gap-2">
              {priorities.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all duration-200 cursor-pointer ${
                    priority === p
                      ? p === 'High'
                        ? 'bg-red-500/20 border-red-500/40 text-red-400'
                        : p === 'Medium'
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                        : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                      : 'bg-slate-800/40 border-slate-700/40 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                Tag
              </span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {tags.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTag(t)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-200 cursor-pointer ${
                    tag === t
                      ? 'bg-violet-500/20 border-violet-500/40 text-violet-400'
                      : 'bg-slate-800/40 border-slate-700/40 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-300">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Due Date
            </span>
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-lg bg-slate-800/60 border border-slate-700/60 px-4 py-2.5 text-sm text-slate-100 outline-none transition-all duration-200 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 [color-scheme:dark]"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">
            Assignees
          </label>
          <div className="flex flex-wrap gap-2">
            {members.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => toggleAssignee(u.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all duration-200 cursor-pointer ${
                  selectedAssignees.includes(u.id)
                    ? 'bg-violet-500/15 border-violet-500/30 text-violet-300'
                    : 'bg-slate-800/40 border-slate-700/40 text-slate-500 hover:text-slate-300'
                }`}
              >
                <Avatar userId={u.id} size="xs" />
                <span>{u.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">
            Subtasks
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add a subtask..."
              value={subtaskInput}
              onChange={(e) => setSubtaskInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSubtask();
                }
              }}
              className="flex-1 rounded-lg bg-slate-800/60 border border-slate-700/60 px-4 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-violet-500/60"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={Plus}
              onClick={addSubtask}
            >
              Add
            </Button>
          </div>
          {subtasks.length > 0 && (
            <div className="space-y-1.5 mt-2">
              {subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700/30 group"
                >
                  <span className="text-sm text-slate-300">{st.title}</span>
                  <button
                    type="button"
                    onClick={() => removeSubtask(st.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-300">
            Attachments
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.doc,.docx,.txt"
            className="hidden"
            onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700/50 rounded-xl p-6 text-center hover:border-violet-500/30 transition-colors cursor-pointer"
          >
            <Upload className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            {attachmentFile ? (
              <p className="text-sm text-slate-300">{attachmentFile.name}</p>
            ) : (
              <p className="text-sm text-slate-500">
                Click to <span className="text-violet-400">browse</span> for a file
              </p>
            )}
            <p className="text-xs text-slate-600 mt-1">
              Images, PDF, DOC, TXT up to 5MB
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-700/30">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>Create Task</Button>
        </div>
      </form>
    </Modal>
  );
}
