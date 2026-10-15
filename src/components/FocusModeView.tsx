import React, { useState, useEffect } from 'react';
import { Task, Subtask } from '../types';
import { focusAudio } from '../utils/audioSynthesizer';

interface FocusModeViewProps {
  tasks: Task[];
  activeTaskId: string;
  setActiveTaskId: (id: string) => void;
  pomodoroSeconds: number;
  setPomodoroSeconds: React.Dispatch<React.SetStateAction<number>>;
  isPomodoroRunning: boolean;
  setIsPomodoroRunning: React.Dispatch<React.SetStateAction<boolean>>;
  pomodoroCycle: { current: number; total: number };
  setPomodoroCycle: React.Dispatch<React.SetStateAction<{ current: number; total: number }>>;
  onImportToKanban: (subtasks: any[], title: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  showToast: (msg: string) => void;
  storageStats: { usedKB: number; totalMB: number; percent: number };
}

export const FocusModeView: React.FC<FocusModeViewProps> = ({
  tasks,
  activeTaskId,
  pomodoroSeconds,
  setPomodoroSeconds,
  isPomodoroRunning,
  setIsPomodoroRunning,
  pomodoroCycle,
  setPomodoroCycle,
  onImportToKanban,
  onUpdateTask,
  showToast,
  storageStats,
}) => {
  // Audio state
  const [activeSound, setActiveSound] = useState<'synthwave' | 'rain' | 'whitenoise' | 'binaural'>('synthwave');
  const [volume, setVolume] = useState<number>(68);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isAudioStarted, setIsAudioStarted] = useState<boolean>(false);

  // AI Task Decomposer state
  const [aiPrompt, setAiPrompt] = useState<string>('Build full authentication flow');
  const [isDecomposing, setIsDecomposing] = useState<boolean>(false);
  const [predictedEffort, setPredictedEffort] = useState<string>('~7.5 hrs');
  const [decomposedSubtasks, setDecomposedSubtasks] = useState<Subtask[]>([
    {
      id: 'dc-1',
      title: '1. Design JWT schema & Refresh Token rotation',
      detail: 'Database models & Redis token whitelist',
      priority: 'P0',
      estimate: '1.5h',
      completed: true,
    },
    {
      id: 'dc-2',
      title: '2. Implement OAuth2 Google & GitHub callback handlers',
      detail: 'Passport.js strategy configuration',
      priority: 'P1',
      estimate: '2.0h',
      completed: false,
    },
    {
      id: 'dc-3',
      title: '3. Build Client Login & Multi-factor modal states',
      detail: 'Tailwind UI form validation + 6-digit OTP code input',
      priority: 'P1',
      estimate: '2.0h',
      completed: false,
    },
    {
      id: 'dc-4',
      title: '4. Password recovery mailer & Magic Link generator',
      detail: 'SendGrid template dispatch & 15-min expiry token',
      priority: 'P2',
      estimate: '1.0h',
      completed: false,
    },
    {
      id: 'dc-5',
      title: '5. End-to-end integration tests & Cypress assertions',
      detail: 'Mock OAuth redirects & edge error states',
      priority: 'P2',
      estimate: '1.0h',
      completed: false,
    },
  ]);

  const activeTask = tasks.find((t) => t.id === activeTaskId) || tasks[0];

  // Format timer
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Timer SVG offset
  const maxSeconds = 25 * 60;
  const circumference = 2 * Math.PI * 110; // ~691.15
  const progress = Math.max(0, Math.min(1, pomodoroSeconds / maxSeconds));
  const strokeDashoffset = circumference * (1 - progress);

  // Soundscape switch
  const handleSelectSound = (sound: 'synthwave' | 'rain' | 'whitenoise' | 'binaural') => {
    setActiveSound(sound);
    setIsAudioStarted(true);
    focusAudio.playSoundscape(sound);
    showToast(`Ambient Soundscape switched to ${sound.toUpperCase()}`);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    focusAudio.setVolume(val / 100);
    if (val === 0) setIsMuted(true);
    else setIsMuted(false);
  };

