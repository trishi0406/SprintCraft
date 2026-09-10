import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Kanban,
  BarChart3,
  Settings,
  Search,
  Plus,
  ChevronDown,
  LogOut,
  Menu,
  X,
  Zap,
  Bell,
  Palette,
  Sun,
  Moon,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBoard } from '../context/BoardContext';
import { useTheme } from '../context/ThemeContext';
import { mockUsers, mockWorkspaces } from '../data/mockData';
import Avatar, { AvatarGroup } from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import CreateTaskModal from '../components/modals/CreateTaskModal';

export default function AppShell() {
  const { user, logout } = useAuth();
  const { boards, searchQuery, setSearchQuery, addBoard, resetData } = useBoard();
  const { theme, setTheme, themes, isLight, toggleLightDarkMode } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);

  // New board state
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');

  const currentWorkspace = mockWorkspaces[0];
  const workspaceBoards = boards.filter((b) => b.workspaceId === currentWorkspace.id || !b.workspaceId);
  const onlineUsers = mockUsers.filter((u) => u.online);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCreateBoardSubmit = (e) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;
    const created = addBoard(newBoardTitle.trim(), currentWorkspace.id);
    setNewBoardTitle('');
    setIsCreatingBoard(false);
    navigate(`/board/${created.id}`);
  };

  const navLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: `/board/${workspaceBoards[0]?.id || 'b1'}`, icon: Kanban, label: 'Board' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="h-screen flex overflow-hidden bg-[var(--bg-primary)]">
      {/* ── Sidebar ──────────────────────────────────── */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-0 lg:w-16'
        } flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden`}
      >
        <div className="h-full flex flex-col bg-[var(--bg-secondary)] border-r border-[var(--border-color)]">
          {/* Brand */}
          <div className="h-16 flex items-center gap-3 px-4 border-b border-[var(--border-color)]">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Zap className="w-4 h-4 text-white" />
            </div>
            {sidebarOpen && (
              <span className="text-lg font-bold text-gradient tracking-tight">SprintCraft</span>
            )}
          </div>

          {/* Workspace Selector */}
          {sidebarOpen && (
            <div className="px-3 py-3">
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800/20 hover:bg-slate-800/40 border border-slate-700/30 transition-colors group cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                  {currentWorkspace.name[0]}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-sm font-semibold text-slate-200 truncate">
                    {currentWorkspace.name}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {currentWorkspace.members.length} members
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-slate-400 flex-shrink-0" />
              </button>
            </div>
          )}

          {/* Nav Links */}
          <nav className="flex-1 px-3 py-2 space-y-1 bg-[var(--bg-secondary)]">
            {sidebarOpen && (
              <p className="px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Navigation
              </p>
            )}
            {navLinks.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={label}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-violet-500/15 text-violet-400 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
                  }`
                }
              >
                <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                {sidebarOpen && <span>{label}</span>}
              </NavLink>
            ))}

            {/* Board List Header & Add Button */}
            {sidebarOpen && (
              <>
                <div className="flex items-center justify-between px-3 pt-6 pb-2">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Boards
                  </p>
                  <button
                    onClick={() => setIsCreatingBoard(!isCreatingBoard)}
                    className="p-1 text-slate-500 hover:text-violet-400 transition-colors cursor-pointer"
                    title="Create new board"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {isCreatingBoard && (
                  <form onSubmit={handleCreateBoardSubmit} className="px-3 mb-2 flex gap-1">
                    <input
                      type="text"
                      placeholder="Board title..."
                      value={newBoardTitle}
                      onChange={(e) => setNewBoardTitle(e.target.value)}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-violet-500"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="px-2 py-1 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs"
                    >
                      ✓
                    </button>
                  </form>
                )}

                {workspaceBoards.map((board) => (
                  <NavLink
                    key={board.id}
                    to={`/board/${board.id}`}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200 ${
                        isActive
                          ? 'bg-slate-700/40 text-slate-200 font-medium'
                          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-700/20'
                      }`
                    }
                  >
                    <div className="w-2 h-2 rounded-full bg-violet-400/60 flex-shrink-0" />
                    <span className="truncate">{board.title}</span>
                  </NavLink>
                ))}
              </>
            )}
          </nav>

          {/* User Profile */}
          {sidebarOpen && (
            <div className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
              <div className="flex items-center gap-3 px-3 py-2">
                <Avatar userId={user?.id || 'u1'} size="sm" showStatus />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-200 truncate">
                    {user?.name || 'User'}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {user?.email || ''}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main Area ────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-primary)]">
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors lg:hidden cursor-pointer"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search */}
            <div className={`relative transition-all duration-300 ${searchFocused ? 'w-80' : 'w-64'}`}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search tasks, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/40 border border-slate-700/40 text-sm text-slate-200 placeholder-slate-500 outline-none transition-all duration-200 focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/10 focus:bg-slate-800/60"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              ) : (
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-slate-600 bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded">
                  ⌘K
                </kbd>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Online Users */}
            <div className="hidden md:flex items-center gap-2">
              <AvatarGroup userIds={onlineUsers.map((u) => u.id)} max={4} size="sm" />
              <span className="text-xs text-slate-500 font-medium ml-1">
                {onlineUsers.length} online
              </span>
            </div>

            <div className="w-px h-8 bg-slate-700/50 hidden md:block" />

            {/* Light / Dark Mode Quick Toggle */}
            <button
              onClick={toggleLightDarkMode}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors cursor-pointer"
              title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {isLight ? (
                <Moon className="w-5 h-5 text-indigo-500" />
              ) : (
                <Sun className="w-5 h-5 text-amber-400" />
              )}
            </button>

            {/* Theme Palette Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                className="flex items-center gap-1.5 p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors cursor-pointer"
                title="Change Color Theme"
              >
                <Palette className="w-5 h-5 text-violet-400" />
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {themeMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 py-2 rounded-xl glass-card shadow-2xl z-50 animate-in fade-in">
                  <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Theme Palette
                  </p>
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTheme(t.id);
                        setThemeMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                        theme === t.id
                          ? 'bg-violet-500/20 text-slate-100'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${t.dotColor}`} />
                        {t.name}
                      </span>
                      {theme === t.id && <span className="text-violet-400 text-xs">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reset Demo Data Button */}
            <button
              onClick={resetData}
              className="p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-700/50 transition-colors cursor-pointer"
              title="Reset Demo Data & Restore Sample Tasks"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors cursor-pointer">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-500 ring-2 ring-surface-secondary" />
            </button>

            {/* New Task */}
            <Button
              icon={Plus}
              size="sm"
              onClick={() => setCreateModalOpen(true)}
            >
              New Task
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto custom-scrollbar">
          <Outlet />
        </main>
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </div>
  );
}
