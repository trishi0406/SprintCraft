// Convert backend (MongoDB) documents into the shapes the UI components use.

const DEFAULT_COLOR = '#8B5CF6';

const idOf = (v) => (v && typeof v === 'object' ? String(v.id || v._id) : v ? String(v) : null);

export function initialsOf(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.length ? parts.map((p) => p[0]).join('').toUpperCase().slice(0, 2) : 'US';
}

export function normalizeUser(u) {
  if (!u || typeof u !== 'object') return null;
  return {
    id: idOf(u),
    name: u.name || 'User',
    email: u.email || '',
    avatar: u.avatar || null,
    initials: u.initials || initialsOf(u.name),
    color: u.color || DEFAULT_COLOR,
  };
}

const dateOnly = (d) => (d ? String(d).slice(0, 10) : null);

export function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/** Returns { task, users } where users are any populated user objects found inside. */
export function normalizeTask(t) {
  const users = [];
  const collect = (u) => {
    const n = normalizeUser(u);
    if (n) users.push(n);
    return n;
  };

  const assignees = (t.assignees || [])
    .map((a) => {
      if (a && typeof a === 'object') collect(a);
      return idOf(a);
    })
    .filter(Boolean);

  const comments = (t.comments || []).map((c) => {
    const author = c.userId && typeof c.userId === 'object' ? collect(c.userId) : null;
    return {
      id: idOf(c),
      userId: idOf(c.userId),
      userName: author?.name || 'Unknown',
      text: c.text,
      time: timeAgo(c.createdAt),
    };
  });

  return {
    task: {
      id: idOf(t),
      title: t.title,
      description: t.description || '',
      boardId: idOf(t.boardId),
      columnId: t.columnId,
      priority: t.priority || 'Medium',
      tag: t.tag || '',
      dueDate: dateOnly(t.dueDate),
      assignees,
      subtasks: (t.subtasks || []).map((s) => ({ id: idOf(s), title: s.title, completed: !!s.completed })),
      attachments: t.attachments || [],
      comments,
      order: t.order ?? 0,
      createdAt: dateOnly(t.createdAt),
      updatedAt: t.updatedAt || t.createdAt || null,
    },
    users,
  };
}

export function normalizeBoard(b) {
  return {
    id: idOf(b),
    title: b.title,
    workspaceId: idOf(b.workspaceId),
    columns: (b.columns || [])
      .slice()
      .sort((a, c) => (a.order ?? 0) - (c.order ?? 0))
      .map((c) => ({ id: c.id, title: c.title, color: c.color || DEFAULT_COLOR, icon: c.icon || 'circle' })),
  };
}

export function normalizeWorkspace(w) {
  const users = [];
  const members = (w.members || [])
    .map((m) => {
      const u = normalizeUser(m.user);
      if (u) users.push(u);
      return { userId: idOf(m.user), role: m.role };
    })
    .filter((m) => m.userId);
  const owner = normalizeUser(w.owner);
  if (owner) users.push(owner);
  return {
    workspace: {
      id: idOf(w),
      name: w.name,
      description: w.description || '',
      ownerId: idOf(w.owner),
      members,
    },
    users,
  };
}
