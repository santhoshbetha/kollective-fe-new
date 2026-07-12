import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrganizeActionsQuery } from '../features/organize/useOrganizeFeature';
import { useRsvpToAction } from '../features/organize/useOrganizeFeature';

export const ActionDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const rsvpToActionMutation = useRsvpToAction();
  const { organizeActions, organizeActionsLoading } = useOrganizeActionsQuery();
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 2500);
  };

  const action = organizeActions.find((a) => a.id === id);

  if (organizeActionsLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-t-primary-container border-white/10 animate-spin"></div>
        <p className="text-text-secondary text-lg font-bold uppercase tracking-widest">
          Loading action details...
        </p>
      </div>
    );
  }

  if (!action) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 md:px-0 py-12 text-center text-scale-large">
        <span className="material-symbols-outlined text-5xl text-primary-container mb-4">
          warning
        </span>
        <h3 className="font-bold text-text-primary text-xl mb-2">Action Not Found</h3>
        <p className="text-text-secondary text-lg mb-6">
          The organizing action you are looking for does not exist or has been removed.
        </p>
        <button
          onClick={() => navigate('/organize')}
          className="px-6 py-2.5 bg-primary-container text-white font-bold rounded-xl text-sm md:text-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer border-none"
        >
          Return to Organize
        </button>
      </div>
    );
  }

  const isAttending = action.rsvp === 'Attending';
  const isInterested = action.rsvp === 'Interested';

  const defaultDescriptions = {
    'action-1': 'A massive public demonstration organized to demand secure, affordable, and dignified housing for all citizens in the Downtown District. We will assemble peacefully and walk towards City Hall.',
    'action-2': 'A community forum to discuss safety concerns, mutual aid networks, and local resilience protocols for District 4 neighbors. Representatives from the local council will be present.',
    'action-3': 'A collaborative brainstorming session focused on establishing community-led cooperative gardens, vertical hydroponic farms, and local food distribution networks.',
    'action-4': 'A public march and rally calling for the creation of community-owned clean energy jobs, solar microgrids, and green infrastructure investments.'
  };

  const description = action.description || defaultDescriptions[action.id] || 'Join other community members in this grassroots action. Let us organize, mobilize, and create positive local impact together.';

  return (
    <div className="max-w-[800px] mx-auto px-4 md:px-0 relative text-scale-large pb-20">
      {/* Back Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate('/organize')}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors font-bold text-sm md:text-lg group cursor-pointer border-none bg-transparent"
        >
          <span className="material-symbols-outlined text-base transition-transform group-hover:-translate-x-1">
            arrow_back
          </span>
          Back to Organize
        </button>
      </div>

      {/* Main Details Panel */}
      <div className="glass-panel p-8 rounded-2xl border border-white/10 shadow-2xl space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>

        {/* Category Badge & Action Type */}
        <div className="flex justify-between items-center">
          <span className={`px-4 py-2 border text-[14px] font-bold uppercase tracking-widest rounded-full ${action.type === 'Protest'
            ? 'bg-surface-crimson-low border-primary/20 text-primary-container'
            : action.type === 'Town Hall'
              ? 'bg-secondary/10 border-secondary/20 text-text-secondary'
              : 'bg-tertiary/10 border-tertiary/20 text-tertiary'
            }`}>
            {action.type}
          </span>
          <div className="flex items-center gap-2 text-gold-muted">
            <span className="material-symbols-outlined text-lg">verified</span>
            <span className="text-[14px] font-bold uppercase tracking-wider">Grassroots</span>
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="font-display-lg text-2xl md:text-3xl font-extrabold text-text-primary leading-tight">
            {action.title}
          </h1>
          <p className="text-text-secondary text-sm mt-2 font-medium">
            Initiated by <span className="text-primary-container font-bold">{action.organizer}</span>
          </p>
        </div>

        {/* Time, Venue & Location Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6 border-y border-white/5">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary-container mt-0.5">calendar_today</span>
            <div>
              <p className="text-sm uppercase font-bold text-text-secondary tracking-wider">Date & Time</p>
              <p className="text-lg font-semibold text-text-primary mt-0.5">{action.time}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary-container mt-0.5">location_on</span>
            <div>
              <p className="text-sm uppercase font-bold text-text-secondary tracking-wider">Location / Venue</p>
              <p className="text-lg font-semibold text-text-primary mt-0.5">{action.location}</p>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="space-y-4">
          <h3 className="font-headline-md text-base font-bold text-text-primary">Action Objective</h3>
          <p className="text-text-secondary text-lg leading-relaxed whitespace-pre-line">
            {description}
          </p>
        </div>

        {/* RSVP Conditional details */}
        {isAttending && action.meetingLink && (
          <div className="p-4 bg-surface-crimson-low border border-primary-container/20 rounded-xl flex flex-col gap-2">
            <div className="flex items-center gap-2 text-primary-container">
              <span className="material-symbols-outlined">link</span>
              <p className="text-sm font-bold uppercase tracking-wider">Secure Access Link</p>
            </div>
            <a
              href={action.meetingLink}
              target="_blank"
              rel="noreferrer"
              className="text-lg font-bold text-text-primary hover:underline break-all"
            >
              {action.meetingLink}
            </a>
          </div>
        )}

        {/* Interactive RSVP Action Controls */}
        <div className="pt-6 flex flex-col sm:flex-row gap-4 border-t border-white/5">
          <button
            onClick={() => {
              const newStatus = isAttending ? 'None' : 'Attending';
              rsvpToActionMutation.mutate({ id: action.id, status: newStatus });
              triggerToast(newStatus === 'Attending' ? 'Marked as Attending!' : 'RSVP Cancelled');
            }}
            className={`flex-1 py-3.5 rounded-none font-bold text-sm uppercase tracking-wider cursor-pointer border-none transition-all ${isAttending
              ? 'bg-primary-container text-white crimson-glow brightness-110'
              : 'bg-surface-container-high border border-outline-variant text-text-primary hover:bg-surface-container-highest'
              }`}
          >
            {isAttending ? 'Attending ✓' : 'Attend Action'}
          </button>

          <button
            onClick={() => {
              const newStatus = isInterested ? 'None' : 'Interested';
              rsvpToAction(action.id, newStatus);
              triggerToast(newStatus === 'Interested' ? 'Marked as Interested!' : 'RSVP Cancelled');
            }}
            className={`flex-1 py-3.5 rounded-none font-bold text-sm uppercase tracking-wider cursor-pointer transition-all ${isInterested
              ? 'bg-secondary text-on-secondary font-bold brightness-110 border-none'
              : 'border border-outline-variant hover:bg-surface-container-high/60 text-text-primary bg-transparent'
              }`}
          >
            {isInterested ? 'Interested ✓' : 'Mark as Interested'}
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-surface-ink text-[#F4F4F4] border border-primary-container/30 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <span className="material-symbols-outlined text-primary-container text-lg">info</span>
          <span className="text-sm font-semibold uppercase tracking-wider">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