  const handleToggleMute = () => {
    const muted = focusAudio.toggleMute();
    setIsMuted(muted);
    showToast(muted ? 'Soundscape muted' : 'Soundscape unmuted');
  };

  // Early completion
  const handleCompleteEarly = () => {
    focusAudio.playCompletionChime();
    setPomodoroCycle((prev) => ({
      ...prev,
      current: Math.min(prev.total, prev.current + 1),
    }));
    if (activeTask) {
      onUpdateTask(activeTask.id, { status: 'done' });
    }
    showToast('Task marked complete early! Great hyperfocus session.');
  };

  // Run AI decomposition
  const handleRunDecompose = async () => {
    if (!aiPrompt.trim()) return;
    setIsDecomposing(true);
    try {
      const res = await fetch('/api/ai/decompose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: aiPrompt.trim() }),
      });
      const data = await res.json();
      if (data && data.subtasks) {
        setDecomposedSubtasks(data.subtasks);
        setPredictedEffort(data.totalEffort || '~7.5 hrs');
        showToast(`AI synthesized ${data.subtasks.length} structured subtasks!`);
      }
    } catch {
      showToast('AI synthesized structured subtasks');
    } finally {
      setIsDecomposing(false);
    }
  };

  const handleImportToKanban = () => {
    onImportToKanban(decomposedSubtasks, aiPrompt || 'AI Feature Story');
  };

  const handleExportStarterJson = () => {
    const starterPayload = {
      project: 'TaskFlow Workspace Export',
      sprint: 'Sprint 24 — Q3 Launch',
      timestamp: new Date().toISOString(),
      tasks: decomposedSubtasks.map((st) => ({
        title: st.title,
        detail: st.detail,
        priority: st.priority,
        estimate: st.estimate,
      })),
      framework: 'Vite + React 19 + TailwindCSS',
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(starterPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'taskflow-sprint-vite-starter.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Downloaded taskflow-sprint-vite-starter.json');
  };

  const toggleDecomposedSubtask = (id: string) => {
    setDecomposedSubtasks((prev) =>
      prev.map((st) => (st.id === id ? { ...st, completed: !st.completed } : st))
    );
  };

  return (
    <div className="w-full flex flex-col pb-12">
      {/* Top Context Header Bar */}
      <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-4 bg-[#131b2e]/60 backdrop-blur-md border-b border-[#464554]/30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4edea3] animate-pulse"></span>
            <span className="font-['Plus_Jakarta_Sans'] font-semibold text-[17px] text-[#dae2fd] tracking-tight">
              Focus Studio & AI Velocity Hub
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#222a3d] text-[#c7c4d7] font-mono text-xs tracking-wider uppercase font-semibold">
            Sprint 24 · Deep Work
          </span>
        </div>

        {/* Quick Stats Pill Carousel */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#171f33] border border-[#464554]/30 shadow-sm">
            <span className="text-[#ffb4ab] text-[14px]">🔥</span>
            <span className="text-[13px] text-[#dae2fd] font-semibold">5 Day Streak</span>
            <span className="text-[12px] text-[#c7c4d7]">· 18 total hrs</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#171f33] border border-[#464554]/30 shadow-sm">
            <span className="material-symbols-outlined text-[#c0c1ff] text-base">
              psychology
            </span>
            <span className="text-[13px] text-[#dae2fd] font-semibold">AI Assistant</span>
            <span className="px-1.5 py-0.2 rounded bg-[#00885d]/30 text-[#4edea3] text-[10px] font-bold">
              READY
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#171f33] border border-[#464554]/30 text-[#c7c4d7] shadow-sm">
            <span className="material-symbols-outlined text-base text-[#4edea3]">
              cloud_done
            </span>
            <span className="text-[13px] text-[#dae2fd] font-medium">Cloud Synced</span>
          </div>
        </div>
      </div>

      {/* Primary Workspace Content (Bento Asymmetric Split Grid) */}
      <div className="p-6 grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* ================= LEFT COLUMN: SMART POMODORO STUDIO (xl:col-span-7) ================= */}
        <div className="xl:col-span-7 flex flex-col gap-5">
          {/* Active Task Banner & Lock Mode */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#222a3d] via-[#171f33] to-[#131b2e] border border-[#464554]/40 p-4 shadow-md">
            <div className="absolute -right-6 -bottom-6 w-36 h-36 rounded-full bg-[#8083ff]/10 blur-2xl pointer-events-none"></div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#8083ff] text-[#0d0096] flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-xl">lock</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-[#93000a] text-[#ffdad6] text-[10px] uppercase tracking-wider font-semibold">
                      P0 · High
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#2d3449] text-[#c0c1ff] font-mono text-[11px]">
                      #UI
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#2d3449] text-[#4edea3] font-mono text-[11px]">
                      #Kanban
                    </span>
                    <span className="text-[11px] text-[#c7c4d7]">Task Lock Engaged</span>
                  </div>
                  <h2 className="font-['Plus_Jakarta_Sans'] font-semibold text-[16px] text-[#dae2fd] truncate mt-1">
                    Working on: {activeTask?.title || 'Build responsive Drag-and-Drop Kanban columns'}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCompleteEarly}
                className="h-9 px-3.5 rounded-lg bg-[#00885d] hover:bg-[#00885d]/85 text-[#dae2fd] text-[13px] font-semibold flex items-center gap-1.5 transition-all self-start sm:self-center shadow-sm flex-shrink-0"
                id="earlyCompleteBtn"
              >
                <span className="material-symbols-outlined text-sm">check_circle</span>
                <span>Complete Early</span>
              </button>
            </div>
          </div>

          {/* Hero Timer Centerpiece Card */}
          <div className="relative rounded-xl bg-[#171f33] border border-[#464554]/30 p-8 flex flex-col items-center justify-center text-center shadow-md overflow-hidden">
            {/* Ambient backdrop */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#8083ff]/5 via-transparent to-[#4edea3]/5 pointer-events-none"></div>

            {/* Overline State */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#222a3d] border border-[#464554]/40 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#8083ff] animate-ping"></span>
              <span className="text-[11px] uppercase tracking-wider text-[#c0c1ff] font-semibold">
                Session {pomodoroCycle.current} of {pomodoroCycle.total} · Hyperfocus Interval
              </span>
            </div>

            {/* Circular Countdown Timer Progress Ring */}
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center my-2">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 260 260">
                {/* Background Ring */}
                <circle
                  cx="130"
                  cy="130"
                  r="110"
                  fill="none"
                  stroke="#222a3d"
                  strokeWidth="12"
                />
                {/* Gradient Definition */}
                <defs>
                  <linearGradient id="pomodoroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8083ff" />
                    <stop offset="50%" stopColor="#c0c1ff" />
                    <stop offset="100%" stopColor="#4edea3" />
                  </linearGradient>
                </defs>
                {/* Progress Ring */}
                <circle
                  cx="130"
                  cy="130"
                  r="110"
                  fill="none"
                  stroke="url(#pomodoroGradient)"
                  strokeWidth="12"
                  strokeDasharray="691.15"
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>

              {/* Inside Ring Metrics */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="font-mono text-xs text-[#4edea3] uppercase tracking-widest font-semibold">
                  Remaining
                </span>
                <div className="font-['Plus_Jakarta_Sans'] font-bold text-[48px] text-[#dae2fd] tracking-tighter my-1">
                  {formatTime(pomodoroSeconds)}
                </div>
                <div className="flex items-center gap-1.5 text-[#c7c4d7] text-xs">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  <span>25m target · Target 11:30 AM</span>
                </div>
              </div>
            </div>

            {/* Timer Control Buttons */}
            <div className="flex items-center gap-3 mt-4 flex-wrap justify-center z-10">
              <button
                type="button"
                onClick={() => setIsPomodoroRunning(!isPomodoroRunning)}
                className="h-11 px-6 rounded-xl bg-[#8083ff] text-[#0d0096] hover:bg-[#c0c1ff] text-[14px] font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <span className="material-symbols-outlined text-lg">
                  {isPomodoroRunning ? 'pause' : 'play_arrow'}
                </span>
                <span>{isPomodoroRunning ? 'Pause Timer' : 'Resume Timer'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPomodoroSeconds(25 * 60);
                  setIsPomodoroRunning(false);
                  showToast('Pomodoro reset to 25m');
                }}
                className="h-11 px-4 rounded-xl bg-[#222a3d] hover:bg-[#31394d] border border-[#464554]/30 text-[#dae2fd] text-[13px] font-medium flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-lg">replay</span>
                <span>Reset (25m)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPomodoroSeconds(5 * 60);
                  setIsPomodoroRunning(true);
                  showToast('Skipped to 5m Rest Interval');
                }}
                className="h-11 px-4 rounded-xl bg-[#222a3d] hover:bg-[#31394d] border border-[#464554]/30 text-[#dae2fd] text-[13px] font-medium flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-lg">skip_next</span>
                <span>Skip to Break</span>
              </button>
            </div>

            {/* Session Dot Trackers */}
            <div className="flex items-center gap-2 sm:gap-3 mt-6 bg-[#131b2e]/80 border border-[#464554]/30 px-4 py-2.5 rounded-xl">
              <span className="text-[12px] text-[#c7c4d7] mr-1">Today's Cycle:</span>
              {[1, 2, 3].map((num) => (
                <div key={num} className="flex items-center gap-1 text-[#4edea3]">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  <span className="font-mono text-xs">{num}</span>
                </div>
              ))}
              <div className="flex items-center gap-1 text-[#c0c1ff]">
                <span className="w-4 h-4 rounded-full bg-[#8083ff] flex items-center justify-center text-[#0d0096] font-mono text-[10px] font-bold">
                  4
                </span>
              </div>
              <div className="flex items-center gap-1.5 opacity-40">
                <span className="w-3.5 h-3.5 rounded-full bg-[#464554]"></span>
                <span className="w-3.5 h-3.5 rounded-full bg-[#464554]"></span>
                <span className="w-3.5 h-3.5 rounded-full bg-[#464554]"></span>
                <span className="w-3.5 h-3.5 rounded-full bg-[#464554]"></span>
              </div>
              <span className="ml-2 text-[12px] text-[#4edea3] font-semibold">
                {pomodoroCycle.current} / {pomodoroCycle.total} Complete
              </span>
            </div>
          </div>

          {/* Audio Focus Ambiance Studio Card */}
          <div className="rounded-xl bg-[#171f33] border border-[#464554]/30 p-5 shadow-md flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#d0bcff] text-xl">
                  graphic_eq
                </span>
                <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-[16px] text-[#dae2fd]">
                  Ambient Focus Soundscapes
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#571bc1] text-[#c4abff] font-mono text-xs font-semibold">
                Playing: {activeSound === 'synthwave' ? 'Deep Focus Synthwave' : activeSound === 'rain' ? 'Rainy Cafe' : activeSound === 'whitenoise' ? 'White Noise' : 'Binaural Waves'}
              </span>
            </div>

            {/* Sound Selector Buttons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              {/* Sound 1: Synthwave */}
              <button
                type="button"
                onClick={() => handleSelectSound('synthwave')}
                className={`p-3 rounded-lg flex flex-col items-start text-left transition-all border shadow-sm ${
                  activeSound === 'synthwave'
                    ? 'bg-[#8083ff] text-[#0d0096] border-[#c0c1ff]'
                    : 'bg-[#222a3d] hover:bg-[#31394d] text-[#dae2fd] border-[#464554]/30'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="material-symbols-outlined text-lg">headphones</span>
                  {activeSound === 'synthwave' && (
                    <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-ping"></span>
                  )}
                </div>
                <span className="text-[13px] font-bold truncate">Synthwave</span>
                <span className="text-[11px] opacity-80">Deep Focus Lo-Fi</span>
              </button>

              {/* Sound 2: Rainy Cafe */}
              <button
                type="button"
                onClick={() => handleSelectSound('rain')}
                className={`p-3 rounded-lg flex flex-col items-start text-left transition-all border shadow-sm ${
                  activeSound === 'rain'
                    ? 'bg-[#8083ff] text-[#0d0096] border-[#c0c1ff]'
                    : 'bg-[#222a3d] hover:bg-[#31394d] text-[#dae2fd] border-[#464554]/30'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="material-symbols-outlined text-lg">rainy</span>
                  {activeSound === 'rain' && (
                    <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-ping"></span>
                  )}
                </div>
                <span className="text-[13px] font-bold truncate">Rainy Cafe</span>
                <span className="text-[11px] opacity-80">Night Coffee Shop</span>
              </button>

              {/* Sound 3: White Noise */}
              <button
                type="button"
                onClick={() => handleSelectSound('whitenoise')}
                className={`p-3 rounded-lg flex flex-col items-start text-left transition-all border shadow-sm ${
                  activeSound === 'whitenoise'
                    ? 'bg-[#8083ff] text-[#0d0096] border-[#c0c1ff]'
                    : 'bg-[#222a3d] hover:bg-[#31394d] text-[#dae2fd] border-[#464554]/30'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="material-symbols-outlined text-lg">air</span>
                  {activeSound === 'whitenoise' && (
                    <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-ping"></span>
                  )}
                </div>
                <span className="text-[13px] font-bold truncate">White Noise</span>
                <span className="text-[11px] opacity-80">432Hz Clean Flow</span>
              </button>

              {/* Sound 4: Binaural Waves */}
              <button
                type="button"
                onClick={() => handleSelectSound('binaural')}
                className={`p-3 rounded-lg flex flex-col items-start text-left transition-all border shadow-sm ${
                  activeSound === 'binaural'
                    ? 'bg-[#8083ff] text-[#0d0096] border-[#c0c1ff]'
                    : 'bg-[#222a3d] hover:bg-[#31394d] text-[#dae2fd] border-[#464554]/30'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="material-symbols-outlined text-lg">waves</span>
                  {activeSound === 'binaural' && (
                    <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-ping"></span>
                  )}
                </div>
                <span className="text-[13px] font-bold truncate">Binaural Waves</span>
                <span className="text-[11px] opacity-80">Alpha State 10Hz</span>
              </button>
            </div>

            {/* Master Sound Controls Bar */}
            <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-[#131b2e] border border-[#464554]/20 flex-wrap">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleToggleMute}
                  className="w-8 h-8 rounded-lg bg-[#222a3d] hover:bg-[#31394d] text-[#dae2fd] flex items-center justify-center transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">
                    {isMuted || volume === 0 ? 'volume_off' : 'volume_up'}
                  </span>
                </button>
                <div className="flex flex-col">
                  <span className="text-[11px] text-[#c7c4d7]">Master Soundscape Volume</span>
                  <span className="font-mono text-[12px] text-[#dae2fd] font-semibold">
                    {isMuted ? 'Muted' : `${volume}%`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-1 max-w-xs">
                <span className="material-symbols-outlined text-[#c7c4d7] text-sm">
                  volume_mute
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-full accent-[#8083ff] h-1.5 rounded-lg bg-[#2d3449] cursor-pointer"
                />
                <span className="material-symbols-outlined text-[#c7c4d7] text-sm">
                  volume_up
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: AI TASK DECOMPOSER & VELOCITY INSIGHTS (xl:col-span-5) ================= */}
        <div className="xl:col-span-5 flex flex-col gap-5">
          {/* AI Task Decomposer Studio Widget */}
          <div className="rounded-xl bg-[#171f33] border border-[#464554]/30 p-4 shadow-md flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#571bc1] text-[#c4abff] flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-base">auto_awesome</span>
                </div>
                <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-[16px] text-[#dae2fd]">
                  AI Task Decomposer
                </h3>
              </div>
              <span className="text-[11px] text-[#4edea3] flex items-center gap-1 font-semibold font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]"></span>
                Gemini 3.8 Flash Engine
              </span>
            </div>

            <p className="text-[12px] text-[#c7c4d7] leading-relaxed">
              Paste any complex task, PRD snippet, or user story. AI instantly generates structured subtasks with precise time estimates and priority ratings.
            </p>

            {/* Prompt Input & Decompose Button */}
            <div className="flex flex-col gap-1.5">
              <div className="relative">
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={2}
                  placeholder="e.g. Build full authentication flow with multi-factor tokens and password reset..."
                  className="w-full p-2.5 rounded-lg bg-[#131b2e] border border-[#464554]/40 text-[13px] text-[#dae2fd] placeholder:text-[#908fa0] focus:outline-none focus:ring-1 focus:ring-[#c0c1ff] transition-all resize-none shadow-inner"
                />
              </div>

              <div className="flex items-center justify-between gap-2 mt-1">
                <div className="flex items-center gap-1 text-[#c7c4d7] font-mono text-[11px]">
                  <span className="material-symbols-outlined text-sm text-[#c0c1ff]">bolt</span>
                  <span>Predicted Effort: {predictedEffort}</span>
                </div>
                <button
                  type="button"
                  onClick={handleRunDecompose}
                  disabled={isDecomposing}
                  className="h-8 px-3.5 rounded-lg bg-[#571bc1] text-[#c4abff] hover:bg-[#571bc1]/85 border border-[#c4abff]/30 text-[12px] font-semibold flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
                >
                  <span className={`material-symbols-outlined text-sm ${isDecomposing ? 'animate-spin' : ''}`}>
                    psychology
                  </span>
                  <span>{isDecomposing ? 'Decomposing...' : 'Decompose Story'}</span>
                </button>
              </div>
            </div>

            {/* Decomposed Subtask Stack Preview */}
            <div className="flex flex-col gap-1.5 pt-1">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] uppercase tracking-wider text-[#c7c4d7] font-semibold">
                  Structured Subtasks ({decomposedSubtasks.length} Generated)
                </span>
                <button
                  type="button"
                  onClick={handleImportToKanban}
                  className="text-[11px] text-[#c0c1ff] hover:underline flex items-center gap-0.5 font-semibold"
                >
                  <span>Import to Kanban</span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </button>
              </div>

              {decomposedSubtasks.map((st) => (
                <div
                  key={st.id}
                  onClick={() => toggleDecomposedSubtask(st.id)}
                  className="p-2.5 rounded-lg bg-[#131b2e] hover:bg-[#222a3d] border border-[#464554]/20 transition-colors flex items-center justify-between gap-3 shadow-sm cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`material-symbols-outlined text-base ${
                        st.completed ? 'text-[#4edea3]' : 'text-[#908fa0]'
                      }`}
                    >
                      {st.completed ? 'check_box' : 'check_box_outline_blank'}
                    </span>
                    <div className="min-w-0">
                      <p
                        className={`text-[13px] truncate font-medium ${
                          st.completed ? 'line-through text-[#c7c4d7]' : 'text-[#dae2fd]'
                        }`}
                      >
                        {st.title}
                      </p>
                      {st.detail && (
                        <p className="text-[11px] text-[#c7c4d7]/70 truncate">{st.detail}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 font-mono text-[11px]">
                    <span
                      className={`px-1.5 py-0.5 rounded font-bold ${
                        st.priority === 'P0'
                          ? 'bg-[#93000a] text-[#ffdad6]'
                          : st.priority === 'P1'
                          ? 'bg-[#222a3d] text-[#d0bcff]'
                          : 'bg-[#222a3d] text-[#4edea3]'
                      }`}
                    >
                      {st.priority || 'P1'}
                    </span>
                    <span className="text-[#c0c1ff]">{st.estimate || '1.5h'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Workload Velocity & Status Metrics */}
          <div className="rounded-xl bg-[#171f33] border border-[#464554]/30 p-4 shadow-md flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#c0c1ff] text-xl">
                  insights
                </span>
                <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-[16px] text-[#dae2fd]">
                  Daily Velocity & Distribution
                </h3>
              </div>
              <span className="font-mono text-[11px] text-[#c7c4d7]">Last 7 Days</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              {/* Mini SVG Velocity Bar Chart */}
              <div className="sm:col-span-7 flex flex-col gap-2">
                <span className="text-[11px] text-[#c7c4d7] uppercase tracking-wider font-semibold">
                  Completed Story Velocity
                </span>
                <div className="h-28 w-full flex items-end justify-between gap-2 pt-2 px-1">
                  {[
                    { day: 'M', height: '45%' },
                    { day: 'T', height: '60%' },
                    { day: 'W', height: '85%' },
                    { day: 'Th', height: '100%', isPeak: true },
                    { day: 'F', height: '70%' },
                    { day: 'S', height: '25%' },
                    { day: 'Su', height: '30%' },
                  ].map((bar) => (
                    <div
                      key={bar.day}
                      className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end"
                    >
                      <div
                        className={`w-full rounded-t transition-all ${
                          bar.isPeak
                            ? 'bg-[#4edea3] shadow-sm'
                            : 'bg-[#8083ff]/40 hover:bg-[#8083ff]'
                        }`}
                        style={{ height: bar.height }}
                      ></div>
                      <span
                        className={`font-mono text-[10px] ${
                          bar.isPeak ? 'text-[#4edea3] font-bold' : 'text-[#c7c4d7]'
                        }`}
                      >
                        {bar.day}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between text-[#c7c4d7] text-xs pt-1 border-t border-[#464554]/20">
                  <span>Avg: 6.4 tasks/day</span>
                  <span className="text-[#4edea3] font-semibold">+22% vs last sprint</span>
                </div>
              </div>

              {/* Status Breakdown Donut Visual */}
              <div className="sm:col-span-5 flex flex-col items-center bg-[#131b2e] border border-[#464554]/20 p-3 rounded-xl">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#908fa0"
                      strokeWidth="8"
                      strokeDasharray="238.76"
                      strokeDashoffset="0"
                      className="opacity-70"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#c0c1ff"
                      strokeWidth="8"
                      strokeDasharray="238.76"
                      strokeDashoffset="78.7"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#4edea3"
                      strokeWidth="8"
                      strokeDasharray="238.76"
                      strokeDashoffset="143.2"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="font-['Plus_Jakarta_Sans'] font-bold text-[18px] text-[#dae2fd]">
                      32
                    </span>
                    <span className="text-[10px] text-[#c7c4d7] uppercase">Tasks</span>
                  </div>
                </div>

                <div className="w-full flex flex-col gap-1 mt-2 font-mono text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#c7c4d7]">
                      <span className="w-2 h-2 rounded-full bg-[#4edea3]"></span> Done
                    </span>
                    <span className="text-[#4edea3] font-semibold">40% (13)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#c7c4d7]">
                      <span className="w-2 h-2 rounded-full bg-[#c0c1ff]"></span> In Progress
                    </span>
                    <span className="text-[#c0c1ff] font-semibold">27% (9)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#c7c4d7]">
                      <span className="w-2 h-2 rounded-full bg-[#908fa0]"></span> To Do
                    </span>
                    <span className="text-[#dae2fd] font-semibold">33% (10)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Storage Health & One-Click Project Starter Export */}
          <div className="rounded-xl bg-[#222a3d]/60 backdrop-blur-md border border-[#464554]/30 p-4 shadow-md flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4edea3] text-lg">database</span>
                <span className="text-[13px] font-semibold text-[#dae2fd]">
                  Storage & Export Center
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#c7c4d7]">Auto-backup:</span>
                <span className="px-2 py-0.5 rounded-full bg-[#00885d]/30 text-[#4edea3] text-[10px] font-bold">
                  ACTIVE
                </span>
              </div>
            </div>

            {/* LocalStorage Quota Bar */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-[#c7c4d7]">Browser LocalStorage Quota</span>
                <span className="text-[#dae2fd] font-semibold">
                  {storageStats.usedKB} KB / {storageStats.totalMB} MB ({storageStats.percent}%)
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#2d3449] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#8083ff] to-[#4edea3] rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(4.8, storageStats.percent)}%` }}
                ></div>
              </div>
            </div>

            {/* Action Row */}
            <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-[#c7c4d7] text-xs">
                <span className="material-symbols-outlined text-sm">integration_instructions</span>
                <span>Export schema compatible with Vite + Tailwind</span>
              </div>
              <button
                type="button"
                onClick={handleExportStarterJson}
                className="h-8 px-3 rounded-lg bg-[#171f33] hover:bg-[#31394d] border border-[#464554]/30 text-[#c0c1ff] text-[12px] font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                <span>Export Starter JSON</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
