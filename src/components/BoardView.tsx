import React, { useState } from 'react';
import { Task, TaskStatus, WorkspaceView } from '../types';
import { TaskInspectorDrawer } from './TaskInspectorDrawer';

interface BoardViewProps {
  tasks: Task[];
  filteredTasks: Task[];
  inspectingTaskId: string | null;
  setInspectingTaskId: (id: string | null) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onAddTask: (task: Partial<Task>) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, title: string, detail?: string) => void;
  onMoveTaskStatus: (id: string, newStatus: TaskStatus) => void;
  onAutoOrganize: () => void;
  setCurrentView: (view: WorkspaceView) => void;
  storageUsedKB: number;
}

export const BoardView: React.FC<BoardViewProps> = ({
  tasks,
  filteredTasks,
  inspectingTaskId,
  setInspectingTaskId,
  isDrawerOpen,
  setIsDrawerOpen,
  onUpdateTask,
  onDeleteTask,
  onAddTask,
  onToggleSubtask,
  onAddSubtask,
  onMoveTaskStatus,
  onAutoOrganize,
  setCurrentView,
  storageUsedKB,
}) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);
  const [inlineNewTaskStatus, setInlineNewTaskStatus] = useState<TaskStatus | null>(null);
  const [inlineTitle, setInlineTitle] = useState('');

  const todoTasks = filteredTasks.filter((t) => t.status === 'to-do');
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'in-progress');
  const doneTasks = filteredTasks.filter((t) => t.status === 'done');

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedTaskId(id);
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (id) {
      onMoveTaskStatus(id, targetStatus);
    }
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  const handleCreateInlineTask = (status: TaskStatus) => {
    if (!inlineTitle.trim()) return;
    onAddTask({
      title: inlineTitle.trim(),
      status: status,
      priority: 'P1',
      priorityLabel: 'P1 Medium',
      tags: ['#UI'],
    });
    setInlineTitle('');
    setInlineNewTaskStatus(null);
  };

  const activeTask = tasks.find((t) => t.id === inspectingTaskId) || tasks[0] || null;

  return (
    <div className="w-full flex flex-col">
      {/* Top Ambient Glow Field */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-[#c0c1ff]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -top-20 right-1/4 w-80 h-80 bg-[#571bc1]/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header Toolbar & Meta Strip */}
        <div className="w-full px-6 pt-5 pb-4 flex flex-col gap-4">
          {/* Title & Main Actions Row */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-[#222a3d] text-[#c0c1ff] font-mono text-[11px] tracking-wider uppercase font-semibold">
                  Sprint 24
                </span>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#171f33] border border-[#464554]/30 text-[11px] text-[#4edea3] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse"></span>
                  <span>Active Sprint</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#222a3d] text-[#c7c4d7] font-mono text-[11px]">
                  <span className="material-symbols-outlined text-sm text-[#c0c1ff]">
                    cloud_done
                  </span>
                  <span>💾 LocalStorage in Sync ({storageUsedKB || 42}KB used)</span>
                </div>
              </div>

              <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-[28px] text-[#dae2fd] tracking-tight mt-1">
                Sprint 24 — Product Launch
              </h1>
              <p className="text-[14px] text-[#c7c4d7] max-w-3xl">
                Vite + React challenge board with localStorage synchronization and AI subtask decomposition.
              </p>
            </div>

            {/* Right Side CTA Cluster */}
            <div className="flex items-center gap-2.5 flex-wrap self-start xl:self-center">
              {/* View switcher toggle pill */}
              <div className="p-1 rounded-xl bg-[#131b2e] border border-[#464554]/40 flex items-center gap-1 shadow-sm">
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg bg-[#171f33] text-[#c0c1ff] text-[12px] font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-sm">view_kanban</span>
                  <span>Board</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView('list-view')}
                  className="px-3 py-1.5 rounded-lg text-[#c7c4d7] hover:text-[#dae2fd] text-[12px] font-medium flex items-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">format_list_bulleted</span>
                  <span>List</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView('calendar')}
                  className="px-3 py-1.5 rounded-lg text-[#c7c4d7] hover:text-[#dae2fd] text-[12px] font-medium flex items-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">timeline</span>
                  <span>Timeline</span>
                </button>
              </div>

              {/* Group By dropdown */}
              <div className="relative">
                <button
                  type="button"
                  className="h-9 px-3 rounded-lg bg-[#171f33] hover:bg-[#222a3d] border border-[#464554]/30 text-[#dae2fd] text-[12px] font-medium flex items-center gap-2 transition-colors shadow-sm"
                >
                  <span className="text-[#c7c4d7]">Group:</span>
                  <span className="font-semibold text-[#c0c1ff]">Status</span>
                  <span className="material-symbols-outlined text-xs text-[#c7c4d7]">
                    expand_more
                  </span>
                </button>
              </div>

              {/* Auto-Organize with AI Button */}
              <button
                type="button"
                onClick={onAutoOrganize}
                className="h-9 px-3.5 rounded-lg bg-[#571bc1] text-[#c4abff] hover:bg-[#571bc1]/90 border border-[#c4abff]/30 text-[12px] font-semibold flex items-center gap-2 transition-all shadow-md group"
                id="aiAutoOrganizeBtn"
              >
                <span className="material-symbols-outlined text-sm group-hover:rotate-12 transition-transform">
                  auto_awesome
                </span>
                <span>Auto-Organize with AI</span>
              </button>

              {/* Add Task Primary Button */}
              <button
                type="button"
                onClick={() => setInlineNewTaskStatus('to-do')}
                className="h-9 px-4 rounded-lg bg-[#8083ff] text-[#0d0096] hover:bg-[#c0c1ff] text-[12px] font-semibold flex items-center gap-1.5 transition-all shadow-md"
                id="openNewTaskDrawerBtn"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                <span>Add Task</span>
              </button>
            </div>
          </div>

          {/* Filters & Telemetry Matrix */}
          <div className="flex items-center justify-between gap-4 pt-1 flex-wrap border-t border-[#464554]/20">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-[#c7c4d7]/70 uppercase tracking-wider font-semibold mr-1">
                Active Filters:
              </span>
              <div className="px-2.5 py-1 rounded-full bg-[#171f33] border border-[#464554]/30 text-[#dae2fd] text-[11px] flex items-center gap-1.5 group cursor-pointer hover:bg-[#222a3d] transition-colors">
                <span className="text-[#c7c4d7]">Status:</span>
                <span className="font-semibold text-[#c0c1ff]">All</span>
                <span className="material-symbols-outlined text-xs text-[#c7c4d7] group-hover:text-[#ffb4ab] transition-colors">
                  close
                </span>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-[#171f33] border border-[#464554]/30 text-[#dae2fd] text-[11px] flex items-center gap-1.5 group cursor-pointer hover:bg-[#222a3d] transition-colors">
                <span className="text-[#c7c4d7]">Priority:</span>
                <span className="font-semibold text-[#d0bcff]">High, Med</span>
                <span className="material-symbols-outlined text-xs text-[#c7c4d7] group-hover:text-[#ffb4ab] transition-colors">
                  close
                </span>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-[#171f33] border border-[#464554]/30 text-[#dae2fd] text-[11px] flex items-center gap-1.5 group cursor-pointer hover:bg-[#222a3d] transition-colors">
                <span className="text-[#c7c4d7]">Tags:</span>
                <span className="font-semibold text-[#4edea3]">#Frontend, #API</span>
                <span className="material-symbols-outlined text-xs text-[#c7c4d7] group-hover:text-[#ffb4ab] transition-colors">
                  close
                </span>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-[#171f33] border border-[#464554]/30 text-[#dae2fd] text-[11px] flex items-center gap-1.5 group cursor-pointer hover:bg-[#222a3d] transition-colors">
                <span className="material-symbols-outlined text-xs text-[#4edea3]">
                  event
                </span>
                <span className="font-semibold">Due this week</span>
                <span className="material-symbols-outlined text-xs text-[#c7c4d7] group-hover:text-[#ffb4ab] transition-colors">
                  close
                </span>
              </div>
              <button
                type="button"
                className="text-[11px] text-[#c7c4d7] hover:text-[#c0c1ff] transition-colors ml-1 font-semibold"
              >
                Reset all
              </button>
            </div>

            {/* Velocity Tracker & Sprint Health */}
            <div className="hidden lg:flex items-center gap-5 bg-[#131b2e] border border-[#464554]/30 px-4 py-1.5 rounded-xl shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#c7c4d7]">Velocity:</span>
                <span className="font-mono text-[12px] font-semibold text-[#4edea3]">+28%</span>
                <svg className="w-16 h-4 text-[#4edea3] stroke-current fill-none" viewBox="0 0 64 16">
                  <path
                    d="M1 14 L15 11 L30 13 L45 5 L63 2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <div className="w-px h-4 bg-[#2d3449]"></div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#c7c4d7]">Sprint Health:</span>
                <div className="w-16 h-2 rounded-full bg-[#2d3449] overflow-hidden">
                  <div className="h-full bg-[#4edea3] rounded-full" style={{ width: '78%' }}></div>
                </div>
                <span className="font-mono text-[12px] font-semibold text-[#dae2fd]">78%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Canvas / Kanban Matrix (Grid layout with drawer accommodation) */}
      <div className="w-full px-6 pb-12 flex-1 flex flex-col xl:flex-row items-start gap-5 relative">
        {/* Kanban 3-Column Rail */}
        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
          {/* ================= COLUMN 1: TO DO ================= */}
          <div
            onDragOver={(e) => handleDragOver(e, 'to-do')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'to-do')}
            className={`w-full flex flex-col rounded-2xl bg-[#131b2e]/80 backdrop-blur-md p-3.5 gap-2.5 shadow-md border transition-all ${
              dragOverColumn === 'to-do'
                ? 'border-[#8083ff] bg-[#171f33]'
                : 'border-[#464554]/30'
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-1 py-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#464554]"></span>
                <h2 className="font-['Plus_Jakarta_Sans'] font-semibold text-[17px] text-[#dae2fd] tracking-tight">
                  TO DO
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#171f33] border border-[#464554]/30 text-[#dae2fd] font-mono text-xs font-semibold">
                  {todoTasks.length}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#c7c4d7] hover:text-[#dae2fd] hover:bg-[#171f33] transition-colors"
                >
                  <span className="material-symbols-outlined text-base">filter_list</span>
                </button>
                <button
                  type="button"
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#c7c4d7] hover:text-[#dae2fd] hover:bg-[#171f33] transition-colors"
                >
                  <span className="material-symbols-outlined text-base">more_horiz</span>
                </button>
              </div>
            </div>

            {/* Column Card Stack */}
            <div className="flex flex-col gap-2.5">
              {todoTasks.map((t) => {
                const isInspecting = t.id === inspectingTaskId;
                const completedSubs = t.subtasks.filter((s) => s.completed).length;

                return (
                  <div
                    key={t.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, t.id)}
                    onClick={() => {
                      setInspectingTaskId(t.id);
                      setIsDrawerOpen(true);
                    }}
                    className={`group relative rounded-xl transition-all p-3.5 flex flex-col gap-2 shadow-sm cursor-pointer hover:shadow-xl hover:-translate-y-0.5 border ${
                      isInspecting
                        ? 'bg-[#222a3d] ring-1 ring-[#c0c1ff]/50 border-[#8083ff]/50'
                        : 'bg-[#171f33] hover:bg-[#222a3d] border-[#464554]/25'
                    }`}
                  >
                    {isInspecting && (
                      <div className="absolute -top-2 right-2 px-2 py-0.5 rounded-full bg-[#8083ff] text-[#0d0096] text-[10px] font-bold tracking-wider flex items-center gap-1 shadow-sm">
                        <span className="material-symbols-outlined text-xs">visibility</span>
                        <span>Inspecting</span>
                      </div>
                    )}

                    {/* Tags & Priority */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 ${
                          t.priority === 'P0'
                            ? 'bg-[#93000a] text-[#ffdad6]'
                            : t.priority === 'P1'
                            ? 'bg-[#2d3449] text-[#d0bcff]'
                            : 'bg-[#222a3d] text-[#c7c4d7]'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            t.priority === 'P0' ? 'bg-[#ffb4ab]' : 'bg-[#d0bcff]'
                          }`}
                        ></span>
                        <span>{t.priorityLabel || t.priority}</span>
                      </span>

                      <div className="flex items-center gap-1">
                        {t.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-md bg-[#2d3449] text-[#c7c4d7] font-mono text-[11px]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Checkbox & Title */}
                    <div className="flex items-start gap-2 pt-0.5">
                      <input
                        type="checkbox"
                        checked={false}
                        onChange={(e) => {
                          e.stopPropagation();
                          onMoveTaskStatus(t.id, 'done');
                        }}
                        className="mt-1 w-4 h-4 rounded bg-[#222a3d] accent-[#8083ff] cursor-pointer"
                      />
                      <p
                        className={`font-['Plus_Jakarta_Sans'] font-semibold text-[15px] tracking-normal leading-snug ${
                          isInspecting ? 'text-[#c0c1ff]' : 'text-[#dae2fd]'
                        }`}
                      >
                        {t.title}
                      </p>
                    </div>

                    <p className="text-[12px] text-[#c7c4d7] line-clamp-2 leading-relaxed">
                      {t.description}
                    </p>

                    {/* Progress fraction & footer meta */}
                    <div className="flex items-center justify-between pt-1 border-t border-[#464554]/20 text-[11px]">
                      <div className="flex items-center gap-3">
                        {t.subtasks.length > 0 && (
                          <div className="flex items-center gap-1 font-mono text-[#c7c4d7]">
                            <span className="material-symbols-outlined text-sm text-[#c0c1ff]">
                              checklist
                            </span>
                            <span>
                              {completedSubs}/{t.subtasks.length}
                            </span>
                          </div>
                        )}
                        <div
                          className={`flex items-center gap-1 font-medium ${
                            t.dueDate === 'Today' || t.dueDate === 'Tomorrow'
                              ? 'text-[#ffb4ab]'
                              : 'text-[#c7c4d7]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          <span>{t.dueDate}</span>
                        </div>
                      </div>

                      <div className="flex items-center -space-x-1.5">
                        <img
                          alt={t.assignee.name}
                          className="w-6 h-6 rounded-full object-cover ring-2 ring-[#171f33]"
                          src={t.assignee.avatar}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Inline quick add */}
              {inlineNewTaskStatus === 'to-do' ? (
                <div className="p-2.5 rounded-xl bg-[#171f33] border border-[#8083ff]/60 flex flex-col gap-2">
                  <input
                    type="text"
                    value={inlineTitle}
                    onChange={(e) => setInlineTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateInlineTask('to-do');
                      if (e.key === 'Escape') setInlineNewTaskStatus(null);
                    }}
                    placeholder="Task name... Press Enter to save"
                    className="w-full bg-[#060e20] border border-[#464554]/40 rounded-lg p-2 text-xs text-[#dae2fd] focus:outline-none focus:ring-1 focus:ring-[#c0c1ff]"
                    autoFocus
                  />
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setInlineNewTaskStatus(null)}
                      className="px-2.5 py-1 text-xs text-[#c7c4d7] hover:bg-[#222a3d] rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCreateInlineTask('to-do')}
                      className="px-3 py-1 bg-[#8083ff] text-[#0d0096] text-xs font-semibold rounded"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setInlineNewTaskStatus('to-do')}
                  className="w-full py-2.5 rounded-xl bg-[#171f33]/50 hover:bg-[#171f33] border border-[#464554]/20 text-[#c7c4d7] hover:text-[#dae2fd] text-[13px] font-medium flex items-center justify-center gap-1.5 transition-all mt-1"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  <span>Add new task</span>
                </button>
              )}
            </div>
          </div>

          {/* ================= COLUMN 2: IN PROGRESS ================= */}
          <div
            onDragOver={(e) => handleDragOver(e, 'in-progress')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'in-progress')}
            className={`w-full flex flex-col rounded-2xl bg-[#131b2e]/80 backdrop-blur-md p-3.5 gap-2.5 shadow-md border transition-all ${
              dragOverColumn === 'in-progress'
                ? 'border-[#8083ff] bg-[#171f33]'
                : 'border-[#464554]/30'
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-1 py-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8083ff] animate-ping"></span>
                <h2 className="font-['Plus_Jakarta_Sans'] font-semibold text-[17px] text-[#dae2fd] tracking-tight">
                  IN PROGRESS
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#8083ff] text-[#0d0096] font-mono text-xs font-bold">
                  {inProgressTasks.length}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#c7c4d7] hover:text-[#dae2fd] hover:bg-[#171f33] transition-colors"
                >
                  <span className="material-symbols-outlined text-base">filter_list</span>
                </button>
                <button
                  type="button"
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#c7c4d7] hover:text-[#dae2fd] hover:bg-[#171f33] transition-colors"
                >
                  <span className="material-symbols-outlined text-base">more_horiz</span>
                </button>
              </div>
            </div>

            {/* Column Card Stack */}
            <div className="flex flex-col gap-2.5">
              {inProgressTasks.map((t) => {
                const isInspecting = t.id === inspectingTaskId;
                const completedSubs = t.subtasks.filter((s) => s.completed).length;

                return (
                  <div
                    key={t.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, t.id)}
                    onClick={() => {
                      setInspectingTaskId(t.id);
                      setIsDrawerOpen(true);
                    }}
                    className={`group relative rounded-xl transition-all p-3.5 flex flex-col gap-2 shadow-sm cursor-pointer hover:shadow-xl hover:-translate-y-0.5 border ${
                      isInspecting
                        ? 'bg-[#222a3d] ring-1 ring-[#c0c1ff]/50 border-[#8083ff]/50'
                        : 'bg-[#171f33] hover:bg-[#222a3d] border-[#464554]/25'
                    }`}
                  >
                    {isInspecting && (
                      <div className="absolute -top-2 right-2 px-2 py-0.5 rounded-full bg-[#8083ff] text-[#0d0096] text-[10px] font-bold tracking-wider flex items-center gap-1 shadow-sm">
                        <span className="material-symbols-outlined text-xs">visibility</span>
                        <span>Inspecting</span>
                      </div>
                    )}

                    {/* Tags & Priority & Timer badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 ${
                          t.priority === 'P0'
                            ? 'bg-[#93000a] text-[#ffdad6]'
                            : t.priority === 'P1'
                            ? 'bg-[#2d3449] text-[#d0bcff]'
                            : 'bg-[#222a3d] text-[#c7c4d7]'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            t.priority === 'P0' ? 'bg-[#ffb4ab]' : 'bg-[#d0bcff]'
                          }`}
                        ></span>
                        <span>{t.priorityLabel || t.priority}</span>
                      </span>

                      <div className="flex items-center gap-1.5">
                        {t.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-md bg-[#2d3449] text-[#c7c4d7] font-mono text-[11px]"
                          >
                            {tag}
                          </span>
                        ))}
                        {t.dueLabel && t.dueLabel.includes('m') && (
                          <span className="px-2 py-0.5 rounded-md bg-[#571bc1]/60 text-[#d0bcff] font-mono text-[11px] flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">timer</span>
                            <span>{t.dueLabel}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Checkbox & Title */}
                    <div className="flex items-start gap-2 pt-0.5">
                      <input
                        type="checkbox"
                        checked={false}
                        onChange={(e) => {
                          e.stopPropagation();
                          onMoveTaskStatus(t.id, 'done');
                        }}
                        className="mt-1 w-4 h-4 rounded bg-[#222a3d] accent-[#8083ff] cursor-pointer"
                      />
                      <p
                        className={`font-['Plus_Jakarta_Sans'] font-semibold text-[15px] tracking-normal leading-snug ${
                          isInspecting ? 'text-[#c0c1ff]' : 'text-[#dae2fd]'
                        }`}
                      >
                        {t.title}
                      </p>
                    </div>

                    <p className="text-[12px] text-[#c7c4d7] line-clamp-2 leading-relaxed">
                      {t.description}
                    </p>

                    {/* Progress Bar (65% or 40%) */}
                    {t.progress !== undefined && (
                      <div className="w-full flex flex-col gap-1 pt-1">
                        <div className="flex items-center justify-between text-[11px] text-[#c7c4d7]">
                          <span>{t.columnProgressLabel || 'Progress'}</span>
                          <span className="font-semibold text-[#c0c1ff] font-mono">
                            {t.progress}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[#2d3449] overflow-hidden">
                          <div
                            className="h-full bg-[#8083ff] rounded-full transition-all duration-500"
                            style={{ width: `${t.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Pomodoro card widget if card TF-111 */}
                    {t.id === 'TF-111' && (
                      <div className="p-2.5 rounded-lg bg-[#060e20] border border-[#464554]/30 flex items-center justify-between my-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-ping"></span>
                          <span className="font-mono text-xs text-[#4edea3] font-semibold">
                            24:12 remaining
                          </span>
                        </div>
                        <span className="material-symbols-outlined text-[#4edea3] text-base">
                          volume_up
                        </span>
                      </div>
                    )}

                    {/* Footer Meta */}
                    <div className="flex items-center justify-between pt-1 border-t border-[#464554]/20 text-[11px]">
                      <div className="flex items-center gap-3">
                        {t.subtasks.length > 0 && (
                          <div className="flex items-center gap-1 font-mono text-[#c7c4d7]">
                            <span className="material-symbols-outlined text-sm text-[#c0c1ff]">
                              checklist
                            </span>
                            <span>
                              {completedSubs}/{t.subtasks.length}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 font-medium text-[#4edea3]">
                          <span className="material-symbols-outlined text-sm">sync</span>
                          <span>Live</span>
                        </div>
                      </div>

                      <div className="flex items-center -space-x-1.5">
                        <img
                          alt={t.assignee.name}
                          className="w-6 h-6 rounded-full object-cover ring-2 ring-[#171f33]"
                          src={t.assignee.avatar}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Inline quick add */}
              {inlineNewTaskStatus === 'in-progress' ? (
                <div className="p-2.5 rounded-xl bg-[#171f33] border border-[#8083ff]/60 flex flex-col gap-2">
                  <input
                    type="text"
                    value={inlineTitle}
                    onChange={(e) => setInlineTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateInlineTask('in-progress');
                      if (e.key === 'Escape') setInlineNewTaskStatus(null);
                    }}
                    placeholder="Task name... Press Enter to save"
                    className="w-full bg-[#060e20] border border-[#464554]/40 rounded-lg p-2 text-xs text-[#dae2fd] focus:outline-none focus:ring-1 focus:ring-[#c0c1ff]"
                    autoFocus
                  />
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setInlineNewTaskStatus(null)}
                      className="px-2.5 py-1 text-xs text-[#c7c4d7] hover:bg-[#222a3d] rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCreateInlineTask('in-progress')}
                      className="px-3 py-1 bg-[#8083ff] text-[#0d0096] text-xs font-semibold rounded"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setInlineNewTaskStatus('in-progress')}
                  className="w-full py-2.5 rounded-xl bg-[#171f33]/50 hover:bg-[#171f33] border border-[#464554]/20 text-[#c7c4d7] hover:text-[#dae2fd] text-[13px] font-medium flex items-center justify-center gap-1.5 transition-all mt-1"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  <span>Add new task</span>
                </button>
              )}
            </div>
          </div>

          {/* ================= COLUMN 3: DONE ================= */}
          <div
            onDragOver={(e) => handleDragOver(e, 'done')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'done')}
            className={`w-full flex flex-col rounded-2xl bg-[#131b2e]/80 backdrop-blur-md p-3.5 gap-2.5 shadow-md border transition-all ${
              dragOverColumn === 'done'
                ? 'border-[#8083ff] bg-[#171f33]'
                : 'border-[#464554]/30'
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-1 py-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4edea3]"></span>
                <h2 className="font-['Plus_Jakarta_Sans'] font-semibold text-[17px] text-[#dae2fd] tracking-tight">
                  DONE
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#00885d]/30 text-[#4edea3] font-mono text-xs font-semibold">
                  {doneTasks.length}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#c7c4d7] hover:text-[#dae2fd] hover:bg-[#171f33] transition-colors"
                >
                  <span className="material-symbols-outlined text-base">filter_list</span>
                </button>
                <button
                  type="button"
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#c7c4d7] hover:text-[#dae2fd] hover:bg-[#171f33] transition-colors"
                >
                  <span className="material-symbols-outlined text-base">more_horiz</span>
                </button>
              </div>
            </div>

            {/* Column Card Stack */}
            <div className="flex flex-col gap-2.5">
              {doneTasks.map((t) => {
                const isInspecting = t.id === inspectingTaskId;

                return (
                  <div
                    key={t.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, t.id)}
                    onClick={() => {
                      setInspectingTaskId(t.id);
                      setIsDrawerOpen(true);
                    }}
                    className={`group relative rounded-xl transition-all p-3.5 flex flex-col gap-2 shadow-sm cursor-pointer opacity-80 hover:opacity-100 border ${
                      isInspecting
                        ? 'bg-[#222a3d] ring-1 ring-[#c0c1ff]/50 border-[#8083ff]/50'
                        : 'bg-[#171f33]/60 hover:bg-[#171f33] border-[#464554]/25'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-[#00885d]/40 text-[#4edea3] text-[11px] font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">check_circle</span>
                        <span>Completed</span>
                      </span>
                      <span className="font-mono text-[11px] text-[#c7c4d7]">
                        {t.dueDate || '2h ago'}
                      </span>
                    </div>

                    <div className="flex items-start gap-2 pt-0.5">
                      <div className="mt-1 w-4 h-4 rounded bg-[#4edea3] text-[#003824] flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-xs font-bold">check</span>
                      </div>
                      <p className="font-['Plus_Jakarta_Sans'] font-semibold text-[15px] text-[#c7c4d7] line-through tracking-normal leading-snug">
                        {t.title}
                      </p>
                    </div>

                    {t.description && (
                      <p className="text-[12px] text-[#c7c4d7]/70 line-through line-clamp-1">
                        {t.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-[#464554]/20 text-[11px]">
                      <div className="flex items-center gap-1">
                        {t.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-md bg-[#2d3449] text-[#c7c4d7] font-mono text-[11px]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-1 text-[#4edea3] font-medium">
                        <span className="material-symbols-outlined text-xs">verified</span>
                        <span>Shipped</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Archive Banner */}
              <div className="p-3 rounded-xl bg-[#171f33]/40 border border-[#464554]/20 flex items-center justify-between text-[#c7c4d7]">
                <span className="text-[12px]">2 older tasks archived</span>
                <button
                  type="button"
                  onClick={() => setCurrentView('list-view')}
                  className="text-[12px] text-[#c0c1ff] hover:underline font-semibold"
                >
                  View
                </button>
              </div>

              {/* Quick Add */}
              <button
                type="button"
                onClick={() => {
                  onAddTask({
                    title: 'Completed verification pass',
                    status: 'done',
                    priority: 'P2',
                    tags: ['#Core'],
                  });
                }}
                className="w-full py-2.5 rounded-xl bg-[#171f33]/50 hover:bg-[#171f33] border border-[#464554]/20 text-[#c7c4d7] hover:text-[#dae2fd] text-[13px] font-medium flex items-center justify-center gap-1.5 transition-all mt-1"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                <span>Add completed task</span>
              </button>
            </div>
          </div>
        </div>

        {/* ================= INTERACTIVE INSPECTOR / SLIDE-OVER DRAWER ================= */}
        {isDrawerOpen && activeTask && (
          <TaskInspectorDrawer
            task={activeTask}
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
            onToggleSubtask={onToggleSubtask}
            onAddSubtask={onAddSubtask}
            storageUsedKB={storageUsedKB}
          />
        )}
      </div>
    </div>
  );
};
