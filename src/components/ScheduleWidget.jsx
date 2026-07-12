import React from 'react';
import { useScheduleQuery } from '../features/schedule/useScheduleQuery';

export const ScheduleWidget = () => {
  const { schedule, scheduleLoading, scheduleError } = useScheduleQuery();

  return (
    <section className="glass-panel p-6 rounded-xl border border-white/5 bg-surface-container-low">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-headline-md text-lg font-bold text-text-primary">Your Schedule</h2>
        <span className="material-symbols-outlined text-text-secondary hover:text-primary-container cursor-pointer transition-colors">
          event
        </span>
      </div>

      {schedule.length === 0 ? (
        <p className="text-text-secondary text-lg italic">No actions scheduled yet. RSVP to an action to build your schedule.</p>
      ) : (
        <div className="space-y-4">
          {schedule.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl bg-surface-ink border-l-4 shadow-sm hover:translate-x-1 transition-transform cursor-pointer ${item.rsvp === 'Attending' ? 'border-primary-container' : 'border-gold-muted'
                }`}
            >
              <div className={`text-sm font-bold mb-1 ${item.rsvp === 'Attending' ? 'text-primary-container' : 'text-gold-muted'
                }`}>
                {item.time} • {item.rsvp.toUpperCase()}
              </div>
              <h4 className="font-label-md text-label-md text-text-primary mb-2 leading-tight">
                {item.title}
              </h4>
              <div className="flex items-center gap-2 text-text-secondary">
                <span className="material-symbols-outlined text-[14px]">
                  {item.location.toLowerCase().includes('zoom') || item.location.toLowerCase().includes('virtual') ? 'videocam' : 'location_on'}
                </span>
                <span className="text-[14px]">{item.location}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
