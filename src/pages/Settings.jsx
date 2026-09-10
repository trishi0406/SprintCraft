import { useState } from 'react';
import { Settings as SettingsIcon, Users, Palette, Save, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { mockWorkspaces, mockUsers } from '../data/mockData';
import Input, { Textarea } from '../components/ui/Input';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';

export default function Settings() {
  const { user } = useAuth();
  const { theme, setTheme, themes } = useTheme();

  const [wsName, setWsName] = useState(mockWorkspaces[0].name);
  const [wsDesc, setWsDesc] = useState(mockWorkspaces[0].description);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSaveWorkspace = (e) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8 animate-in">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-100 flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-violet-400" />
          Workspace Settings
        </h1>
        <p className="text-slate-500 mt-1">
          Manage workspace branding, team member access roles, and theme customization.
        </p>
      </div>

      {savedNotice && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
          <Check className="w-4 h-4" />
          Workspace settings saved successfully!
        </div>
      )}

      {/* Workspace Details Form */}
      <div className="glass-card rounded-2xl p-6 space-y-6">
        <h3 className="text-lg font-semibold text-slate-200">General Information</h3>
        <form onSubmit={handleSaveWorkspace} className="space-y-4">
          <Input
            label="Workspace Name"
            value={wsName}
            onChange={(e) => setWsName(e.target.value)}
          />
          <Textarea
            label="Description"
            value={wsDesc}
            onChange={(e) => setWsDesc(e.target.value)}
          />
          <div className="flex justify-end">
            <Button type="submit" icon={Save}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Theme Settings */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <Palette className="w-5 h-5 text-violet-400" />
          Theme & Appearance
        </h3>
        <p className="text-sm text-slate-500">Choose your preferred dark aesthetic palette:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                theme === t.id
                  ? 'bg-violet-500/15 border-violet-500/50 shadow-lg shadow-violet-500/10 ring-1 ring-violet-500/30'
                  : 'bg-slate-800/40 border-slate-700/40 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div className={`w-3.5 h-3.5 rounded-full ${t.dotColor}`} />
                <span className="text-sm font-semibold text-slate-200">{t.name}</span>
              </div>
              <p className="text-xs text-slate-500">Click to activate palette</p>
            </button>
          ))}
        </div>
      </div>

      {/* Team Members List */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <Users className="w-5 h-5 text-violet-400" />
          Team Members & Permissions
        </h3>
        <div className="divide-y divide-slate-800/50">
          {mockUsers.map((m, i) => (
            <div key={m.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Avatar userId={m.id} size="sm" showStatus />
                <div>
                  <p className="text-sm font-medium text-slate-200">{m.name}</p>
                  <p className="text-xs text-slate-500">{m.email}</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                {i === 0 ? 'Admin' : 'Member'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
