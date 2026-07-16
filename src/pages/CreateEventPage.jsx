import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateEvent } from '../features/events/useCreateEvent';

const PRESET_COVERS = [
  {
    id: 'cover-1',
    name: 'Tech Auditorium',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9ksWN3ffoNOR2pmCU_J77IFwl9hhLOut8yg3EmzQpTlaR5Hf8lFAohQKRwGxjmEQU1EKOa2K3LriDOS9oQyNxNVoc9fBlxrHJmS23dwNWndRQdmB6jLXkCmKGDmuLsDbriLsLAeKPungn6DgAECaGiUWeOIz8mWO3TUXt5UuNnBt5w-2cE_lc8WMx7-4pgWo4xVvMSn333iHXJItCRu5mD0sd1nXkN3S91vFY5dHZqL0pLaArDYKZSqzoXh6-1wbf6PDmZ5om9FY'
  },
  {
    id: 'cover-2',
    name: 'Climate Action',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmM1MOsrx_Oxh9mLlPIv9wjEUWU4Nkq0oMUmGWV--VNEjchJsUZuthMCzgMcfXQ435-Sfs9WizGdYZzXkW0AKbb11mdu2GFrz_sPS_Xg7tRdE3BFS6AD8G1S1vo7lexQqVY_rSdz844c5nlF1LWqRLHasAPetQ3FnuGO0W6Xu2MihFdRY4E9lQZDfiBQZCsqcVebZUjV2Xk5WIM8QzVeG9txnaZaBXdNthJD9-0Fi65BZ7pxeiBj_cduG-ortRW5FZCr5CCqkpcEo'
  },
  {
    id: 'cover-3',
    name: 'Workshop & Collaboration',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2JfPGX2MT2E3ylEeai5oLuJkwxmkqMqJG3FhPL0ZQ1A2FW9BkD0ctB7TyI9T2ns_dsUbSAZ75DOMtA2DxClR5vgb2PdXrzMzakrUyyC-rvSZUPYz89QXtX-QGUWvjpsqozHYKi_bmuMVdL2fR59DJ3MGocXAw8zanwRecd24pYGIFWFWao1cwI7ZxClcJWqzigvQAxR3-zmQzsdMnav4rAsFr0idFMBvSCkGBGZVW9Hazghyg1deYQzv0nVkLXnWI1Cy-uyTNxdo'
  },
  {
    id: 'cover-4',
    name: 'Technology Lab',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLyIUm-ffCTttHnuM7rD5R7cEVQwQZwSvj1Z5OAaqLt0klmRC4Pd5B7RpDg5uhfR3V5AkJhs5x_JZtkJtbKBBQ7YMzTYCFvgZ9H4nTT0dSRsyTtMY0Aps1bHurYbf6_9hjpP2_kRTdJjnowvPXIGVVCx8M4nyWg8Zqxo4qrqmJ1D-JMsX7AQvJAy3OlWlRDfIzZKZsfD0VUBrktjTpkaWlwt-MWHcU15-2BsvJoumYTTHgqWHhbdqwCRM3b0oMEMbX6iwlkVnlM74'
  }
];

