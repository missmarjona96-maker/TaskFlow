import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority } from '../types';

interface TaskInspectorDrawerProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, title: string, detail?: string) => void;
  storageUsedKB: number;
}

export const TaskInspectorDrawer: React.FC<TaskInspectorDrawerProps> = ({
  task,
  isOpen,
  onClose,
  onUpdateTask,
  onDeleteTask,
  onToggleSubtask,
  onAddSubtask,
  storageUsedKB,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('to-do');
  const [priority, setPriority] = useState<TaskPriority>('P1');
  const [dueDate, setDueDate] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newSubtaskDetail, setNewSubtaskDetail] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
      setPriority(task.priority);
      setDueDate(task.dueDate || 'Oct 28, 2025');
    }
  }, [task]);

  if (!isOpen || !task) {
    return null;
  }

  const handleSave = () => {
    onUpdateTask(task.id, {
      title,
      description,
      status,
      priority,
      priorityLabel: `${priority} ${priority === 'P0' ? 'Urgent' : priority === 'P1' ? 'Medium' : 'Low'}`,
      dueDate,
    });
  };

  const handleRegenerateAi = async () => {
    setIsRegenerating(true);
    try {
      const res = await fetch('/api/ai/decompose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });
      const data = await res.json();
      if (data && data.subtasks) {
        onUpdateTask(task.id, { subtasks: data.subtasks });
      }
    } catch (e) {
      console.warn('AI regenerate error', e);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleCreateSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    onAddSubtask(task.id, newSubtaskTitle.trim(), newSubtaskDetail.trim());
    setNewSubtaskTitle('');
    setNewSubtaskDetail('');
    setIsAddingSubtask(false);
  };

  return (
    <div
      className="w-full xl:w-[410px] flex-shrink-0 rounded-2xl bg-[#171f33]/95 backdrop-blur-xl p-5 flex flex-col gap-3.5 shadow-2xl relative transition-all border border-[#464554]/40"
      id="taskDrawer"
    >
      {/* Glow Accent behind Drawer */}
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#8083ff]/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* Drawer Header */}
      <div className="flex items-center justify-between pb-1 border-b border-[#464554]/30">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#c0c1ff]"></span>
          <span className="font-['Plus_Jakarta_Sans'] text-[18px] text-[#dae2fd] tracking-tight font-bold">
            Task Details
          </span>
          <span className="px-2 py-0.5 rounded bg-[#222a3d] text-[#c0c1ff] font-mono text-xs font-semibold">
            {task.id}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#c7c4d7] hover:text-[#dae2fd] hover:bg-[#222a3d] transition-colors"
            title="Full Screen View"
          >
            <span className="material-symbols-outlined text-sm">open_in_full</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#c7c4d7] hover:text-[#ffb4ab] hover:bg-[#222a3d] transition-colors"
            title="Close Drawer"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      </div>

      {/* Task Title & Quick Status Matrix */}
      <div className="flex flex-col gap-1.5">
        <div className="relative">
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#131b2e] border border-[#464554]/40 rounded-xl p-3 font-['Plus_Jakarta_Sans'] font-semibold text-[16px] text-[#dae2fd] focus:outline-none focus:ring-1 focus:ring-[#c0c1ff] focus:bg-[#060e20] resize-none transition-colors leading-snug"
            rows={2}
          />
        </div>
        <p className="text-[12px] text-[#c7c4d7]/80">
          Created by Elena Rostova • Updated 8 minutes ago via Vite Hot Reload
        </p>
      </div>

      {/* Property Grid (Status, Priority, Due Date, Sync State) */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Status Selector */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-[#c7c4d7]/70 uppercase tracking-wider font-semibold">
            Status
          </label>
          <div className="relative">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full h-10 px-3 pr-8 rounded-lg bg-[#131b2e] border border-[#464554]/30 text-[#dae2fd] text-[13px] appearance-none focus:outline-none focus:bg-[#222a3d] transition-colors cursor-pointer font-medium"
            >
              <option value="to-do">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#c7c4d7] pointer-events-none text-sm">
              expand_more
            </span>
          </div>
        </div>

        {/* Priority Selector */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-[#c7c4d7]/70 uppercase tracking-wider font-semibold">
            Priority
          </label>
          <div className="relative">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full h-10 px-3 pr-8 rounded-lg bg-[#131b2e] border border-[#464554]/30 text-[#d0bcff] text-[13px] appearance-none focus:outline-none focus:bg-[#222a3d] transition-colors cursor-pointer font-semibold"
            >
              <option value="P0">P0 — Urgent</option>
              <option value="P0">P0 — High</option>
              <option value="P1">P1 — Medium</option>
              <option value="P2">P2 — Low</option>
              <option value="P3">P3 — Normal</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#c7c4d7] pointer-events-none text-sm">
              expand_more
            </span>
          </div>
        </div>

        {/* Due Date Picker */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-[#c7c4d7]/70 uppercase tracking-wider font-semibold">
            Due Date
          </label>
          <div className="h-10 px-3 rounded-lg bg-[#131b2e] border border-[#464554]/30 text-[#dae2fd] text-[13px] flex items-center justify-between cursor-pointer hover:bg-[#222a3d] transition-colors">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#c0c1ff] text-sm">
                calendar_month
              </span>
              <span>{dueDate || 'Oct 28, 2025'}</span>
            </div>
            <span className="font-mono text-[11px] text-[#4edea3] font-semibold">
              In 4 days
            </span>
          </div>
        </div>

        {/* Storage Sync Telemetry */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-[#c7c4d7]/70 uppercase tracking-wider font-semibold">
            Sync State
          </label>
          <div className="h-10 px-3 rounded-lg bg-[#131b2e] border border-[#464554]/30 text-[#dae2fd] text-[13px] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4edea3] text-sm">
              cloud_sync
            </span>
            <span className="font-mono text-[12px] text-[#4edea3] truncate font-semibold">
              {storageUsedKB || 42}KB / Synced
            </span>
          </div>
        </div>
      </div>

      {/* AI SMART BREAKDOWN SECTION */}
      <div className="rounded-xl bg-[#131b2e] border border-[#464554]/30 p-3.5 flex flex-col gap-2.5 shadow-inner relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#571bc1] text-[#c4abff] flex items-center justify-center">
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
            </div>
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] text-[14px] text-[#dae2fd] tracking-tight font-bold leading-none">
                AI Smart Breakdown
              </h3>
              <p className="text-[11px] text-[#c7c4d7]/70">
                Deep-work task decomposition
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRegenerateAi}
            disabled={isRegenerating}
            className="px-2.5 py-1 rounded-md bg-[#171f33] hover:bg-[#222a3d] border border-[#464554]/40 text-[#c0c1ff] text-[11px] font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-xs ${isRegenerating ? 'animate-spin' : ''}`}>
              sync
            </span>
            <span>{isRegenerating ? 'Decomposing...' : 'Regenerate'}</span>
          </button>
        </div>

        {/* Subtask list */}
        <div className="flex flex-col gap-2 pt-1 max-h-56 overflow-y-auto pr-1">
          {task.subtasks.map((st) => (
            <label
              key={st.id}
              className="p-2.5 rounded-lg bg-[#171f33] hover:bg-[#222a3d] border border-[#464554]/20 flex items-start gap-2.5 transition-all cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={st.completed}
                onChange={() => onToggleSubtask(task.id, st.id)}
                className="mt-0.5 w-4 h-4 rounded bg-[#222a3d] accent-[#8083ff] cursor-pointer"
              />
              <div className="flex flex-col flex-1 min-w-0">
                <span
                  className={`text-[13px] font-medium leading-snug ${
                    st.completed
                      ? 'text-[#dae2fd]/60 line-through'
                      : 'text-[#dae2fd] group-hover:text-[#c0c1ff] transition-colors'
                  }`}
                >
                  {st.title}
                </span>
                {st.detail && (
                  <span
                    className={`text-[11px] font-mono mt-0.5 ${
                      st.completed ? 'text-[#4edea3]' : 'text-[#c7c4d7]/80'
                    }`}
                  >
                    {st.detail}
                  </span>
                )}
              </div>
            </label>
          ))}
        </div>

        {/* Inline Add Custom Subtask Form */}
        {isAddingSubtask ? (
          <form onSubmit={handleCreateSubtask} className="flex flex-col gap-1.5 pt-1">
            <input
              type="text"
              placeholder="Subtask title (e.g. 5. Write benchmark spec)"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-md bg-[#060e20] border border-[#464554]/40 text-[12px] text-[#dae2fd] placeholder:text-[#908fa0] focus:outline-none focus:ring-1 focus:ring-[#c0c1ff]"
              autoFocus
            />
            <input
              type="text"
              placeholder="Technical detail or acceptance criteria (optional)"
              value={newSubtaskDetail}
              onChange={(e) => setNewSubtaskDetail(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-md bg-[#060e20] border border-[#464554]/40 text-[12px] text-[#dae2fd] placeholder:text-[#908fa0] focus:outline-none focus:ring-1 focus:ring-[#c0c1ff]"
            />
            <div className="flex items-center justify-end gap-1.5 mt-1">
              <button
                type="button"
                onClick={() => setIsAddingSubtask(false)}
                className="px-2.5 py-1 rounded-md text-[11px] text-[#c7c4d7] hover:bg-[#222a3d]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 rounded-md bg-[#8083ff] text-[#0d0096] text-[11px] font-semibold"
              >
                Add Subtask
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setIsAddingSubtask(true)}
            className="py-1.5 text-center text-[#c0c1ff] hover:text-[#e1e0ff] text-[12px] font-semibold flex items-center justify-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-xs">add</span>
            <span>Add Custom Subtask</span>
          </button>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-1 mt-auto border-t border-[#464554]/30">
        <button
          type="button"
          onClick={() => {
            if (confirm(`Delete task ${task.id}?`)) {
              onDeleteTask(task.id);
            }
          }}
          className="h-10 px-3 rounded-lg bg-[#222a3d] hover:bg-[#93000a] text-[#c7c4d7] hover:text-[#ffdad6] text-[13px] flex items-center gap-1.5 transition-colors group"
        >
          <span className="material-symbols-outlined text-sm group-hover:text-[#ffb4ab] transition-colors">
            delete
          </span>
          <span>Delete</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 rounded-lg bg-[#222a3d] hover:bg-[#2d3449] text-[#dae2fd] text-[13px] font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="h-10 px-5 rounded-lg bg-[#8083ff] text-[#0d0096] hover:bg-[#c0c1ff] text-[13px] font-semibold flex items-center gap-1.5 transition-all shadow-md"
          >
            <span className="material-symbols-outlined text-sm">save</span>
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
