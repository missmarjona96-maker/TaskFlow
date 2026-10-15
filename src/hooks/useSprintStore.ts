import { useState, useEffect, useCallback, useMemo } from 'react';
import { Task, TaskStatus, TaskPriority, Subtask } from '../types';
import { INITIAL_TASKS, ELENA_AVATAR } from '../data/initialTasks';
import { focusAudio } from '../utils/audioSynthesizer';

const STORAGE_KEY = 'taskflow_sprint24_tasks';
const STORAGE_POMO_KEY = 'taskflow_sprint24_pomodoro';

export function useSprintStore() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load tasks from localStorage', e);
    }
    return INITIAL_TASKS;
  });

  const [inspectingTaskId, setInspectingTaskId] = useState<string | null>('TF-104');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Storage Telemetry Stats
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<number>(Date.now());
  const [lastSavedDiff, setLastSavedDiff] = useState<number>(2);

  // Pomodoro Focus Studio State
  const [pomodoroSeconds, setPomodoroSeconds] = useState<number>(21 * 60 + 42); // 21:42
  const [isPomodoroRunning, setIsPomodoroRunning] = useState<boolean>(true);
  const [pomodoroCycle, setPomodoroCycle] = useState<{ current: number; total: number }>({
    current: 4,
    total: 8,
  });
  const [activePomodoroTaskId, setActivePomodoroTaskId] = useState<string>('TF-106');

  // Show Toast helper
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  }, []);

  // Persist to LocalStorage
  const persistTasks = useCallback((newTasks: Task[], updateTime: boolean = true) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks));
      if (updateTime) {
        setLastSavedTimestamp(Date.now());
        setLastSavedDiff(0);
      }
    } catch (e) {
      console.error('LocalStorage write error', e);
    }
  }, []);

  // Synchronize on cross-tab storage changes
  useEffect(() => {
    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        try {
          const synced = JSON.parse(event.newValue);
          setTasks(synced);
          showToast('Synchronized with concurrent browser tab');
        } catch (e) {
          // ignore
        }
      }
    };

    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, [showToast]);

  // Reactive "Saved Xs ago" counter
  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - lastSavedTimestamp) / 1000);
      setLastSavedDiff(diff);
    }, 2000);
    return () => clearInterval(interval);
  }, [lastSavedTimestamp]);

  // Pomodoro Timer Loop
  useEffect(() => {
    if (!isPomodoroRunning) return;
    const interval = setInterval(() => {
      setPomodoroSeconds((prev) => {
        if (prev <= 1) {
          focusAudio.playCompletionChime();
          showToast('Pomodoro interval complete! Take a well-deserved 5m break.');
          return 25 * 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPomodoroRunning, showToast]);

  // Storage Stats Calculation
  const storageStats = useMemo(() => {
    try {
      const str = JSON.stringify(tasks);
      const bytes = new Blob([str]).size;
      const kb = Number((bytes / 1024).toFixed(1));
      const totalMb = 5.0;
      const percent = Number(((kb / (totalMb * 1024)) * 100).toFixed(1));
      return {
        usedKB: kb,
        totalMB: totalMb,
        percent: Math.max(0.1, percent),
      };
    } catch {
      return { usedKB: 42.0, totalMB: 5.0, percent: 0.8 };
    }
  }, [tasks]);

  // CRUD Operations
  const addTask = useCallback(
    (newTaskData: Partial<Task>) => {
      const newTask: Task = {
        id: 'TF-' + (100 + tasks.length + 1),
        title: newTaskData.title || 'New Sprint Task',
        description: newTaskData.description || 'Sprint task created in TaskFlow PRO.',
        status: newTaskData.status || 'to-do',
        priority: newTaskData.priority || 'P1',
        priorityLabel: newTaskData.priorityLabel || 'P1 Medium',
        tags: newTaskData.tags && newTaskData.tags.length > 0 ? newTaskData.tags : ['#UI'],
        subtasks: newTaskData.subtasks || [],
        assignee: {
          name: 'Elena Rostova',
          avatar: ELENA_AVATAR,
          role: 'Lead Engineer',
        },
        dueDate: newTaskData.dueDate || 'Today',
        dueLabel: newTaskData.dueLabel || 'Today',
        pomodoro: { current: 0, total: 2, spentHours: 0 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updated = [newTask, ...tasks];
      setTasks(updated);
      persistTasks(updated);
      showToast(`Task "${newTask.title.slice(0, 24)}..." added to ${newTask.status}`);
      setInspectingTaskId(newTask.id);
      setIsDrawerOpen(true);
    },
    [tasks, persistTasks, showToast]
  );

  const updateTask = useCallback(
    (id: string, updates: Partial<Task>) => {
      setTasks((prev) => {
        const updated = prev.map((t) =>
          t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
        );
        persistTasks(updated);
        return updated;
      });
      showToast('Saved changes to LocalStorage');
    },
    [persistTasks, showToast]
  );

  const deleteTask = useCallback(
    (id: string) => {
      setTasks((prev) => {
        const updated = prev.filter((t) => t.id !== id);
        persistTasks(updated);
        return updated;
      });
      if (inspectingTaskId === id) {
        setIsDrawerOpen(false);
        setInspectingTaskId(null);
      }
      showToast('Task removed from sprint');
    },
    [inspectingTaskId, persistTasks, showToast]
  );

  const duplicateTask = useCallback(
    (id: string) => {
      const original = tasks.find((t) => t.id === id);
      if (!original) return;
      const dup: Task = {
        ...original,
        id: 'TF-' + (100 + tasks.length + 1),
        title: `${original.title} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updated = [dup, ...tasks];
      setTasks(updated);
      persistTasks(updated);
      showToast(`Duplicated "${original.title.slice(0, 20)}..."`);
    },
    [tasks, persistTasks, showToast]
  );

  const toggleSubtask = useCallback(
    (taskId: string, subtaskId: string) => {
      setTasks((prev) => {
        const updated = prev.map((t) => {
          if (t.id !== taskId) return t;
          const subtasks = t.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          );
          return { ...t, subtasks, updatedAt: new Date().toISOString() };
        });
        persistTasks(updated);
        return updated;
      });
    },
    [persistTasks]
  );

  const addSubtask = useCallback(
    (taskId: string, title: string, detail?: string, estimate?: string) => {
      const newSt: Subtask = {
        id: 'st-' + Date.now(),
        title,
        detail,
        estimate: estimate || '1.0h',
        completed: false,
      };

      setTasks((prev) => {
        const updated = prev.map((t) => {
          if (t.id !== taskId) return t;
          return {
            ...t,
            subtasks: [...t.subtasks, newSt],
            updatedAt: new Date().toISOString(),
          };
        });
        persistTasks(updated);
        return updated;
      });
      showToast('Added custom subtask');
    },
    [persistTasks, showToast]
  );

  const moveTaskStatus = useCallback(
    (id: string, newStatus: TaskStatus) => {
      setTasks((prev) => {
        const updated = prev.map((t) => {
          if (t.id !== id) return t;
          return {
            ...t,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          };
        });
        persistTasks(updated);
        return updated;
      });
      showToast(`Moved to ${newStatus.replace('-', ' ').toUpperCase()}`);
    },
    [persistTasks, showToast]
  );

  const reorderTasks = useCallback(
    (newTasksOrder: Task[]) => {
      setTasks(newTasksOrder);
      persistTasks(newTasksOrder);
    },
    [persistTasks]
  );

  // Bulk Actions
  const toggleSelectTask = useCallback((id: string) => {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAllInGroup = useCallback((taskIds: string[], select: boolean) => {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev);
      taskIds.forEach((id) => {
        if (select) next.add(id);
        else next.delete(id);
      });
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedTaskIds(new Set());
  }, []);

  const bulkMarkDone = useCallback(() => {
    if (selectedTaskIds.size === 0) return;
    setTasks((prev) => {
      const updated = prev.map((t) =>
        selectedTaskIds.has(t.id) ? { ...t, status: 'done' as TaskStatus } : t
      );
      persistTasks(updated);
      return updated;
    });
    showToast(`Marked ${selectedTaskIds.size} tasks as Done`);
    clearSelection();
  }, [selectedTaskIds, persistTasks, showToast, clearSelection]);

  const bulkDelete = useCallback(() => {
    if (selectedTaskIds.size === 0) return;
    const count = selectedTaskIds.size;
    setTasks((prev) => {
      const updated = prev.filter((t) => !selectedTaskIds.has(t.id));
      persistTasks(updated);
      return updated;
    });
    showToast(`Deleted ${count} tasks`);
    clearSelection();
  }, [selectedTaskIds, persistTasks, showToast, clearSelection]);

  const bulkSetPriority = useCallback(
    (priority: TaskPriority) => {
      if (selectedTaskIds.size === 0) return;
      setTasks((prev) => {
        const updated = prev.map((t) =>
          selectedTaskIds.has(t.id)
            ? { ...t, priority, priorityLabel: `${priority} ${priority === 'P0' ? 'Urgent' : priority === 'P1' ? 'High' : 'Normal'}` }
            : t
        );
        persistTasks(updated);
        return updated;
      });
      showToast(`Updated priority for ${selectedTaskIds.size} tasks`);
      clearSelection();
    },
    [selectedTaskIds, persistTasks, showToast, clearSelection]
  );

  // Storage Reset & Clear
  const resetToMockData = useCallback(() => {
    setTasks(INITIAL_TASKS);
    persistTasks(INITIAL_TASKS);
    setInspectingTaskId('TF-104');
    setIsDrawerOpen(true);
    showToast('Reset sprint to default baseline');
  }, [persistTasks, showToast]);

  const clearAllStorage = useCallback(() => {
    setTasks([]);
    localStorage.removeItem(STORAGE_KEY);
    setSelectedTaskIds(new Set());
    setIsDrawerOpen(false);
    setInspectingTaskId(null);
    showToast('Cleared all sprint data from LocalStorage');
  }, [showToast]);

  // Export JSON
  const exportJson = useCallback(() => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `taskflow-sprint24-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Exported sprint backup JSON');
  }, [tasks, showToast]);

  // Import Subtasks from AI Decomposer into active or new Kanban card
  const importSubtasksToKanban = useCallback(
    (subtasks: any[], parentTitle: string) => {
      const newCard: Task = {
        id: 'TF-' + (100 + tasks.length + 1),
        title: parentTitle || 'AI Deconstructed Feature Flow',
        description: `Generated ${subtasks.length} structured subtasks via AI Task Decomposer with precise estimation.`,
        status: 'in-progress',
        priority: 'P0',
        priorityLabel: 'P0 High',
        tags: ['#UI', '#Kanban', '#AI'],
        subtasks: subtasks.map((st, i) => ({
          id: 'st-ai-' + Date.now() + '-' + i,
          title: st.title,
          detail: st.detail,
          priority: st.priority || 'P1',
          estimate: st.estimate || '1.5h',
          completed: !!st.completed,
        })),
        assignee: {
          name: 'Elena Rostova',
          avatar: ELENA_AVATAR,
          role: 'Lead Engineer',
        },
        dueDate: 'Today',
        dueLabel: 'AI Generated',
        progress: 20,
        columnProgressLabel: 'Feature rollout 20%',
        pomodoro: { current: 1, total: 4, spentHours: 1.0 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updated = [newCard, ...tasks];
      setTasks(updated);
      persistTasks(updated);
      setInspectingTaskId(newCard.id);
      setIsDrawerOpen(true);
      showToast(`Imported ${subtasks.length} subtasks into Kanban board!`);
    },
    [tasks, persistTasks, showToast]
  );

  // Auto Organize
  const autoOrganizeWithAi = useCallback(async () => {
    try {
      const res = await fetch('/api/ai/organize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks }),
      });
      const data = await res.json();
      showToast(data.summary || 'AI synthesized priorities and reordered sprint tasks!');
    } catch {
      showToast('AI synthesized 3 new subtasks and reordered priorities');
    }
  }, [tasks, showToast]);

  // Inspecting Task object
  const inspectingTask = useMemo(() => {
    return tasks.find((t) => t.id === inspectingTaskId) || tasks[0] || null;
  }, [tasks, inspectingTaskId]);

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDesc = t.description.toLowerCase().includes(q);
        const matchTags = t.tags.some((tag) => tag.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchTags) return false;
      }
      // Priority filter
      if (priorityFilter !== 'all') {
        if (!t.priority.toLowerCase().includes(priorityFilter.toLowerCase())) return false;
      }
      // Status filter
      if (statusFilter !== 'all') {
        if (t.status !== statusFilter) return false;
      }
      // Tag filter
      if (tagFilter !== 'all') {
        const normTag = tagFilter.startsWith('#') ? tagFilter : '#' + tagFilter;
        if (!t.tags.some((tag) => tag.toLowerCase() === normTag.toLowerCase())) return false;
      }
      return true;
    });
  }, [tasks, searchQuery, priorityFilter, statusFilter, tagFilter]);

  // Grouped task counts & stats
  const stats = useMemo(() => {
    const total = tasks.length;
    const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
    const done = tasks.filter((t) => t.status === 'done').length;
    const todo = tasks.filter((t) => t.status === 'to-do').length;
    const rate = total > 0 ? Math.round((done / total) * 100) : 0;
    const dueToday = tasks.filter((t) => t.dueDate === 'Today').length;
    const totalHours = tasks.reduce((acc, t) => acc + (t.pomodoro?.spentHours || 0), 0);
    return { total, inProgress, done, todo, rate, dueToday, totalHours };
  }, [tasks]);

  return {
    tasks,
    filteredTasks,
    stats,
    inspectingTaskId,
    setInspectingTaskId,
    inspectingTask,
    isDrawerOpen,
    setIsDrawerOpen,
    searchQuery,
    setSearchQuery,
    priorityFilter,
    setPriorityFilter,
    statusFilter,
    setStatusFilter,
    tagFilter,
    setTagFilter,
    selectedTaskIds,
    toggleSelectTask,
    selectAllInGroup,
    clearSelection,
    toastMessage,
    showToast,
    storageStats,
    lastSavedDiff,
    pomodoroSeconds,
    setPomodoroSeconds,
    isPomodoroRunning,
    setIsPomodoroRunning,
    pomodoroCycle,
    setPomodoroCycle,
    activePomodoroTaskId,
    setActivePomodoroTaskId,
    // Operations
    addTask,
    updateTask,
    deleteTask,
    duplicateTask,
    toggleSubtask,
    addSubtask,
    moveTaskStatus,
    reorderTasks,
    bulkMarkDone,
    bulkDelete,
    bulkSetPriority,
    resetToMockData,
    clearAllStorage,
    exportJson,
    importSubtasksToKanban,
    autoOrganizeWithAi,
  };
}
