import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority } from '../types';

interface ListViewProps {
  tasks: Task[];
  filteredTasks: Task[];
  selectedTaskIds: Set<string>;
  onToggleSelectTask: (id: string) => void;
  onSelectAllInGroup: (taskIds: string[], select: boolean) => void;
  onMoveTaskStatus: (id: string, newStatus: TaskStatus) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onDuplicateTask: (id: string) => void;
  onAddTask: (task: Partial<Task>) => void;
  onOpenAiModalForTask: (task: Task) => void;
  onExportJson: () => void;
  onSyncBackup: () => void;
  onResetMock: () => void;
  onClearStorage: () => void;
  onBulkMarkDone: () => void;
  onBulkDelete: () => void;
  onBulkSetPriority: (priority: TaskPriority) => void;
  storageStats: { usedKB: number; totalMB: number; percent: number };
  lastSavedDiff: number;
  tagFilter: string;
  setTagFilter: (tag: string) => void;
}

export const ListView: React.FC<ListViewProps> = ({
  tasks,
  filteredTasks,
  selectedTaskIds,
  onToggleSelectTask,
  onSelectAllInGroup,
  onMoveTaskStatus,
  onUpdateTask,
  onDeleteTask,
  onDuplicateTask,
  onAddTask,
  onOpenAiModalForTask,
  onExportJson,
  onSyncBackup,
  onResetMock,
  onClearStorage,
  onBulkMarkDone,
  onBulkDelete,
  onBulkSetPriority,
  storageStats,
  lastSavedDiff,
  tagFilter,
  setTagFilter,
}) => {
  // Collapsible sections
  const [collapsed, setCollapsed] = useState<{ [key: string]: boolean }>({
    'in-progress': false,
    'to-do': false,
    done: false,
  });

  // Quick inline add inputs
  const [quickAddValues, setQuickAddValues] = useState<{ [key: string]: string }>({
    'in-progress': '',
    'to-do': '',
    done: '',
  });

  const toggleCollapse = (group: string) => {
    setCollapsed((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const handleQuickAdd = (statusGroup: TaskStatus) => {
    const val = (quickAddValues[statusGroup] || '').trim();
    if (!val) return;
    onAddTask({
      title: val,
      status: statusGroup,
      priority: 'P1',
      priorityLabel: 'P1 Medium',
      tags: ['#Frontend', '#UI'],
      subtasks: [
        { id: 'st-quick-1', title: 'Implementation', completed: statusGroup === 'done' },
        { id: 'st-quick-2', title: 'Unit Tests', completed: statusGroup === 'done' },
      ],
      dueDate: statusGroup === 'done' ? 'Oct 24' : 'Today',
      pomodoro: { current: statusGroup === 'done' ? 2 : 0, total: 2, spentHours: statusGroup === 'done' ? 1.5 : 0 },
    });
    setQuickAddValues((prev) => ({ ...prev, [statusGroup]: '' }));
  };

  const inProgressList = filteredTasks.filter((t) => t.status === 'in-progress');
  const todoList = filteredTasks.filter((t) => t.status === 'to-do');
  const doneList = filteredTasks.filter((t) => t.status === 'done');

  const totalDone = tasks.filter((t) => t.status === 'done').length;
  const completionRate = tasks.length > 0 ? Math.round((totalDone / tasks.length) * 100) : 0;
  const dueTodayCount = tasks.filter((t) => t.dueDate === 'Today').length;

  const renderTaskRow = (task: Task) => {
    const isSelected = selectedTaskIds.has(task.id);
    const isDone = task.status === 'done';
    const completedSubs = task.subtasks.filter((s) => s.completed).length;

    return (
      <div
        key={task.id}
        className={`task-row group grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-3 items-center px-4 py-3 hover:bg-[#171f33]/60 transition-colors border-b border-[#464554]/15 ${
          isSelected ? 'bg-[#222a3d]/50' : ''
        } ${isDone ? 'opacity-75' : ''}`}
      >
        {/* Checkbox & Priority Tag */}
        <div className="col-span-1 flex items-center gap-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelectTask(task.id)}
            className="w-4 h-4 rounded bg-[#171f33] accent-[#8083ff] cursor-pointer"
          />
          <span
            className={`px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1 ${
              task.priority === 'P0'
                ? 'bg-[#93000a] text-[#ffdad6]'
                : task.priority === 'P1'
                ? 'bg-[#171f33] text-[#c0c1ff]'
                : task.priority === 'P2'
                ? 'bg-[#171f33] text-[#4edea3]'
                : 'bg-[#171f33] text-[#908fa0]'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                task.priority === 'P0'
                  ? 'bg-[#ffb4ab]'
                  : task.priority === 'P1'
                  ? 'bg-[#c0c1ff]'
                  : task.priority === 'P2'
                  ? 'bg-[#4edea3]'
                  : 'bg-[#908fa0]'
              }`}
            ></span>
            {task.priority}
          </span>
        </div>

        {/* Task Title & Subtasks */}
        <div className="col-span-4 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`font-medium text-[14px] truncate ${
                isDone ? 'line-through text-[#c7c4d7]' : 'text-[#dae2fd]'
              }`}
            >
              {task.title}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[12px] text-[#c7c4d7]/70 truncate max-w-xs">
              {task.description}
            </span>
            {task.subtasks.length > 0 && (
              <span
                className={`font-mono text-[11px] px-1.5 py-0.2 rounded font-medium ${
                  isDone
                    ? 'bg-[#00885d]/30 text-[#4edea3]'
                    : 'bg-[#222a3d] text-[#c0c1ff]'
                }`}
              >
                {completedSubs}/{task.subtasks.length} subtasks
              </span>
            )}
          </div>
        </div>

        {/* Status Dropdown */}
        <div className="col-span-2">
          <select
            value={task.status}
            onChange={(e) => onMoveTaskStatus(task.id, e.target.value as TaskStatus)}
            className={`bg-[#171f33] text-[12px] px-2.5 py-1 rounded-md focus:outline-none cursor-pointer border border-[#464554]/30 font-medium ${
              task.status === 'in-progress'
                ? 'text-[#c0c1ff]'
                : task.status === 'done'
                ? 'text-[#4edea3]'
                : 'text-[#dae2fd]'
            }`}
          >
            <option value="in-progress">In Progress</option>
            <option value="to-do">To Do</option>
            <option value="done">Done</option>
          </select>
        </div>

        {/* Tags */}
        <div className="col-span-2 flex flex-wrap gap-1">
          {task.tags.map((tag) => (
            <span
              key={tag}
              onClick={() => setTagFilter(tag.replace('#', ''))}
              className="px-2 py-0.5 rounded-md bg-[#171f33] border border-[#464554]/25 text-[#c7c4d7] text-[11px] hover:text-[#dae2fd] hover:bg-[#222a3d] cursor-pointer"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Due Date */}
        <div className="col-span-1">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
              task.dueDate === 'Today'
                ? 'bg-[#93000a]/40 text-[#ffb4ab]'
                : isDone
                ? 'bg-[#00885d]/30 text-[#4edea3]'
                : 'bg-[#171f33] text-[#c7c4d7]'
            }`}
          >
            {task.dueDate === 'Today' && (
              <span className="material-symbols-outlined text-xs">warning</span>
            )}
            {task.dueDate}
          </span>
        </div>

        {/* Est / Spent Pomodoro Tomatoes */}
        <div className="col-span-1 font-mono text-[12px] text-[#c7c4d7] flex items-center gap-1">
          <span className={isDone ? 'text-[#4edea3]' : ''}>
            🍅 {task.pomodoro?.current || 0}/{task.pomodoro?.total || 3}
          </span>
          <span className="text-[#908fa0] text-[11px]">
            | {task.pomodoro?.spentHours || 1.5}h
          </span>
        </div>

        {/* Action Buttons */}
        <div className="col-span-1 flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => onOpenAiModalForTask(task)}
            className="p-1 rounded hover:bg-[#222a3d] text-[#c7c4d7] hover:text-[#d0bcff] transition-colors"
            title="AI Breakdown"
          >
            <span className="material-symbols-outlined text-base">auto_awesome</span>
          </button>
          <button
            type="button"
            onClick={() => onDuplicateTask(task.id)}
            className="p-1 rounded hover:bg-[#222a3d] text-[#c7c4d7] hover:text-[#dae2fd] transition-colors"
            title="Duplicate"
          >
            <span className="material-symbols-outlined text-base">content_copy</span>
          </button>
          <button
            type="button"
            onClick={() => onDeleteTask(task.id)}
            className="p-1 rounded hover:bg-[#93000a]/50 text-[#c7c4d7] hover:text-[#ffb4ab] transition-colors"
            title="Delete"
          >
            <span className="material-symbols-outlined text-base">delete</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col px-6 py-4 space-y-6">
      {/* Header & Live Command Band */}
      <div className="relative overflow-hidden rounded-xl bg-[#131b2e] border border-[#464554]/30 p-5 shadow-sm">
        <div className="absolute -right-24 -top-24 w-96 h-96 bg-[#8083ff]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-1/3 -bottom-20 w-80 h-80 bg-[#00885d]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-[#571bc1] text-[#c4abff] text-[11px] uppercase tracking-wider font-semibold">
                Live Sprint
              </span>
              <span className="font-mono text-[12px] text-[#c7c4d7]">
                BRANCH: main#7f4a9b
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]"></span>
              <span className="text-[12px] text-[#4edea3] font-medium">Continuous Sync</span>
            </div>
            <div className="flex items-baseline gap-2.5">
              <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-[28px] text-[#dae2fd] tracking-tight">
                All Tasks — Sprint 24
              </h1>
              <span className="font-mono text-[12px] text-[#c7c4d7]/80">
                31.5 hrs total sprint scope
              </span>
            </div>
          </div>

          {/* Bulk Command Bar & Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {selectedTaskIds.size > 0 && (
              <div className="flex items-center gap-1.5 bg-[#222a3d] px-3 py-1 rounded-lg border border-[#8083ff]/40 shadow-sm animate-fadeIn">
                <span className="text-[12px] text-[#c0c1ff] font-semibold px-1">
                  {selectedTaskIds.size} selected
                </span>
                <button
                  type="button"
                  onClick={onBulkMarkDone}
                  className="h-8 px-2.5 rounded-md bg-[#00885d] text-[#dae2fd] hover:opacity-90 text-[11px] font-semibold flex items-center gap-1 transition-all"
                >
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  <span>Mark Done</span>
                </button>
                <button
                  type="button"
                  onClick={() => onBulkSetPriority('P0')}
                  className="h-8 px-2.5 rounded-md bg-[#171f33] text-[#dae2fd] hover:bg-[#31394d] text-[11px] flex items-center gap-1 transition-all"
                >
                  <span className="material-symbols-outlined text-sm">flag</span>
                  <span>Set P0</span>
                </button>
                <button
                  type="button"
                  onClick={onBulkDelete}
                  className="h-8 px-2.5 rounded-md bg-[#93000a] text-[#ffdad6] hover:opacity-90 text-[11px] font-semibold flex items-center gap-1 transition-all"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                  <span>Delete</span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onExportJson}
              className="h-9 px-3 rounded-lg bg-[#171f33] hover:bg-[#222a3d] border border-[#464554]/30 text-[#dae2fd] text-[13px] font-medium flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-base text-[#c0c1ff]">
                data_object
              </span>
              <span>Export JSON</span>
            </button>
            <button
              type="button"
              onClick={onSyncBackup}
              className="h-9 px-3 rounded-lg bg-[#171f33] hover:bg-[#222a3d] border border-[#464554]/30 text-[#dae2fd] text-[13px] font-medium flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-base text-[#4edea3]">
                save
              </span>
              <span>Sync Backup</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Matrix */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          {/* Card 1 */}
          <div className="relative overflow-hidden rounded-lg bg-[#171f33] border border-[#464554]/30 p-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-[#c7c4d7] font-semibold">
                Total Tasks
              </span>
              <span className="material-symbols-outlined text-[#c0c1ff] text-lg">
                format_list_bulleted
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-['Plus_Jakarta_Sans'] text-[24px] font-bold text-[#dae2fd]">
                {tasks.length}
              </span>
              <span className="font-mono text-xs text-[#4edea3] font-semibold">+3 vs S23</span>
            </div>
            <div className="w-full bg-[#222a3d] h-1 rounded-full mt-2.5 overflow-hidden">
              <div className="bg-[#8083ff] h-full rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="relative overflow-hidden rounded-lg bg-[#171f33] border border-[#464554]/30 p-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-[#c7c4d7] font-semibold">
                Due Today
              </span>
              <span className="material-symbols-outlined text-[#ffb4ab] text-lg">alarm</span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-['Plus_Jakarta_Sans'] text-[24px] font-bold text-[#ffb4ab]">
                {dueTodayCount}
              </span>
              <span className="font-mono text-xs text-[#ffb4ab]/90">2 Urgent P0</span>
            </div>
            <div className="w-full bg-[#222a3d] h-1 rounded-full mt-2.5 overflow-hidden">
              <div className="bg-[#ffb4ab] h-full rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="relative overflow-hidden rounded-lg bg-[#171f33] border border-[#464554]/30 p-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-[#c7c4d7] font-semibold">
                Completion Rate
              </span>
              <span className="material-symbols-outlined text-[#4edea3] text-lg">
                pie_chart
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-['Plus_Jakarta_Sans'] text-[24px] font-bold text-[#4edea3]">
                {completionRate}%
              </span>
              <span className="font-mono text-xs text-[#c7c4d7]">Target 80%</span>
            </div>
            <div className="w-full bg-[#222a3d] h-1 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-[#4edea3] h-full rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="relative overflow-hidden rounded-lg bg-[#171f33] border border-[#464554]/30 p-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-[#c7c4d7] font-semibold">
                Time Left
              </span>
              <span className="material-symbols-outlined text-[#d0bcff] text-lg">
                timelapse
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="font-['Plus_Jakarta_Sans'] text-[24px] font-bold text-[#d0bcff]">
                14.5<span className="text-[13px] font-normal ml-0.5">hrs</span>
              </span>
              <span className="font-mono text-xs text-[#c7c4d7] ml-1">~18 Pomodoros</span>
            </div>
            <div className="w-full bg-[#222a3d] h-1 rounded-full mt-2.5 overflow-hidden">
              <div className="bg-[#d0bcff] h-full rounded-full" style={{ width: '58%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Filter & Tag Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#131b2e] px-4 py-2.5 rounded-lg border border-[#464554]/30 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <span className="text-[11px] text-[#c7c4d7]/70 uppercase tracking-wider font-semibold">
            Quick Filters:
          </span>
          {['all', 'React', 'Frontend', 'Storage', 'UI', 'API'].map((t) => (
            <button
              key={t}
              onClick={() => setTagFilter(t)}
              className={`px-2.5 py-1 rounded-md text-[12px] font-medium transition-all ${
                tagFilter.toLowerCase() === t.toLowerCase()
                  ? 'bg-[#8083ff] text-[#0d0096] font-semibold'
                  : 'bg-[#171f33] text-[#c7c4d7] hover:text-[#dae2fd] hover:bg-[#222a3d]'
              }`}
            >
              {t === 'all' ? 'All Tags' : `#${t}`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-[#c7c4d7] text-[11px] font-medium">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#ffb4ab]"></span> Urgent (P0)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#c0c1ff]"></span> High (P1)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#4edea3]"></span> Medium (P2)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#908fa0]"></span> Low (P3)
          </span>
        </div>
      </div>

      {/* Master Task Table Container */}
      <div className="flex flex-col space-y-5">
        {/* ================= SECTION 1: IN PROGRESS ================= */}
        <section className="rounded-xl bg-[#131b2e] border border-[#464554]/30 shadow-sm overflow-hidden">
          <div
            onClick={() => toggleCollapse('in-progress')}
            className="flex items-center justify-between px-4 py-2.5 bg-[#171f33]/80 hover:bg-[#171f33] cursor-pointer transition-colors border-b border-[#464554]/20"
          >
            <div className="flex items-center gap-2">
              <span
                className={`material-symbols-outlined text-[#8083ff] text-lg transition-transform duration-200 ${
                  collapsed['in-progress'] ? '-rotate-90' : 'rotate-0'
                }`}
              >
                expand_more
              </span>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8083ff] animate-pulse"></span>
                <h2 className="font-['Plus_Jakarta_Sans'] font-semibold text-[16px] text-[#dae2fd]">
                  IN PROGRESS
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#222a3d] text-[#c0c1ff] font-mono text-xs font-semibold">
                {inProgressList.length} tasks
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[#c7c4d7]">Sprint Velocity: 2.1 tasks/day</span>
            </div>
          </div>

          {!collapsed['in-progress'] && (
            <div className="flex flex-col">
              {/* Inline Quick Add Input */}
              <div className="px-4 py-2.5 bg-[#060e20]/60 border-b border-[#464554]/20 flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#c0c1ff] text-base">
                  add_task
                </span>
                <input
                  type="text"
                  value={quickAddValues['in-progress'] || ''}
                  onChange={(e) =>
                    setQuickAddValues((p) => ({ ...p, 'in-progress': e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleQuickAdd('in-progress');
                  }}
                  placeholder="Press Enter to create an 'In Progress' task instantly..."
                  className="w-full bg-transparent text-[13px] text-[#dae2fd] placeholder:text-[#908fa0] focus:outline-none"
                />
                <span className="font-mono text-xs text-[#908fa0] hidden md:inline">
                  ↵ Return
                </span>
              </div>

              {/* Column Header Row */}
              <div className="hidden lg:grid grid-cols-12 gap-3 px-4 py-2 bg-[#222a3d]/40 text-[11px] uppercase tracking-wider text-[#c7c4d7] font-semibold border-b border-[#464554]/20">
                <div className="col-span-1 flex items-center gap-2">
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      onSelectAllInGroup(
                        inProgressList.map((t) => t.id),
                        e.target.checked
                      )
                    }
                    className="w-3.5 h-3.5 rounded bg-[#171f33] accent-[#8083ff] cursor-pointer"
                  />
                  <span>Priority</span>
                </div>
                <div className="col-span-4">Task & Subtasks</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Tags</div>
                <div className="col-span-1">Due Date</div>
                <div className="col-span-1">Est / Spent</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>

              {/* Rows */}
              <div className="flex flex-col">{inProgressList.map(renderTaskRow)}</div>
            </div>
          )}
        </section>

        {/* ================= SECTION 2: TO DO ================= */}
        <section className="rounded-xl bg-[#131b2e] border border-[#464554]/30 shadow-sm overflow-hidden">
          <div
            onClick={() => toggleCollapse('to-do')}
            className="flex items-center justify-between px-4 py-2.5 bg-[#171f33]/80 hover:bg-[#171f33] cursor-pointer transition-colors border-b border-[#464554]/20"
          >
            <div className="flex items-center gap-2">
              <span
                className={`material-symbols-outlined text-[#c7c4d7] text-lg transition-transform duration-200 ${
                  collapsed['to-do'] ? '-rotate-90' : 'rotate-0'
                }`}
              >
                expand_more
              </span>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#908fa0]"></span>
                <h2 className="font-['Plus_Jakarta_Sans'] font-semibold text-[16px] text-[#dae2fd]">
                  TO DO
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#222a3d] text-[#c7c4d7] font-mono text-xs font-semibold">
                {todoList.length} tasks
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[#c7c4d7]">Estimated: 12.0 hrs</span>
            </div>
          </div>

          {!collapsed['to-do'] && (
            <div className="flex flex-col">
              {/* Quick Add */}
              <div className="px-4 py-2.5 bg-[#060e20]/60 border-b border-[#464554]/20 flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#908fa0] text-base">
                  add_task
                </span>
                <input
                  type="text"
                  value={quickAddValues['to-do'] || ''}
                  onChange={(e) =>
                    setQuickAddValues((p) => ({ ...p, 'to-do': e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleQuickAdd('to-do');
                  }}
                  placeholder="Press Enter to create a 'To Do' task instantly..."
                  className="w-full bg-transparent text-[13px] text-[#dae2fd] placeholder:text-[#908fa0] focus:outline-none"
                />
                <span className="font-mono text-xs text-[#908fa0] hidden md:inline">
                  ↵ Return
                </span>
              </div>

              {/* Rows */}
              <div className="flex flex-col">{todoList.map(renderTaskRow)}</div>
            </div>
          )}
        </section>

        {/* ================= SECTION 3: DONE ================= */}
        <section className="rounded-xl bg-[#131b2e] border border-[#464554]/30 shadow-sm overflow-hidden">
          <div
            onClick={() => toggleCollapse('done')}
            className="flex items-center justify-between px-4 py-2.5 bg-[#171f33]/80 hover:bg-[#171f33] cursor-pointer transition-colors border-b border-[#464554]/20"
          >
            <div className="flex items-center gap-2">
              <span
                className={`material-symbols-outlined text-[#4edea3] text-lg transition-transform duration-200 ${
                  collapsed['done'] ? '-rotate-90' : 'rotate-0'
                }`}
              >
                expand_more
              </span>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4edea3]"></span>
                <h2 className="font-['Plus_Jakarta_Sans'] font-semibold text-[16px] text-[#dae2fd]">
                  DONE
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#222a3d] text-[#4edea3] font-mono text-xs font-semibold">
                {doneList.length} tasks
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-[#4edea3] font-medium">
              <span className="material-symbols-outlined text-sm">verified</span>
              <span>100% Verified</span>
            </div>
          </div>

          {!collapsed['done'] && (
            <div className="flex flex-col">
              {/* Quick Add */}
              <div className="px-4 py-2.5 bg-[#060e20]/60 border-b border-[#464554]/20 flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#4edea3] text-base">
                  add_task
                </span>
                <input
                  type="text"
                  value={quickAddValues['done'] || ''}
                  onChange={(e) =>
                    setQuickAddValues((p) => ({ ...p, done: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleQuickAdd('done');
                  }}
                  placeholder="Press Enter to add an already completed task..."
                  className="w-full bg-transparent text-[13px] text-[#dae2fd] placeholder:text-[#908fa0] focus:outline-none"
                />
                <span className="font-mono text-xs text-[#908fa0] hidden md:inline">
                  ↵ Return
                </span>
              </div>

              {/* Rows */}
              <div className="flex flex-col">{doneList.map(renderTaskRow)}</div>
            </div>
          )}
        </section>
      </div>

      {/* Floating LocalStorage Engine Widget (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-40 max-w-sm">
        <div className="rounded-xl bg-[#222a3d]/95 p-4 shadow-2xl backdrop-blur-xl border border-[#464554]/40 transition-all">
          <div className="flex items-center justify-between gap-3 pb-2 border-b border-[#464554]/25">
            <div className="flex items-center gap-2 min-w-0">
              <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4edea3] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4edea3]"></span>
              </span>
              <span className="font-['Plus_Jakarta_Sans'] font-semibold text-[13px] text-[#dae2fd] truncate">
                LocalStorage Engine
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#171f33] text-[#4edea3] font-mono text-[10px] font-bold border border-[#4edea3]/30">
              ONLINE
            </span>
          </div>

          <div className="space-y-1.5 py-2 text-[12px]">
            <div className="flex items-center justify-between text-[#c7c4d7]">
              <span>State:</span>
              <span className="font-mono text-[#4edea3] font-semibold">
                Connected & Synced
              </span>
            </div>
            <div className="flex items-center justify-between text-[#c7c4d7]">
              <span>Auto-save:</span>
              <span className="font-mono text-[#dae2fd]">
                Active (saved {lastSavedDiff}s ago)
              </span>
            </div>
            <div className="flex items-center justify-between text-[#c7c4d7]">
              <span>Stored Payload:</span>
              <span className="font-mono text-[#c7c4d7]">
                {storageStats.usedKB} KB / {storageStats.totalMB} MB
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-[#464554]/25">
            <button
              type="button"
              onClick={onResetMock}
              className="flex-1 h-8 rounded-lg bg-[#171f33] hover:bg-[#31394d] border border-[#464554]/30 text-[#dae2fd] text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-xs">restart_alt</span>
              <span>Reset Mock</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm('Clear all task data from LocalStorage?')) {
                  onClearStorage();
                }
              }}
              className="flex-1 h-8 rounded-lg bg-[#93000a] text-[#ffdad6] hover:opacity-90 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-xs">delete_sweep</span>
              <span>Clear Storage</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
