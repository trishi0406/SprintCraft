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
import { mockWorkspaces, mockUsers, mockActivity } from '../data/mockData';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';

export default function Dashboard() {
  const { user } = useAuth();
  const { boards, tasks } = useBoard();

  const workspace = mockWorkspaces[0];
  const wsBoards = boards.filter((b) => b.workspaceId === workspace.id);
  const wsTasks = tasks.filter((t) => wsBoards.some((b) => b.id === t.boardId));

  const doneTasks = wsTasks.filter((t) => t.columnId === 'done').length;
  const inProgressTasks = wsTasks.filter((t) => t.columnId === 'in-progress').length;
  const highPriority = wsTasks.filter((t) => t.priority === 'High' && t.columnId !== 'done').length;

  const stats = [
    {
      label: 'Total Tasks',
      value: wsTasks.length,
      icon: Target,
      color: 'from-violet-500 to-indigo-500',
      shadowColor: 'shadow-violet-500/20',
      change: '+3 this week',
    },
    {
      label: 'In Progress',
      value: inProgressTasks,
      icon: Clock,
      color: 'from-blue-500 to-cyan-500',
      shadowColor: 'shadow-blue-500/20',
      change: '2 assigned to you',
    },
    {
      label: 'Completed',
      value: doneTasks,
      icon: CheckCircle2,
      color: 'from-emerald-500 to-teal-500',
      shadowColor: 'shadow-emerald-500/20',
      change: `${Math.round((doneTasks / wsTasks.length) * 100)}% done`,
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
            {mockActivity.map((activity, i) => {
              const activityUser = mockUsers.find((u) => u.id === activity.userId);
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 px-5 py-4 first:pt-5 last:pb-5"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <Avatar userId={activity.userId} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-300 leading-relaxed">
                      <span className="font-medium text-slate-200">
                        {activityUser?.name?.split(' ')[0]}
                      </span>{' '}
                      <span className="text-slate-500">{activity.action}</span>{' '}
                      <span className="font-medium text-slate-300">
                        {activity.target}
                      </span>
                      {activity.detail && (
                        <span className="text-slate-500"> {activity.detail}</span>
                      )}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-1">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Team */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-300">Team Members</h3>
              <Users className="w-4 h-4 text-slate-500" />
            </div>
            <div className="space-y-3">
              {mockUsers.slice(0, 5).map((u) => (
                <div key={u.id} className="flex items-center gap-3">
                  <Avatar userId={u.id} size="sm" showStatus />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-300 font-medium truncate">{u.name}</p>
                    <p className="text-xs text-slate-600 truncate">{u.email}</p>
                  </div>
                  <Badge label={u.online ? 'Online' : 'Away'} variant={u.online ? 'Low' : 'default'} size="xs" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
