const mongoose = require('mongoose');

const columnSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    order: { type: Number, default: 0 },
    color: { type: String, default: '#8B5CF6' },
    icon: { type: String, default: 'circle' },
  },
  { _id: false }
);

const defaultBoardColumns = () => [
  { id: 'todo', title: 'To Do', order: 0, color: '#64748B', icon: 'circle' },
  { id: 'in-progress', title: 'In Progress', order: 1, color: '#3B82F6', icon: 'timer' },
  { id: 'in-review', title: 'In Review', order: 2, color: '#F59E0B', icon: 'eye' },
  { id: 'done', title: 'Done', order: 3, color: '#10B981', icon: 'check-circle' },
];

const boardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    columns: { type: [columnSchema], default: defaultBoardColumns },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

module.exports = mongoose.model('Board', boardSchema);
