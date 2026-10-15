import React from 'react';
import { WorkspaceView } from '../types';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  priorityFilter: string;
  setPriorityFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  stats: { total: number; inProgress: number; done: number };
  pomodoroSeconds: number;
  isPomodoroRunning: boolean;
  onOpenFocusMode: () => void;
  onOpenNewTask: () => void;
  onOpenAiBreakdown: () => void;
  onOpenCommandPalette: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  priorityFilter,
  setPriorityFilter,
  statusFilter,
  setStatusFilter,
  stats,
  pomodoroSeconds,
  isPomodoroRunning,
  onOpenFocusMode,
  onOpenNewTask,
  onOpenAiBreakdown,
  onOpenCommandPalette,
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-[#0b1326]/85 backdrop-blur-xl z-40 border-b border-[#464554]/30 shadow-[0_1px_8px_rgba(0,0,0,0.3)]">
      <div className="w-full h-full px-5 flex items-center justify-between gap-4">
        {/* Search Bar & Quick Filters */}
        <div className="flex items-center gap-3 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#c7c4d7] text-lg pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={onOpenCommandPalette}
              placeholder="Search tasks by title, tag, or description... [Cmd+K]"
              className="w-full h-9 pl-9 pr-12 rounded-lg bg-[#171f33] border border-[#464554]/40 text-[13px] text-[#dae2fd] placeholder:text-[#908fa0] focus:outline-none focus:ring-1 focus:ring-[#c0c1ff] transition-all"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#222a3d] text-[#c7c4d7] border border-[#464554]/40 pointer-events-none hidden sm:inline">
              ⌘K
            </kbd>
          </div>

          <div className="hidden xl:flex items-center gap-1.5">
            {/* Priority Filter */}
            <div className="relative">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="h-8 px-2.5 rounded-md bg-[#171f33] hover:bg-[#222a3d] border border-[#464554]/30 text-[#c7c4d7] hover:text-[#dae2fd] text-[12px] flex items-center gap-1 transition-colors cursor-pointer appearance-none pr-6 font-medium focus:outline-none"
              >
                <option value="all">Priority: All</option>
                <option value="P0">P0 Urgent / High</option>
                <option value="P1">P1 Medium</option>
                <option value="P2">P2 Low</option>
                <option value="P3">P3 Normal</option>
              </select>
              <span className="material-symbols-outlined absolute right-1.5 top-1/2 -translate-y-1/2 text-[14px] text-[#c7c4d7] pointer-events-none">
                expand_more
              </span>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-8 px-2.5 rounded-md bg-[#171f33] hover:bg-[#222a3d] border border-[#464554]/30 text-[#c7c4d7] hover:text-[#dae2fd] text-[12px] flex items-center gap-1 transition-colors cursor-pointer appearance-none pr-6 font-medium focus:outline-none"
              >
                <option value="all">Status: All</option>
                <option value="to-do">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
              <span className="material-symbols-outlined absolute right-1.5 top-1/2 -translate-y-1/2 text-[14px] text-[#c7c4d7] pointer-events-none">
                expand_more
              </span>
            </div>

            {/* Assignee Filter */}
            <div className="relative">
              <button
                type="button"
                className="h-8 px-2.5 rounded-md bg-[#171f33] hover:bg-[#222a3d] border border-[#464554]/30 text-[#c7c4d7] hover:text-[#dae2fd] text-[12px] flex items-center gap-1 transition-colors font-medium"
              >
                <span>Assignee: Elena R.</span>
                <span className="material-symbols-outlined text-[14px]">expand_more</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right CTA Cluster */}
        <div className="flex items-center gap-2.5">
          {/* Quick Metrics Badges */}
          <div className="hidden 2xl:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#131b2e] border border-[#464554]/30">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] text-[#c7c4d7]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#908fa0]"></span>
              <span>Total:</span>
              <span className="text-[#dae2fd] font-semibold">{stats.total}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] text-[#c7c4d7]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c0c1ff]"></span>
              <span>In Progress:</span>
              <span className="text-[#c0c1ff] font-semibold">{stats.inProgress}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] text-[#c7c4d7]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]"></span>
              <span>Done:</span>
              <span className="text-[#4edea3] font-semibold">{stats.done}</span>
            </div>
          </div>

          {/* Pomodoro Timer Pill */}
          <button
            onClick={onOpenFocusMode}
            type="button"
            className="h-8 px-2.5 rounded-md bg-[#171f33] hover:bg-[#222a3d] border border-[#464554]/30 text-[#c0c1ff] text-[12px] font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            title="Open Focus Mode & Pomodoro Studio"
          >
            <span className={`material-symbols-outlined text-sm ${isPomodoroRunning ? 'animate-pulse text-[#4edea3]' : ''}`}>
              timer
            </span>
            <span className="font-mono">{formatTime(pomodoroSeconds)}</span>
          </button>

          {/* AI Breakdown Button */}
          <button
            onClick={onOpenAiBreakdown}
            type="button"
            className="h-8 px-3 rounded-md bg-[#571bc1] text-[#c4abff] hover:bg-[#571bc1]/85 border border-[#c4abff]/30 text-[12px] font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            <span className="hidden lg:inline">AI Breakdown</span>
          </button>

          {/* New Task Button */}
          <button
            onClick={onOpenNewTask}
            type="button"
            className="h-8 px-3 rounded-md bg-[#8083ff] text-[#0d0096] hover:bg-[#c0c1ff] text-[12px] font-semibold flex items-center gap-1 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span className="hidden sm:inline">New Task</span>
          </button>

          {/* Utilities */}
          <div className="flex items-center gap-1 border-l border-[#464554]/40 pl-2">
            <button
              type="button"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#c7c4d7] hover:text-[#dae2fd] hover:bg-[#171f33] transition-colors relative"
              title="Notifications"
            >
              <span className="material-symbols-outlined text-lg">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ffb4ab]"></span>
            </button>
            <button
              type="button"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#c7c4d7] hover:text-[#dae2fd] hover:bg-[#171f33] transition-colors"
              title="Dark Mode Active"
            >
              <span className="material-symbols-outlined text-lg">dark_mode</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
