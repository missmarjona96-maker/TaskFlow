import React, { useRef } from 'react';
import { Task } from '../types';

interface SettingsViewProps {
  storageStats: { usedKB: number; totalMB: number; percent: number };
  onResetMock: () => void;
  onClearStorage: () => void;
  onExportJson: () => void;
  onImportJson: (tasks: Task[]) => void;
  showToast: (msg: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  storageStats,
  onResetMock,
  onClearStorage,
  onExportJson,
  onImportJson,
  showToast,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportJson(parsed);
          showToast(`Successfully imported ${parsed.length} tasks!`);
        } else {
          showToast('Invalid JSON file format');
        }
      } catch (err) {
        showToast('Error parsing JSON file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full flex flex-col px-6 py-4 space-y-6 max-w-5xl">
      {/* Title */}
      <div className="p-5 rounded-xl bg-[#131b2e] border border-[#464554]/30 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#c0c1ff]">settings</span>
          <span className="font-mono text-xs text-[#c0c1ff] uppercase tracking-wider font-semibold">
            Preferences & Storage Engine
          </span>
        </div>
        <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-[26px] text-[#dae2fd] tracking-tight mt-1">
          Workspace Settings
        </h1>
        <p className="text-[13px] text-[#c7c4d7]">
          Manage browser offline cache, AI model endpoints, and sprint telemetry exports.
        </p>
      </div>

      {/* LocalStorage Engine Card */}
      <div className="p-5 rounded-xl bg-[#171f33] border border-[#464554]/30 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4edea3]">cloud_sync</span>
            <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-[16px] text-[#dae2fd]">
              Browser LocalStorage Engine
            </h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#00885d]/30 text-[#4edea3] font-mono text-xs font-semibold">
            ONLINE · 5.0 MB Limit
          </span>
        </div>

        <p className="text-xs text-[#c7c4d7] leading-relaxed">
          TaskFlow uses an isolated browser storage key (<code className="text-[#c0c1ff] font-mono">taskflow_sprint24_tasks</code>) with automatic serialization, multi-tab broadcast bus sync, and debounced write cycles.
        </p>

        {/* Quota Bar */}
        <div className="space-y-1.5 p-3 rounded-lg bg-[#131b2e] border border-[#464554]/25">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-[#c7c4d7]">Allocated Cache Size</span>
            <span className="text-[#dae2fd] font-semibold">
              {storageStats.usedKB} KB / {storageStats.totalMB} MB ({storageStats.percent}%)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#222a3d] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#8083ff] to-[#4edea3] rounded-full"
              style={{ width: `${Math.max(2, storageStats.percent)}%` }}
            ></div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 flex-wrap pt-2">
          <button
            type="button"
            onClick={onResetMock}
            className="h-9 px-4 rounded-lg bg-[#222a3d] hover:bg-[#31394d] border border-[#464554]/30 text-xs font-semibold text-[#dae2fd] flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">restart_alt</span>
            <span>Reset to Baseline Mock Data</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (confirm('Clear all tasks from LocalStorage?')) onClearStorage();
            }}
            className="h-9 px-4 rounded-lg bg-[#93000a] text-[#ffdad6] hover:opacity-90 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">delete_sweep</span>
            <span>Clear Storage Cache</span>
          </button>

          <button
            type="button"
            onClick={onExportJson}
            className="h-9 px-4 rounded-lg bg-[#171f33] hover:bg-[#222a3d] border border-[#8083ff]/40 text-[#c0c1ff] text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            <span>Export JSON Backup</span>
          </button>

          <label className="h-9 px-4 rounded-lg bg-[#171f33] hover:bg-[#222a3d] border border-[#4edea3]/40 text-[#4edea3] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-sm">upload</span>
            <span>Import JSON</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* AI Engine Status */}
      <div className="p-5 rounded-xl bg-[#171f33] border border-[#464554]/30 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#d0bcff]">auto_awesome</span>
            <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-[16px] text-[#dae2fd]">
              Gemini 3.8 Flash AI Integration
            </h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#571bc1] text-[#c4abff] font-mono text-xs font-semibold">
            Server-Side SDK Active
          </span>
        </div>
        <p className="text-xs text-[#c7c4d7] leading-relaxed">
          Integrated with <code className="text-[#c0c1ff] font-mono">@google/genai</code> running on Express backend (<code className="text-[#c0c1ff] font-mono">/api/ai/decompose</code> and <code className="text-[#c0c1ff] font-mono">/api/ai/organize</code>). Client secret is kept server-side with zero browser exposure.
        </p>
      </div>

      {/* Sprint Info */}
      <div className="p-5 rounded-xl bg-[#171f33] border border-[#464554]/30 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#c0c1ff]">flag</span>
          <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-[16px] text-[#dae2fd]">
            Sprint Configuration
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3 rounded-lg bg-[#131b2e] border border-[#464554]/25">
            <span className="text-[11px] text-[#c7c4d7] uppercase font-semibold">Sprint Title</span>
            <p className="text-sm font-semibold text-[#dae2fd] mt-0.5">Sprint 24 — Product Launch</p>
          </div>
          <div className="p-3 rounded-lg bg-[#131b2e] border border-[#464554]/25">
            <span className="text-[11px] text-[#c7c4d7] uppercase font-semibold">Active Git Branch</span>
            <p className="text-sm font-mono text-[#4edea3] mt-0.5">main#7f4a9b (Vite 6 / React 19)</p>
          </div>
        </div>
      </div>
    </div>
  );
};
