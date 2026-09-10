import { mockUsers } from '../../data/mockData';

export default function Avatar({ userId, size = 'md', showStatus = false }) {
  const user = mockUsers.find((u) => u.id === userId);
  if (!user) return null;

  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
    xl: 'w-14 h-14 text-lg',
  };

  return (
    <div className="relative inline-flex" title={user.name}>
      <div
        className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold text-white ring-2 ring-slate-800 transition-transform hover:scale-110 hover:z-10`}
        style={{ backgroundColor: user.color }}
      >
        {user.initials}
      </div>
      {showStatus && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${
            user.online ? 'bg-emerald-400' : 'bg-slate-500'
          }`}
        />
      )}
    </div>
  );
}

export function AvatarGroup({ userIds = [], max = 3, size = 'sm' }) {
  const visible = userIds.slice(0, max);
  const overflow = userIds.length - max;

  return (
    <div className="flex -space-x-2">
      {visible.map((id) => (
        <Avatar key={id} userId={id} size={size} />
      ))}
      {overflow > 0 && (
        <div
          className={`${
            size === 'sm' ? 'w-8 h-8 text-xs' : 'w-9 h-9 text-sm'
          } rounded-full bg-slate-700 flex items-center justify-center font-medium text-slate-300 ring-2 ring-slate-800`}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
