import React, { useState, useEffect } from 'react';
import { Task, WorkspaceView } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onNavigateView: (view: WorkspaceView) => void;
  onStartPomodoro: () => void;
  onAutoOrganize: () => void;
  onExportJson: () => void;
  onOpenNewTask: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  tasks,
  onSelectTask,
  onNavigateView,
  onStartPomodoro,
  onAutoOrganize,
  onExportJson,
  onOpenNewTask,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickActions = [
    { id: 'act-new', label: 'Create New Task', icon: 'add_task', action: onOpenNewTask },
    { id: 'act-focus', label: 'Start 25m Focus Pomodoro', icon: 'timer', action: onStartPomodoro },
    { id: 'act-ai', label: 'Auto-Organize Sprint with AI', icon: 'auto_awesome', action: onAutoOrganize },
    { id: 'act-export', label: 'Export Sprint JSON Backup', icon: 'download', action: onExportJson },
    { id: 'view-board', label: 'Switch to Board View', icon: 'view_kanban', action: () => onNavigateView('board-view') },
    { id: 'view-list', label: 'Switch to List View', icon: 'format_list_bulleted', action: () => onNavigateView('list-view') },
    { id: 'view-cal', label: 'Switch to Calendar View', icon: 'calendar_month', action: () => onNavigateView('calendar') },
    { id: 'view-analytics', label: 'Switch to Analytics View', icon: 'insights', action: () => onNavigateView('analytics') },
  ];

  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(query.toLowerCase()) ||
    t.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#0b1326]/80 backdrop-blur-md flex items-start justify-center pt-24 p-4 animate-fadeIn">
      <div className="w-full max-w-xl rounded-2xl bg-[#171f33] border border-[#464554]/40 shadow-2xl overflow-hidden flex flex-col">
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#464554]/30">
          <span className="material-symbols-outlined text-[#c0c1ff] text-xl">search</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search tasks... (Esc to close)"
            className="w-full bg-transparent text-[14px] text-[#dae2fd] placeholder:text-[#908fa0] focus:outline-none"
            autoFocus
          />
          <kbd className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#222a3d] text-[#c7c4d7] border border-[#464554]/40">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {/* Quick Actions */}
          <div className="px-3 py-1 text-[11px] font-semibold text-[#c7c4d7]/70 uppercase tracking-wider">
            Quick Actions
          </div>
          {quickActions
            .filter((a) => a.label.toLowerCase().includes(query.toLowerCase()))
            .map((act) => (
              <button
                key={act.id}
                type="button"
                onClick={() => {
                  act.action();
                  onClose();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#222a3d] text-[#dae2fd] text-[13px] transition-colors text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#c0c1ff] text-base group-hover:scale-110 transition-transform">
                    {act.icon}
                  </span>
                  <span>{act.label}</span>
                </div>
                <span className="text-[11px] text-[#908fa0] font-mono">Jump</span>
              </button>
            ))}

          {/* Tasks matches */}
          {filteredTasks.length > 0 && (
            <>
              <div className="px-3 py-1 text-[11px] font-semibold text-[#c7c4d7]/70 uppercase tracking-wider mt-2 border-t border-[#464554]/20 pt-2">
                Sprint Tasks ({filteredTasks.length})
              </div>
              {filteredTasks.slice(0, 5).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    onSelectTask(t);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#222a3d] text-[#dae2fd] text-[13px] transition-colors text-left"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-xs text-[#c0c1ff]">{t.id}</span>
                    <span className="truncate">{t.title}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#131b2e] text-[#c7c4d7] border border-[#464554]/30 uppercase">
                    {t.status}
                  </span>
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
