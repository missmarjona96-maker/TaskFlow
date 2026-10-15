import React, { useState } from 'react';
import { Task } from '../types';

interface CalendarViewProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onSelectTask }) => {
  const [currentMonth, setCurrentMonth] = useState('October 2025');

  // Days in October 2025 (Oct 1 is Wednesday)
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  // Group tasks by day in Oct 2025
  const getTasksForDay = (day: number) => {
    return tasks.filter((t) => {
      if (t.dueDate === 'Today' && day === 28) return true;
      if (t.dueDate === 'Tomorrow' && day === 29) return true;
      if (t.dueDate.includes(`Oct ${day}`) || t.dueDate.includes(`Oct 0${day}`)) return true;
      return false;
    });
  };

  return (
    <div className="w-full flex flex-col px-6 py-4 space-y-5">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#131b2e] border border-[#464554]/30 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8083ff]"></span>
            <span className="font-mono text-xs text-[#c0c1ff] uppercase tracking-wider font-semibold">
              Sprint 24 Timeline
            </span>
          </div>
          <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-[26px] text-[#dae2fd] tracking-tight mt-1">
            Sprint Calendar — {currentMonth}
          </h1>
          <p className="text-[13px] text-[#c7c4d7]">
            Visual sprint runway, milestones, and release deadlines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="h-8 px-3 rounded-lg bg-[#171f33] hover:bg-[#222a3d] border border-[#464554]/30 text-xs text-[#dae2fd] font-medium"
          >
            Today
          </button>
          <div className="flex items-center rounded-lg bg-[#171f33] border border-[#464554]/30">
            <button
              type="button"
              className="w-8 h-8 flex items-center justify-center text-[#c7c4d7] hover:text-[#dae2fd]"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button
              type="button"
              className="w-8 h-8 flex items-center justify-center text-[#c7c4d7] hover:text-[#dae2fd]"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-xl bg-[#131b2e] border border-[#464554]/30 p-4 shadow-sm overflow-x-auto">
        {/* Days of week */}
        <div className="grid grid-cols-7 gap-2 pb-2 border-b border-[#464554]/25 text-center font-mono text-xs text-[#c7c4d7] font-semibold">
          <span>MON</span>
          <span>TUE</span>
          <span>WED</span>
          <span>THU</span>
          <span>FRI</span>
          <span>SAT</span>
          <span>SUN</span>
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-2 pt-2">
          {/* Offset for Oct 1st (Wednesday -> Mon, Tue empty) */}
          <div className="h-28 rounded-lg bg-[#171f33]/20 p-2 opacity-30"></div>
          <div className="h-28 rounded-lg bg-[#171f33]/20 p-2 opacity-30"></div>

          {days.map((day) => {
            const dayTasks = getTasksForDay(day);
            const isToday = day === 28;

            return (
              <div
                key={day}
                className={`min-h-[110px] rounded-lg border p-2 flex flex-col justify-between transition-colors ${
                  isToday
                    ? 'bg-[#171f33] border-[#8083ff]/60 ring-1 ring-[#8083ff]/30 shadow-md'
                    : 'bg-[#171f33]/60 hover:bg-[#171f33] border-[#464554]/25'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono text-xs font-semibold ${
                      isToday
                        ? 'px-1.5 py-0.5 rounded-full bg-[#8083ff] text-[#0d0096]'
                        : 'text-[#c7c4d7]'
                    }`}
                  >
                    {day}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[10px] font-mono text-[#c0c1ff]">
                      {dayTasks.length} task{dayTasks.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1 my-1 overflow-y-auto max-h-20">
                  {dayTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => onSelectTask(t)}
                      className={`px-1.5 py-0.5 rounded text-[11px] truncate cursor-pointer font-medium transition-colors ${
                        t.status === 'done'
                          ? 'bg-[#00885d]/30 text-[#4edea3] line-through'
                          : t.priority === 'P0'
                          ? 'bg-[#93000a]/50 text-[#ffdad6]'
                          : 'bg-[#222a3d] text-[#c0c1ff] hover:bg-[#31394d]'
                      }`}
                      title={t.title}
                    >
                      {t.title}
                    </div>
                  ))}
                </div>

                <div className="text-[10px] text-[#908fa0] text-right">
                  {isToday ? 'Active Day' : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