export const CreateEventPage = () => {
  const navigate = useNavigate();
  const createEventMutation = useCreateEvent();

  // Form state fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [format, setFormat] = useState('In-Person');
  const [category, setCategory] = useState('Technology');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('');
  const [coverImage, setCoverImage] = useState(PRESET_COVERS[0].url);
  const [showImagePicker, setShowImagePicker] = useState(false);

  // Custom UI notification states
  const [toastMessage, setToastMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 4000);
  };

  const handleCreate = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      triggerToast('Event title is required.');
      return;
    }
    if (!description.trim()) {
      triggerToast('Event description is required.');
      return;
    }
    if (!startDate || !startTime) {
      triggerToast('Start date and time are required.');
      return;
    }
    if (!location.trim()) {
      triggerToast('Event location is required.');
      return;
    }

    setIsSubmitting(true);

    const formattedDate = new Date(startDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const displayDate = `${new Date(startDate).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    })} • ${startTime} ${endTime ? `- ${endTime}` : ''}`;

    const newEvent = {
      title,
      description,
      format,
      category,
      date: formattedDate,
      displayDate,
      time: `${startTime} ${endTime ? `- ${endTime}` : ''}`,
      location,
      capacity: capacity ? parseInt(capacity, 10) : null,
      image: coverImage,
    };

    createEventMutation.mutate(newEvent, {
      onSuccess: () => {
        triggerToast('Event successfully launched!');
        setTimeout(() => {
          navigate('/events');
        }, 1200);
      },
      onError: (err) => {
        setIsSubmitting(false);
        triggerToast(err?.message || 'Error occurred while creating event?.');
      }
    });
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-0 relative">
      {/* Atmospheric Ambient Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-container/5 blur-[120px] -z-10 rounded-full"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary-container/5 blur-[100px] -z-10 rounded-full"></div>

      {/* Header section */}
      <div className="flex items-center justify-between mb-10">
        <button
          onClick={() => navigate('/events')}
          className="flex items-center gap-2 text-text-secondary hover:text-primary-container transition-colors font-bold text-lg md:text-sm group cursor-pointer border-none bg-transparent"
        >
          <span className="material-symbols-outlined text-base transition-transform group-hover:-translate-x-1">
            arrow_back
          </span>
          Back to Events
        </button>
      </div>

      <div className="text-center mb-12">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-container/10 text-primary-container font-semibold text-lg mb-4 border border-primary-container/20">
          <span className="material-symbols-outlined text-base">celebration</span>
          CREATE NEW EVENT
        </span>
        <h2 className="font-display-lg text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">
          Share Your Event
        </h2>
        <p className="font-body-lg text-text-secondary text-lg md:text-lg max-w-2xl mx-auto leading-relaxed">
          Bring your community together for shared experiences, common causes, and revolutionary gatherings.
        </p>
      </div>

      {/* Form Container */}
      <form onSubmit={handleCreate} className="space-y-8">

        {/* Cover image upload container */}
        <section className="glass-panel rounded-3xl p-6 relative overflow-hidden crimson-gradient-glow border border-white/5">
          <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-white/10 rounded-2xl bg-surface/40 hover:bg-surface/60 transition-all group relative">
            {coverImage ? (
              <div className="w-full max-h-72 overflow-hidden rounded-xl mb-4 relative">
                <img
                  src={coverImage}
                  alt="Selected Cover Preview"
                  className="w-full h-full object-cover object-center max-h-72"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => setShowImagePicker(true)}
                    className="px-6 py-2.5 bg-primary-container text-white font-bold rounded-full hover:scale-105 active:scale-95 transition-all text-lg border-none cursor-pointer"
                  >
                    Change Cover Image
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-primary-container/10 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-primary-container text-3xl">
                    cloud_upload
                  </span>
                </div>
                <h3 className="font-bold text-white text-base md:text-lg mb-1">Event Cover Image</h3>
                <p className="text-text-secondary text-lg mb-6 text-center max-w-md px-4">
                  Select a stunning visual to attract more participants.
                </p>
                <button
                  type="button"
                  onClick={() => setShowImagePicker(true)}
                  className="px-6 py-2.5 bg-surface-container-high border border-white/10 rounded-xl font-bold text-white hover:bg-white/5 transition-all text-lg cursor-pointer"
                >
                  Choose Image
                </button>
              </>
            )}
          </div>

          {/* Preset covers picker modal */}
          {showImagePicker && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 z-20">
              <div className="max-w-xl w-full">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="font-bold text-white text-sm uppercase tracking-wider">Select Event Cover</h4>
                  <button
                    type="button"
                    onClick={() => setShowImagePicker(false)}
                    className="p-1 rounded-full hover:bg-white/10 text-text-secondary hover:text-white cursor-pointer bg-transparent border-none"
                  >
                    <span className="material-symbols-outlined text-base">close</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {PRESET_COVERS.map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => {
                        setCoverImage(preset.url);
                        setShowImagePicker(false);
                      }}
                      className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${coverImage === preset.url ? 'border-primary-container' : 'border-transparent hover:border-white/20'
                        }`}
                    >
                      <img src={preset.url} alt={preset.name} className="w-full h-24 object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 text-center">
                        <span className="text-[15px] font-bold text-white uppercase tracking-wider">{preset.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center">
                  <p className="text-[15px] text-text-secondary">Click on a preview cover image above to select it.</p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Input panels grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Basic Info Column */}
          <section className="glass-panel rounded-3xl p-6 space-y-6 border border-white/5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-primary-container/10 text-primary-container">
                <span className="material-symbols-outlined text-base">info</span>
              </div>
              <h4 className="font-bold text-white text-base md:text-lg">Basic Information</h4>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-lg font-bold text-text-secondary flex items-center gap-1">
                  Event Title <span className="text-primary-container">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-surface-container-low border border-white/5 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-secondary/20 focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 transition-all outline-none text-lg md:text-lg"
                  placeholder="Enter a compelling event title..."
                />
                <p className="text-[18px] text-text-secondary/60">Make it descriptive and engaging to attract attendees.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-lg font-bold text-text-secondary flex items-center gap-1">
                  Description <span className="text-primary-container">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="6"
                  className="w-full bg-surface-container-low border border-white/5 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-secondary/20 focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 transition-all outline-none text-lg md:text-lg resize-none"
                  placeholder="Describe your event?. What will participants experience? What is the main agenda?"
                ></textarea>
                <div className="flex justify-between items-center text-[18px] text-text-secondary/60">
                  <span>Describe the schedules, panels, and coordination rules.</span>
                  <span>{description.length}/2000</span>
                </div>
              </div>
            </div>
          </section>

          {/* Form Options Column */}
          <div className="space-y-8">

            {/* Format & Category */}
            <section className="glass-panel rounded-3xl p-6 border border-white/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-secondary-container/10 text-text-secondary-container">
                  <span className="material-symbols-outlined text-base">layers</span>
                </div>
                <h4 className="font-bold text-white text-base md:text-lg">Event Classification</h4>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-lg font-bold text-text-secondary">Event Format</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-full bg-surface-container-low border border-white/5 rounded-xl px-4 py-3 text-text-primary focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 transition-all outline-none text-lg md:text-sm cursor-pointer"
                  >
                    <option value="In-Person">In-Person</option>
                    <option value="Online">Online/Virtual</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-lg font-bold text-text-secondary">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-surface-container-low border border-white/5 rounded-xl px-4 py-3 text-text-primary focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 transition-all outline-none text-lg md:text-sm cursor-pointer"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Politics">Politics</option>
                    <option value="Education">Education</option>
                    <option value="Arts">Arts</option>
                    <option value="Climate">Climate</option>
                    <option value="Environment">Environment</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Date & Time Picker */}
            <section className="glass-panel rounded-3xl p-6 border border-white/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-primary-container/10 text-primary-container">
                  <span className="material-symbols-outlined text-base">calendar_month</span>
                </div>
                <h4 className="font-bold text-white text-base md:text-lg">Timing Schedules</h4>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-lg font-bold text-text-secondary">Start Date *</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-surface-container-low border border-white/5 rounded-xl px-4 py-3 text-text-primary focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 transition-all outline-none text-lg md:text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-lg font-bold text-text-secondary">Start Time *</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-surface-container-low border border-white/5 rounded-xl px-4 py-3 text-text-primary focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 transition-all outline-none text-lg md:text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-lg font-bold text-text-secondary">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-surface-container-low border border-white/5 rounded-xl px-4 py-3 text-text-primary focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 transition-all outline-none text-lg md:text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-lg font-bold text-text-secondary">End Time</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-surface-container-low border border-white/5 rounded-xl px-4 py-3 text-text-primary focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 transition-all outline-none text-lg md:text-sm"
                    />
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>

        {/* Location & Limit Capacity */}
        <section className="glass-panel rounded-3xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-secondary-container/10 text-text-secondary-container">
              <span className="material-symbols-outlined text-base">pin_drop</span>
            </div>
            <h4 className="font-bold text-white text-base md:text-lg">Location & Capacity</h4>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-1.5">
              <label className="text-lg font-bold text-text-secondary flex items-center gap-1">
                Venue Location *
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/40 text-base">
                  map
                </span>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-surface-container-low border border-white/5 rounded-xl pl-12 pr-4 py-3 text-text-primary placeholder:text-text-secondary/20 focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 transition-all outline-none text-lg md:text-lg"
                  placeholder="Enter venue address, online link, or hybrid details"
                />
              </div>
              <p className="text-[18px] text-text-secondary/60">Include room number, floor, or livestreaming URL details.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-lg font-bold text-text-secondary">Maximum Attendees</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/40 text-base">
                  person_add
                </span>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full bg-surface-container-low border border-white/5 rounded-xl pl-12 pr-4 py-3 text-text-primary placeholder:text-text-secondary/20 focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 transition-all outline-none text-lg md:text-lg"
                  placeholder="Leave empty for unlimited"
                />
              </div>
              <p className="text-[18px] text-text-secondary/60">Set a strict capacity limit to manage checkins.</p>
            </div>
          </div>
        </section>

        {/* Action Panel */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 border border-white/5">
          <p className="text-text-secondary text-lg text-center md:text-left leading-relaxed">
            Please ensure all fields marked with <span className="text-primary-container font-black">*</span> are filled before launching.
          </p>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button
              type="button"
              onClick={() => navigate('/events')}
              className="flex-1 md:flex-none px-8 py-3.5 rounded-xl border border-white/10 font-bold text-lg md:text-sm text-white hover:bg-white/5 transition-all cursor-pointer bg-transparent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 md:flex-none px-8 py-3.5 rounded-xl bg-primary-container text-white font-bold text-lg md:text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 border-none cursor-pointer hover:brightness-110 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
              {isSubmitting ? 'Creating event?...' : 'Create Event'}
              <span className="material-symbols-outlined text-sm">rocket_launch</span>
            </button>
          </div>
        </div>

      </form>

      {/* Custom Toast Overlay */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-surface-ink text-[#F4F4F4] border border-primary-container/30 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <span className="material-symbols-outlined text-primary-container text-sm">info</span>
          <span className="text-lg font-semibold uppercase tracking-wider">{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-16 text-center text-text-secondary/30 text-lg pb-12">
        © 2026 Kollective. Built for revolutionary community leadership. All Rights Reserved.
      </footer>
    </div>
  );
};
