import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority } from '../types';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Partial<Task>) => void;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('to-do');
  const [priority, setPriority] = useState<TaskPriority>('P1');
  const [tagsInput, setTagsInput] = useState('#Frontend, #UI');
  const [dueDate, setDueDate] = useState('Tomorrow');
  const [aiDecompose, setAiDecompose] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => (t.startsWith('#') ? t : `#${t}`));

    onAddTask({
      title: title.trim(),
      description: description.trim() || 'New task created in TaskFlow PRO.',
      status,
      priority,
      priorityLabel: `${priority} ${priority === 'P0' ? 'Urgent' : priority === 'P1' ? 'High' : 'Normal'}`,
      tags: tags.length > 0 ? tags : ['#UI'],
      dueDate: dueDate || 'Today',
      subtasks: aiDecompose
        ? [
            { id: 'st-auto-1', title: '1. Technical specification and architecture schema', completed: false },
            { id: 'st-auto-2', title: '2. Core implementation and unit tests', completed: false },
            { id: 'st-auto-3', title: '3. QA verification and telemetry integration', completed: false },
          ]
        : [],
    });

    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0b1326]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-[#171f33] border border-[#464554]/40 p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#464554]/30 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8083ff]"></span>
            <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-[17px] text-[#dae2fd]">
              Create New Sprint Task
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#c7c4d7] hover:text-[#dae2fd] p-1 rounded-lg hover:bg-[#222a3d] transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-[11px] font-semibold text-[#c7c4d7] uppercase tracking-wider block mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement WebSocket reconnection state machine"
              className="w-full h-10 px-3 rounded-lg bg-[#131b2e] border border-[#464554]/40 text-sm text-[#dae2fd] placeholder:text-[#908fa0] focus:outline-none focus:ring-1 focus:ring-[#c0c1ff]"
              autoFocus
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#c7c4d7] uppercase tracking-wider block mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed acceptance criteria or technical notes..."
              className="w-full p-2.5 rounded-lg bg-[#131b2e] border border-[#464554]/40 text-sm text-[#dae2fd] placeholder:text-[#908fa0] focus:outline-none focus:ring-1 focus:ring-[#c0c1ff] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-[#c7c4d7] uppercase tracking-wider block mb-1">
                Column Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full h-10 px-3 rounded-lg bg-[#131b2e] border border-[#464554]/40 text-xs text-[#dae2fd] focus:outline-none cursor-pointer"
              >
                <option value="to-do">TO DO</option>
                <option value="in-progress">IN PROGRESS</option>
                <option value="done">DONE</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#c7c4d7] uppercase tracking-wider block mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full h-10 px-3 rounded-lg bg-[#131b2e] border border-[#464554]/40 text-xs text-[#d0bcff] font-semibold focus:outline-none cursor-pointer"
              >
                <option value="P0">P0 — Urgent</option>
                <option value="P1">P1 — High</option>
                <option value="P2">P2 — Medium</option>
                <option value="P3">P3 — Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-[#c7c4d7] uppercase tracking-wider block mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="#Frontend, #API"
                className="w-full h-10 px-3 rounded-lg bg-[#131b2e] border border-[#464554]/40 text-xs text-[#dae2fd] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#c7c4d7] uppercase tracking-wider block mb-1">
                Due Date
              </label>
              <input
                type="text"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="Today, Oct 30, etc."
                className="w-full h-10 px-3 rounded-lg bg-[#131b2e] border border-[#464554]/40 text-xs text-[#dae2fd] focus:outline-none"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 p-2.5 rounded-lg bg-[#131b2e] border border-[#464554]/30 cursor-pointer text-xs text-[#dae2fd]">
            <input
              type="checkbox"
              checked={aiDecompose}
              onChange={(e) => setAiDecompose(e.target.checked)}
              className="w-4 h-4 rounded bg-[#222a3d] accent-[#8083ff]"
            />
            <span className="flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-sm text-[#d0bcff]">
                auto_awesome
              </span>
              Auto-generate 3 baseline subtasks with AI
            </span>
          </label>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#464554]/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#222a3d] hover:bg-[#31394d] text-xs font-medium text-[#dae2fd] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#8083ff] text-[#0d0096] hover:bg-[#c0c1ff] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span>Create Task</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
