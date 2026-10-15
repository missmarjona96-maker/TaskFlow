import React from 'react';
import { Task } from '../types';

interface AnalyticsViewProps {
  tasks: Task[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ tasks }) => {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === 'done').length;
  const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
  const todo = tasks.filter((t) => t.status === 'to-do').length;

  const p0Count = tasks.filter((t) => t.priority === 'P0').length;
  const p1Count = tasks.filter((t) => t.priority === 'P1').length;
  const p2Count = tasks.filter((t) => t.priority === 'P2').length;
  const p3Count = tasks.filter((t) => t.priority === 'P3').length;

  const totalSpentHours = tasks.reduce(
    (acc, t) => acc + (t.pomodoro?.spentHours || 0),
    0
  );

  return (
    <div className="w-full flex flex-col px-6 py-4 space-y-6">
      {/* Title Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#131b2e] border border-[#464554]/30 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4edea3]"></span>
            <span className="font-mono text-xs text-[#4edea3] uppercase tracking-wider font-semibold">
              Performance & Velocity Metrics
            </span>
          </div>
          <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-[26px] text-[#dae2fd] tracking-tight mt-1">
            Sprint 24 Engineering Analytics
          </h1>
          <p className="text-[13px] text-[#c7c4d7]">
            Real-time burn-up telemetry, story completion velocity, and cognitive workload balance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-[#171f33] border border-[#464554]/30 text-xs font-mono text-[#c0c1ff]">
            Updated 2m ago
          </span>
        </div>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#171f33] border border-[#464554]/30 shadow-sm">
          <span className="text-[11px] text-[#c7c4d7] uppercase tracking-wider font-semibold">
            Sprint Throughput
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-[#dae2fd]">
              {done}/{total}
            </span>
            <span className="font-mono text-xs text-[#4edea3] font-semibold">
              {Math.round((done / Math.max(1, total)) * 100)}%
            </span>
          </div>
          <p className="text-xs text-[#c7c4d7]/70 mt-1">Target: 80% before sprint close</p>
        </div>

        <div className="p-4 rounded-xl bg-[#171f33] border border-[#464554]/30 shadow-sm">
          <span className="text-[11px] text-[#c7c4d7] uppercase tracking-wider font-semibold">
            Focus Time Logged
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-[#d0bcff]">
              {totalSpentHours.toFixed(1)} hrs
            </span>
            <span className="font-mono text-xs text-[#4edea3] font-semibold">+4.5h</span>
          </div>
          <p className="text-xs text-[#c7c4d7]/70 mt-1">Across 18 hyperfocus intervals</p>
        </div>

        <div className="p-4 rounded-xl bg-[#171f33] border border-[#464554]/30 shadow-sm">
          <span className="text-[11px] text-[#c7c4d7] uppercase tracking-wider font-semibold">
            Urgent Blockers (P0)
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-[#ffb4ab]">
              {p0Count}
            </span>
            <span className="font-mono text-xs text-[#ffb4ab]">Action Required</span>
          </div>
          <p className="text-xs text-[#c7c4d7]/70 mt-1">2 high-impact items in review</p>
        </div>

        <div className="p-4 rounded-xl bg-[#171f33] border border-[#464554]/30 shadow-sm">
          <span className="text-[11px] text-[#c7c4d7] uppercase tracking-wider font-semibold">
            Avg Cycle Time
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-[#4edea3]">
              1.8 days
            </span>
            <span className="font-mono text-xs text-[#4edea3] font-semibold">-14%</span>
          </div>
          <p className="text-xs text-[#c7c4d7]/70 mt-1">Faster than Sprint 23 benchmark</p>
        </div>
      </div>

      {/* Charts Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sprint Burndown Simulation */}
        <div className="p-5 rounded-xl bg-[#171f33] border border-[#464554]/30 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#8083ff]">trending_down</span>
              <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-[16px] text-[#dae2fd]">
                Sprint Burndown Trajectory
              </h3>
            </div>
            <span className="font-mono text-xs text-[#4edea3]">On Track</span>
          </div>

          <div className="h-56 w-full flex items-end justify-between gap-3 pt-4 px-2 border-b border-[#464554]/25">
            {[
              { day: 'Day 1', ideal: 100, actual: 100 },
              { day: 'Day 3', ideal: 80, actual: 88 },
              { day: 'Day 5', ideal: 60, actual: 64 },
              { day: 'Day 7', ideal: 40, actual: 42 },
              { day: 'Day 9', ideal: 20, actual: 28 },
              { day: 'Day 10', ideal: 0, actual: 12 },
            ].map((pt) => (
              <div key={pt.day} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <div className="w-full flex items-end justify-center gap-1.5 h-full">
                  <div
                    className="w-3 rounded-t bg-[#464554]/60"
                    style={{ height: `${pt.ideal}%` }}
                    title={`Ideal: ${pt.ideal}%`}
                  ></div>
                  <div
                    className="w-3 rounded-t bg-[#8083ff]"
                    style={{ height: `${pt.actual}%` }}
                    title={`Actual: ${pt.actual}%`}
                  ></div>
                </div>
                <span className="font-mono text-[10px] text-[#c7c4d7] mt-1">{pt.day}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-[#c7c4d7] pt-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-[#464554]"></span>
              <span>Guideline (Ideal)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-[#8083ff]"></span>
              <span>Actual Burnup</span>
            </div>
          </div>
        </div>

        {/* Priority & Workload Breakdown */}
        <div className="p-5 rounded-xl bg-[#171f33] border border-[#464554]/30 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#d0bcff]">pie_chart</span>
              <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-[16px] text-[#dae2fd]">
                Priority & Allocation Matrix
              </h3>
            </div>
            <span className="font-mono text-xs text-[#c7c4d7]">{total} Total Tickets</span>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#ffb4ab] font-medium">P0 Urgent / Critical</span>
                <span className="font-mono text-[#dae2fd]">{p0Count} tasks ({Math.round((p0Count / total) * 100 || 0)}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#222a3d] overflow-hidden">
                <div className="h-full bg-[#ffb4ab] rounded-full" style={{ width: `${(p0Count / total) * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#c0c1ff] font-medium">P1 High Priority</span>
                <span className="font-mono text-[#dae2fd]">{p1Count} tasks ({Math.round((p1Count / total) * 100 || 0)}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#222a3d] overflow-hidden">
                <div className="h-full bg-[#8083ff] rounded-full" style={{ width: `${(p1Count / total) * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#4edea3] font-medium">P2 Medium Priority</span>
                <span className="font-mono text-[#dae2fd]">{p2Count} tasks ({Math.round((p2Count / total) * 100 || 0)}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#222a3d] overflow-hidden">
                <div className="h-full bg-[#4edea3] rounded-full" style={{ width: `${(p2Count / total) * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#908fa0] font-medium">P3 Low Priority</span>
                <span className="font-mono text-[#dae2fd]">{p3Count} tasks ({Math.round((p3Count / total) * 100 || 0)}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#222a3d] overflow-hidden">
                <div className="h-full bg-[#908fa0] rounded-full" style={{ width: `${(p3Count / total) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
