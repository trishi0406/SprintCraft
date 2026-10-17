import { Link } from 'react-router-dom';
import {
  Kanban,
  Users,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Activity,
  TrendingUp,
  Target,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBoard } from '../context/BoardContext';
import { timeAgo } from '../lib/normalize';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';

export default function Dashboard() {
  const { user } = useAuth();
  const { boards, tasks, members, loading, loadError, reload, isOnline, getBoard } = useBoard();

  const wsBoards = boards;
  const wsTasks = tasks;
  const recentTasks = [...wsTasks]
    .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
    .slice(0, 6);
  const columnTitle = (t) =>
    getBoard(t.boardId)?.columns.find((c) => c.id === t.columnId)?.title || t.columnId;

  const doneTasks = wsTasks.filter((t) => t.columnId === 'done').length;
  const inProgressTasks = wsTasks.filter((t) => t.columnId === 'in-progress').length;
  const highPriority = wsTasks.filter((t) => t.priority === 'High' && t.columnId !== 'done').length;

  const myOpenTasks = wsTasks.filter((t) => t.assignees.includes(user?.id) && t.columnId !== 'done').length;
  const pct = (n) => (wsTasks.length > 0 ? Math.round((n / wsTasks.length) * 100) : 0);

  const stats = [
    {
      label: 'Total Tasks',
      value: wsTasks.length,
      icon: Target,
      color: 'from-violet-500 to-indigo-500',
      shadowColor: 'shadow-violet-500/20',
      change: `${wsBoards.length} board${wsBoards.length === 1 ? '' : 's'}`,
    },
    {
      label: 'In Progress',
      value: inProgressTasks,
      icon: Clock,
      color: 'from-blue-500 to-cyan-500',
      shadowColor: 'shadow-blue-500/20',
      change: `${myOpenTasks} open assigned to you`,
    },
    {
      label: 'Completed',
      value: doneTasks,
      icon: CheckCircle2,
      color: 'from-emerald-500 to-teal-500',
      shadowColor: 'shadow-emerald-500/20',
      change: `${pct(doneTasks)}% done`,
    },
    {
      label: 'High Priority',
      value: highPriority,
      icon: TrendingUp,
      color: 'from-red-500 to-orange-500',
      shadowColor: 'shadow-red-500/20',
      change: 'Needs attention',
    },
  ];

  if (loadError) {
    return (
      <div className="p-8 max-w-md mx-auto text-center space-y-3">
        <p className="text-sm text-red-400">{loadError}</p>
        <button
          onClick={reload}
          className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading && wsBoards.length === 0) {
    return <div className="p-8 text-sm text-slate-500">Loading your workspace...</div>;
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-100">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          <span className="text-gradient">{user?.name?.split(' ')[0] || 'there'}</span>
        </h1>
        <p className="text-slate-500 mt-1">
          Here's what's happening with your projects today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, shadowColor, change }, i) => (
          <div
            key={label}
            className="glass-card rounded-2xl p-5 hover:scale-[1.02] transition-transform duration-300"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">{label}</p>
                <p className="text-3xl font-bold text-slate-100 mt-1">{value}</p>
                <p className="text-xs text-slate-500 mt-2">{change}</p>
              </div>
              <div
                className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg ${shadowColor}`}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Boards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-200">Your Boards</h2>
            <span className="text-xs text-slate-500 font-medium">{wsBoards.length} boards</span>
          </div>

          {wsBoards.length === 0 && (
            <div className="glass-card rounded-2xl p-6 text-sm text-slate-500">
              No boards yet. Use the + next to "Boards" in the sidebar to create one.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {wsBoards.map((board, i) => {
              const boardTasks = tasks.filter((t) => t.boardId === board.id);
              const done = boardTasks.filter((t) => t.columnId === 'done').length;
              const progress = boardTasks.length > 0 ? Math.round((done / boardTasks.length) * 100) : 0;

              return (
                <Link
                  key={board.id}
                  to={`/board/${board.id}`}
                  className="glass-card rounded-2xl p-5 hover:border-violet-500/20 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300 group"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 flex items-center justify-center border border-violet-500/20">
                        <Kanban className="w-5 h-5 text-violet-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-200 group-hover:text-violet-300 transition-colors text-sm">
                          {board.title}
                        </h3>
                        <p className="text-xs text-slate-500">{boardTasks.length} tasks</p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-violet-400 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Progress</span>
                      <span className="text-slate-400 font-medium">{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-200">Recent Activity</h2>
            <Activity className="w-4 h-4 text-slate-500" />
          </div>

          <div className="glass-card rounded-2xl divide-y divide-slate-800/50">
            {recentTasks.length === 0 && (
              <p className="px-5 py-4 text-sm text-slate-500">No activity yet.</p>
            )}
            {recentTasks.map((task, i) => (
              <div
                key={task.id}
                className="flex items-start gap-3 px-5 py-4 first:pt-5 last:pb-5"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    <Link
                      to={`/board/${task.boardId}`}
                      className="font-medium text-slate-200 hover:text-violet-300"
                    >
                      {task.title}
                    </Link>{' '}
                    <span className="text-slate-500">in</span>{' '}
                    <span className="font-medium text-slate-300">{columnTitle(task)}</span>
                  </p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Updated {timeAgo(task.updatedAt)}
                  </p>
                </div>
                {task.assignees.length > 0 && (
                  <Avatar userId={task.assignees[0]} size="sm" />
                )}
              </div>
            ))}
          </div>

          {/* Team */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-300">Team Members</h3>
              <Users className="w-4 h-4 text-slate-500" />
            </div>
            <div className="space-y-3">
              {members.slice(0, 6).map((u) => (
                <div key={u.id} className="flex items-center gap-3">
                  <Avatar userId={u.id} size="sm" showStatus />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-300 font-medium truncate">{u.name}</p>
                    <p className="text-xs text-slate-600 truncate">{u.email}</p>
                  </div>
                  <Badge label={isOnline(u.id) ? 'Online' : 'Offline'} variant={isOnline(u.id) ? 'Low' : 'default'} size="xs" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
