import React from 'react';
import { WorkspaceView } from '../types';
import { TASKFLOW_LOGO, ELENA_AVATAR } from '../data/initialTasks';

interface SidebarProps {
  currentView: WorkspaceView;
  setCurrentView: (view: WorkspaceView) => void;
  onTagClick: (tag: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  onTagClick,
}) => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#131b2e]/95 backdrop-blur-xl z-50 flex flex-col justify-between border-r border-[#464554]/30 shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
      <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#464554]/20">
          <div className="flex items-center gap-2.5">
            <img
              alt="TaskFlow Logo"
              className="h-8 w-auto object-contain"
              src={TASKFLOW_LOGO}
            />
            <span className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-[#dae2fd] tracking-tight">
              TaskFlow
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#571bc1] text-[#c4abff] text-[11px] uppercase tracking-wider font-semibold">
              PRO
            </span>
          </div>
        </div>

        {/* Sprint Switcher Dropdown Button */}
        <div className="px-3 py-2">
          <button
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#171f33] hover:bg-[#222a3d] border border-[#464554]/30 transition-colors group text-left"
            type="button"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-[#c0c1ff] text-base">
                corporate_fare
              </span>
              <span className="text-[13px] text-[#dae2fd] truncate font-medium">
                Sprint 24 — Q3 Launch
              </span>
            </div>
            <span className="material-symbols-outlined text-[#c7c4d7] group-hover:text-[#dae2fd] transition-colors text-sm">
              unfold_more
            </span>
          </button>
        </div>

        {/* Workspace Views Navigation */}
        <div className="px-3 mt-2">
          <p className="px-3 py-1 text-[11px] text-[#c7c4d7]/70 uppercase tracking-wider font-semibold">
            Workspace Views
          </p>
          <nav className="flex flex-col gap-1 mt-1">
            <button
              onClick={() => setCurrentView('board-view')}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all text-left ${
                currentView === 'board-view'
                  ? 'bg-[#8083ff] text-[#0d0096] font-semibold shadow-md'
                  : 'text-[#c7c4d7] hover:bg-[#222a3d] hover:text-[#dae2fd]'
              }`}
            >
              <span className="material-symbols-outlined text-lg">view_kanban</span>
              <span>Board View</span>
            </button>

            <button
              onClick={() => setCurrentView('list-view')}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all text-left ${
                currentView === 'list-view'
                  ? 'bg-[#8083ff] text-[#0d0096] font-semibold shadow-md'
                  : 'text-[#c7c4d7] hover:bg-[#222a3d] hover:text-[#dae2fd]'
              }`}
            >
              <span className="material-symbols-outlined text-lg">format_list_bulleted</span>
              <span>List View</span>
            </button>

            <button
              onClick={() => setCurrentView('calendar')}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all text-left ${
                currentView === 'calendar'
                  ? 'bg-[#8083ff] text-[#0d0096] font-semibold shadow-md'
                  : 'text-[#c7c4d7] hover:bg-[#222a3d] hover:text-[#dae2fd]'
              }`}
            >
              <span className="material-symbols-outlined text-lg">calendar_month</span>
              <span>Calendar</span>
            </button>

            <button
              onClick={() => setCurrentView('analytics')}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all text-left ${
                currentView === 'analytics'
                  ? 'bg-[#8083ff] text-[#0d0096] font-semibold shadow-md'
                  : 'text-[#c7c4d7] hover:bg-[#222a3d] hover:text-[#dae2fd]'
              }`}
            >
              <span className="material-symbols-outlined text-lg">insights</span>
              <span>Analytics</span>
            </button>

            <button
              onClick={() => setCurrentView('focus-mode')}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all text-left ${
                currentView === 'focus-mode'
                  ? 'bg-[#8083ff] text-[#0d0096] font-semibold shadow-md'
                  : 'text-[#c7c4d7] hover:bg-[#222a3d] hover:text-[#dae2fd]'
              }`}
            >
              <span className="material-symbols-outlined text-lg">timer</span>
              <span>Focus Mode / Pomodoro</span>
            </button>

            <button
              onClick={() => setCurrentView('settings')}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all text-left ${
                currentView === 'settings'
                  ? 'bg-[#8083ff] text-[#0d0096] font-semibold shadow-md'
                  : 'text-[#c7c4d7] hover:bg-[#222a3d] hover:text-[#dae2fd]'
              }`}
            >
              <span className="material-symbols-outlined text-lg">settings</span>
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Projects List */}
        <div className="px-3 mt-4">
          <div className="flex items-center justify-between px-3 py-1">
            <p className="text-[11px] text-[#c7c4d7]/70 uppercase tracking-wider font-semibold">
              Projects
            </p>
            <button className="text-[#c7c4d7] hover:text-[#dae2fd] transition-colors">
              <span className="material-symbols-outlined text-sm">add</span>
            </button>
          </div>
          <div className="flex flex-col gap-1 mt-1">
            <button
              onClick={() => setCurrentView('board-view')}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[13px] text-[#c7c4d7] hover:bg-[#222a3d] hover:text-[#dae2fd] transition-colors text-left"
            >
              <span className="w-2 h-2 rounded-full bg-[#c0c1ff]"></span>
              <span className="truncate">Sprint 24 — Q3 Launch</span>
            </button>
            <button
              onClick={() => setCurrentView('board-view')}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[13px] text-[#c7c4d7] hover:bg-[#222a3d] hover:text-[#dae2fd] transition-colors text-left"
            >
              <span className="w-2 h-2 rounded-full bg-[#4edea3]"></span>
              <span className="truncate">Personal Growth</span>
            </button>
            <button
              onClick={() => setCurrentView('board-view')}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[13px] text-[#c7c4d7] hover:bg-[#222a3d] hover:text-[#dae2fd] transition-colors text-left"
            >
              <span className="w-2 h-2 rounded-full bg-[#d0bcff]"></span>
              <span className="truncate">Design System</span>
            </button>
          </div>
        </div>

        {/* Quick Tags */}
        <div className="px-3 mt-4 mb-3">
          <p className="px-3 py-1 text-[11px] text-[#c7c4d7]/70 uppercase tracking-wider font-semibold">
            Quick Tags
          </p>
          <div className="flex flex-wrap gap-1 px-3 py-1">
            <button
              onClick={() => onTagClick('Frontend')}
              className="px-2 py-0.5 rounded-md bg-[#171f33] border border-[#464554]/30 text-[#c7c4d7] text-[11px] font-semibold hover:bg-[#222a3d] hover:text-[#dae2fd] transition-colors"
            >
              #Frontend
            </button>
            <button
              onClick={() => onTagClick('API')}
              className="px-2 py-0.5 rounded-md bg-[#171f33] border border-[#464554]/30 text-[#c7c4d7] text-[11px] font-semibold hover:bg-[#222a3d] hover:text-[#dae2fd] transition-colors"
            >
              #API
            </button>
            <button
              onClick={() => onTagClick('Design')}
              className="px-2 py-0.5 rounded-md bg-[#171f33] border border-[#464554]/30 text-[#c7c4d7] text-[11px] font-semibold hover:bg-[#222a3d] hover:text-[#dae2fd] transition-colors"
            >
              #Design
            </button>
            <button
              onClick={() => onTagClick('Urgent')}
              className="px-2 py-0.5 rounded-md bg-[#171f33] border border-[#464554]/30 text-[#ffb4ab] text-[11px] font-semibold hover:bg-[#222a3d] transition-colors"
            >
              #Urgent
            </button>
          </div>
        </div>
      </div>

      {/* Profile Card Footer */}
      <div className="p-3 bg-[#060e20]/60 border-t border-[#464554]/20">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-[#171f33] hover:bg-[#222a3d] transition-colors cursor-pointer">
          <div className="relative flex-shrink-0">
            <img
              alt="Elena Rostova"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-[#171f33]"
              src={ELENA_AVATAR}
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#00885d] ring-2 ring-[#0b1326]"></span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[#dae2fd] truncate">
              Elena Rostova
            </p>
            <p className="text-[12px] text-[#c7c4d7] truncate">Lead Engineer</p>
          </div>
          <span className="material-symbols-outlined text-[#c7c4d7] text-base">
            more_vert
          </span>
        </div>
      </div>
    </aside>
  );
};
