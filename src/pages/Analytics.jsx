import { BarChart3, CheckCircle2, Clock, TrendingUp, Users, Target } from 'lucide-react';
import { useBoard } from '../context/BoardContext';

export default function Analytics() {
  const { tasks, boards } = useBoard();

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.columnId === 'done').length;
  const inProgressTasks = tasks.filter((t) => t.columnId === 'in-progress').length;
  const reviewTasks = tasks.filter((t) => t.columnId === 'in-review').length;
  const todoTasks = tasks.filter((t) => t.columnId === 'todo').length;

  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const highPriority = tasks.filter((t) => t.priority === 'High').length;
  const mediumPriority = tasks.filter((t) => t.priority === 'Medium').length;
  const lowPriority = tasks.filter((t) => t.priority === 'Low').length;

  const tagsList = ['Frontend', 'Backend', 'Design', 'DevOps'];
  const tagCounts = tagsList.map((tag) => ({
    name: tag,
    count: tasks.filter((t) => t.tag === tag).length,
  }));

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-100 flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-violet-400" />
          Sprint Analytics & Insights
        </h1>
        <p className="text-slate-500 mt-1">
          Real-time metrics and velocity breakdown for active workspace sprints.
        </p>
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5">
          <p className="text-sm font-medium text-slate-500">Overall Completion Rate</p>
          <p className="text-3xl font-bold text-slate-100 mt-1">{completionRate}%</p>
          <div className="w-full h-2 bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <p className="text-sm font-medium text-slate-500">Tasks Completed</p>
          <p className="text-3xl font-bold text-emerald-400 mt-1">{doneTasks}</p>
          <p className="text-xs text-slate-500 mt-2">out of {totalTasks} total tasks</p>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <p className="text-sm font-medium text-slate-500">In Development</p>
          <p className="text-3xl font-bold text-blue-400 mt-1">{inProgressTasks + reviewTasks}</p>
          <p className="text-xs text-slate-500 mt-2">{inProgressTasks} progress · {reviewTasks} review</p>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <p className="text-sm font-medium text-slate-500">High Priority Backlog</p>
          <p className="text-3xl font-bold text-red-400 mt-1">{highPriority}</p>
          <p className="text-xs text-slate-500 mt-2">Needs sprint focus</p>
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-semibold text-slate-200">Task Status Distribution</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Completed (Done)</span>
                <span>{doneTasks} ({totalTasks > 0 ? Math.round((doneTasks/totalTasks)*100) : 0}%)</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${totalTasks > 0 ? (doneTasks/totalTasks)*100 : 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>In Progress</span>
                <span>{inProgressTasks} ({totalTasks > 0 ? Math.round((inProgressTasks/totalTasks)*100) : 0}%)</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${totalTasks > 0 ? (inProgressTasks/totalTasks)*100 : 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>In Review</span>
                <span>{reviewTasks} ({totalTasks > 0 ? Math.round((reviewTasks/totalTasks)*100) : 0}%)</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${totalTasks > 0 ? (reviewTasks/totalTasks)*100 : 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>To Do (Backlog)</span>
                <span>{todoTasks} ({totalTasks > 0 ? Math.round((todoTasks/totalTasks)*100) : 0}%)</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-slate-600" style={{ width: `${totalTasks > 0 ? (todoTasks/totalTasks)*100 : 0}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Priority & Tag Breakdown */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-semibold text-slate-200">Category Tag Breakdown</h3>
          <div className="grid grid-cols-2 gap-4">
            {tagCounts.map((tc) => (
              <div key={tc.name} className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/40">
                <p className="text-xs text-slate-500">{tc.name}</p>
                <p className="text-2xl font-bold text-violet-400 mt-1">{tc.count}</p>
                <p className="text-[11px] text-slate-600">tasks assigned</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
