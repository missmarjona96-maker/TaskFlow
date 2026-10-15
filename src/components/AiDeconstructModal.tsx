import React, { useState } from 'react';
import { Task } from '../types';

interface AiDeconstructModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onApplySubtasks: (taskId: string, subtasks: any[]) => void;
}

export const AiDeconstructModal: React.FC<AiDeconstructModalProps> = ({
  task,
  isOpen,
  onClose,
  onApplySubtasks,
}) => {
  const [subtasks, setSubtasks] = useState([
    {
      id: 'ai-m-1',
      title: 'Map input parameters to JSON Schema validator',
      detail: 'Validate against strict schema bounds',
      selected: true,
    },
    {
      id: 'ai-m-2',
      title: 'Generate unit specs for corner cases & overflow',
      detail: 'Catch buffer limits and type coercion bugs',
      selected: true,
    },
    {
      id: 'ai-m-3',
      title: 'Hook into telemetry logging dispatcher',
      detail: 'Dispatch structured events with user anonymization',
      selected: true,
    },
  ]);

  if (!isOpen || !task) return null;

  const toggleSelect = (id: string) => {
    setSubtasks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, selected: !s.selected } : s))
    );
  };

  const handleApply = () => {
    const chosen = subtasks
      .filter((s) => s.selected)
      .map((s) => ({
        id: 'st-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        title: s.title,
        detail: s.detail,
        completed: false,
        estimate: '1.5h',
      }));

    onApplySubtasks(task.id, chosen);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0b1326]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-xl bg-[#222a3d] border border-[#464554]/40 p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#464554]/30 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#d0bcff] text-xl">
              auto_awesome
            </span>
            <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-[17px] text-[#dae2fd]">
              AI Task Deconstructor
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#c7c4d7] hover:text-[#dae2fd] p-1 rounded-lg hover:bg-[#171f33] transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Task target info */}
        <div className="space-y-1">
          <p className="text-[12px] text-[#c7c4d7]">Generating actionable subtasks for:</p>
          <p className="font-['Plus_Jakarta_Sans'] font-semibold text-[14px] text-[#c0c1ff] truncate">
            {task.title}
          </p>
        </div>

        {/* Subtask candidates */}
        <div className="space-y-2 bg-[#171f33] p-3 rounded-lg border border-[#464554]/25">
          {subtasks.map((st) => (
            <label
              key={st.id}
              className="flex items-center gap-2.5 text-[13px] text-[#dae2fd] cursor-pointer hover:text-[#c0c1ff] transition-colors"
            >
              <input
                type="checkbox"
                checked={st.selected}
                onChange={() => toggleSelect(st.id)}
                className="w-4 h-4 rounded bg-[#222a3d] accent-[#8083ff] cursor-pointer"
              />
              <div className="flex flex-col">
                <span className="font-medium">{st.title}</span>
                <span className="text-[11px] text-[#c7c4d7]/70 font-mono">{st.detail}</span>
              </div>
            </label>
          ))}
        </div>

        {/* Footer CTAs */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#464554]/30">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-[#171f33] hover:bg-[#31394d] text-[#dae2fd] text-[13px] font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-1.5 rounded-lg bg-[#571bc1] text-[#c4abff] hover:bg-[#571bc1]/85 border border-[#c4abff]/30 text-[13px] font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-sm">add_task</span>
            <span>Inject {subtasks.filter((s) => s.selected).length} Subtasks</span>
          </button>
        </div>
      </div>
    </div>
  );
};
