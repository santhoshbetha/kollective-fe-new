import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScheduleWidget } from '../components/ScheduleWidget';
import { useOrganizeActionsQuery } from '../features/organize/useOrganizeFeature';
import { ActionCard } from '../features/organize/ActionCard';

export const OrganizePage = () => {
  const navigate = useNavigate();
  const { organizeActions, organizeActionsLoading } = useOrganizeActionsQuery();
  const [activeGeo, setActiveGeo] = useState('Local');
  const [toastMessage, setToastMessage] = useState('');
  const geoFilters = ['Local', 'State', 'Country'];

  return (
    <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row gap-12 text-scale-large">
      {/* Center Content: Action Feed */}
      <div className="flex-1">
        {/* Header & Tabs Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6 border-b border-white/5 pb-8">
          <div className='flex flex-col'>
            <div className='flex items-center gap-0'>
              <img src="../KFISTS.png" alt="Organize Logo" className="w-16" />
              <h1 className="font-headline-lg text-3xl font-extrabold text-text-primary mb-2">
                Organize Action
              </h1>
            </div>
            <p className="text-text-secondary font-body-md text-xl font-semibold leading-relaxed max-w-xl">
              Join grassroots movements making a difference. From local protests to national coalitions, find your frontline.
            </p>
          </div>

          {/* Geographic Tabs */}
          <div className="flex bg-surface-container rounded-full p-1 border border-white/10 w-fit">
            {geoFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveGeo(filter)}
                className={`px-6 py-2 rounded-full font-label-md text-sm font-bold transition-all ${activeGeo === filter
                  ? 'bg-primary-container text-white shadow-lg'
                  : 'text-on-surface-variant hover:text-primary-container'
                  }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Action Feed Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-20">
          {organizeActionsLoading ? (
            <div className="col-span-full py-12 flex flex-col items-center gap-4">
              <div className="w-8 h-8 rounded-full border-2 border-t-primary-container border-white/10 animate-spin"></div>
              <p className="text-text-secondary text-sm font-bold uppercase tracking-widest">
                Loading organizing actions...
              </p>
            </div>
          ) : organizeActions.map((action) => {
            const isAttending = action?.rsvp === 'Attending';
            const isInterested = action?.rsvp === 'Interested';

            return (
              <ActionCard key={action?.id} action={action} setToastMessage={setToastMessage} />
            );
          })}
        </div>
      </div>

      {/* Right Sidebar: Your Schedule */}
      <aside className="w-full lg:w-80 flex flex-col gap-6 shrink-0 lg:sticky lg:top-20 h-fit">
        <ScheduleWidget />

        {/* Mobilize Widget */}
        <section className="p-6 rounded-2xl bg-gradient-to-br from-surface-crimson-low to-surface border border-primary/20 bg-surface-container-low">
          <h3 className="font-headline-md text-2xl font-bold text-primary-container mb-2">
            Mobilize Your Unit
          </h3>
          <p className="text-on-surface-variant text-lg mb-4 leading-relaxed">
            Start your own grassroots action and invite your community to join the frontline.
          </p>
          <button
            onClick={() => navigate('/organize/create')}
            className="w-full py-3 bg-text-primary text-surface font-bold rounded-lg hover:bg-primary-container hover:text-white transition-all active:scale-95 text-sm uppercase tracking-wider cursor-pointer"
          >
            Create New Action
          </button>
        </section>
      </aside>
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-surface-ink dark:text-[#F4F4F4] 
          border border-primary-container/30 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2 
          animate-in fade-in slide-in-from-bottom-4 duration-200">
          <span className="material-symbols-outlined text-primary-container text-sm">info</span>
          <span className="text-sm font-semibold uppercase tracking-wider">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
