import React, { useState } from 'react';
import { WorkspaceView, Task } from './types';
import { useSprintStore } from './hooks/useSprintStore';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { BoardView } from './components/BoardView';
import { ListView } from './components/ListView';
import { FocusModeView } from './components/FocusModeView';
import { CalendarView } from './components/CalendarView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';
import { AiDeconstructModal } from './components/AiDeconstructModal';
import { NewTaskModal } from './components/NewTaskModal';
import { CommandPalette } from './components/CommandPalette';
import { ToastNotification } from './components/ToastNotification';

export default function App() {
  const [currentView, setCurrentView] = useState<WorkspaceView>('board-view');
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [aiModalTask, setAiModalTask] = useState<Task | null>(null);

  const {
    tasks,
    filteredTasks,
    stats,
    inspectingTaskId,
    setInspectingTaskId,
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
    bulkMarkDone,
    bulkDelete,
    bulkSetPriority,
    resetToMockData,
    clearAllStorage,
    exportJson,
    importSubtasksToKanban,
    autoOrganizeWithAi,
  } = useSprintStore();

  const handleOpenAiModalForTask = (task: Task) => {
    setAiModalTask(task);
  };

  const handleApplyAiSubtasks = (taskId: string, subtasks: any[]) => {
    const existing = tasks.find((t) => t.id === taskId);
    if (!existing) return;
    const merged = [...existing.subtasks, ...subtasks];
    updateTask(taskId, { subtasks: merged });
    showToast(`Injected ${subtasks.length} subtasks into ${taskId}`);
  };

  const handleSelectTaskFromCalendarOrSearch = (task: Task) => {
    setInspectingTaskId(task.id);
    setIsDrawerOpen(true);
    setCurrentView('board-view');
  };

  return (
    <div className="bg-[#0b1326] text-[#dae2fd] min-h-screen selection:bg-[#8083ff] selection:text-[#0d0096] font-['Inter'] flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onTagClick={(tag) => {
          setTagFilter(tag);
          showToast(`Filtered by #${tag}`);
        }}
      />

      {/* Main Content Area */}
      <div className="pl-64 flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          stats={stats}
          pomodoroSeconds={pomodoroSeconds}
          isPomodoroRunning={isPomodoroRunning}
          onOpenFocusMode={() => setCurrentView('focus-mode')}
          onOpenNewTask={() => setIsNewTaskModalOpen(true)}
          onOpenAiBreakdown={() => {
            const candidate = tasks.find((t) => t.id === inspectingTaskId) || tasks[0];
            if (candidate) handleOpenAiModalForTask(candidate);
          }}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />

        {/* View Switcher Viewport */}
        <main className="w-full pt-16 bg-[#0b1326] min-h-screen">
          {currentView === 'board-view' && (
            <BoardView
              tasks={tasks}
              filteredTasks={filteredTasks}
              inspectingTaskId={inspectingTaskId}
              setInspectingTaskId={setInspectingTaskId}
              isDrawerOpen={isDrawerOpen}
              setIsDrawerOpen={setIsDrawerOpen}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
              onAddTask={addTask}
              onToggleSubtask={toggleSubtask}
              onAddSubtask={addSubtask}
              onMoveTaskStatus={moveTaskStatus}
              onAutoOrganize={autoOrganizeWithAi}
              setCurrentView={setCurrentView}
              storageUsedKB={storageStats.usedKB}
            />
          )}

          {currentView === 'list-view' && (
            <ListView
              tasks={tasks}
              filteredTasks={filteredTasks}
              selectedTaskIds={selectedTaskIds}
              onToggleSelectTask={toggleSelectTask}
              onSelectAllInGroup={selectAllInGroup}
              onMoveTaskStatus={moveTaskStatus}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
              onDuplicateTask={duplicateTask}
              onAddTask={addTask}
              onOpenAiModalForTask={handleOpenAiModalForTask}
              onExportJson={exportJson}
              onSyncBackup={() => showToast('Synced snapshot with browser storage')}
              onResetMock={resetToMockData}
              onClearStorage={clearAllStorage}
              onBulkMarkDone={bulkMarkDone}
              onBulkDelete={bulkDelete}
              onBulkSetPriority={bulkSetPriority}
              storageStats={storageStats}
              lastSavedDiff={lastSavedDiff}
              tagFilter={tagFilter}
              setTagFilter={setTagFilter}
            />
          )}

          {currentView === 'focus-mode' && (
            <FocusModeView
              tasks={tasks}
              activeTaskId={activePomodoroTaskId}
              setActiveTaskId={setActivePomodoroTaskId}
              pomodoroSeconds={pomodoroSeconds}
              setPomodoroSeconds={setPomodoroSeconds}
              isPomodoroRunning={isPomodoroRunning}
              setIsPomodoroRunning={setIsPomodoroRunning}
              pomodoroCycle={pomodoroCycle}
              setPomodoroCycle={setPomodoroCycle}
              onImportToKanban={importSubtasksToKanban}
              onUpdateTask={updateTask}
              showToast={showToast}
              storageStats={storageStats}
            />
          )}

          {currentView === 'calendar' && (
            <CalendarView
              tasks={tasks}
              onSelectTask={handleSelectTaskFromCalendarOrSearch}
            />
          )}

          {currentView === 'analytics' && <AnalyticsView tasks={tasks} />}

          {currentView === 'settings' && (
            <SettingsView
              storageStats={storageStats}
              onResetMock={resetToMockData}
              onClearStorage={clearAllStorage}
              onExportJson={exportJson}
              onImportJson={(imported) => {
                resetToMockData();
              }}
              showToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Global Modals & Overlays */}
      <AiDeconstructModal
        task={aiModalTask}
        isOpen={!!aiModalTask}
        onClose={() => setAiModalTask(null)}
        onApplySubtasks={handleApplyAiSubtasks}
      />

      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        onAddTask={addTask}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        tasks={tasks}
        onSelectTask={handleSelectTaskFromCalendarOrSearch}
        onNavigateView={setCurrentView}
        onStartPomodoro={() => {
          setCurrentView('focus-mode');
          setIsPomodoroRunning(true);
        }}
        onAutoOrganize={autoOrganizeWithAi}
        onExportJson={exportJson}
        onOpenNewTask={() => setIsNewTaskModalOpen(true)}
      />

      <ToastNotification message={toastMessage} />
    </div>
  );
}
