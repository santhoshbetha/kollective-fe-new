import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateAction } from '../features/organize/useOrganizeFeature';

export const CreateActionPage = () => {
  const navigate = useNavigate();
  const createActionMutation = useCreateAction();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    type: 'Protest',
    title: '',
    description: '',
    format: 'In-Person',
    venue: '',
    address: '',
    meetingLink: '',
    date: '',
    time: '',
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleNextStep = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Action title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Core objective is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setStep(2);
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const handleLaunch = () => {
    const newErrors = {};
    if (formData.format === 'In-Person') {
      if (!formData.venue.trim()) {
        newErrors.venue = 'Venue name is required';
      }
    } else {
      if (!formData.meetingLink.trim()) {
        newErrors.meetingLink = 'Meeting link is required';
      }
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    if (!formData.time) {
      newErrors.time = 'Start time is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Format date nicely (e.g., "Tomorrow, Oct 24 • 10:00 AM" or "OCT 24 • 10:00 AM")
    let formattedTime = 'TBD';
    if (formData.date && formData.time) {
      const dateObj = new Date(`${formData.date}T${formData.time}`);
      const options = { month: 'short', day: 'numeric' };
      const dateStr = dateObj.toLocaleDateString('en-US', options);
      const timeStr = dateObj.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      formattedTime = `${dateStr.toUpperCase()} • ${timeStr}`;
    }

    const actionLocation =
      formData.format === 'In-Person'
        ? `${formData.venue}, ${formData.address || ''}`.trim().replace(/,$/, '')
        : 'Virtual Meeting Space';

    createActionMutation.mutate({
      type: formData.type,
      title: formData.title,
      description: formData.description,
      time: formattedTime,
      location: actionLocation,
      meetingLink: formData.meetingLink,
    }, {
      onSuccess: () => {
        navigate('/organize');
      }
    });
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-0">
      {/* Navigation Breadcrumb / Back button */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate('/organize')}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-all text-sm font-semibold bg-transparent border-none cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back to Organize
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-8 flex flex-col gap-8">

          {/* Step Progress Header */}
          <div className="flex items-center gap-4 border-b border-white/5 pb-6">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step === 1
              ? 'bg-primary-container text-white crimson-glow'
              : 'bg-surface-container-highest/40 text-text-secondary'
              }`}>
              1
            </div>
            <div className="h-[2px] w-12 bg-surface-container-highest"></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step === 2
              ? 'bg-primary-container text-white crimson-glow'
              : 'bg-surface-container-highest/40 text-text-secondary'
              }`}>
              2
            </div>

            <div className="ml-auto text-right">
              <h1 className="font-headline-md text-xl md:text-2xl font-bold text-text-primary">
                Initiate New Action
              </h1>
              <p className="text-text-secondary text-sm md:text-sm mt-0.5">
                Step {step} of 2: {step === 1 ? 'Defining the Mission' : 'Location & Logistics'}
              </p>
            </div>
          </div>

          {/* Form Panel */}
          <div className="glass-panel p-6 md:p-8 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>

            {/* Step 1 Content */}
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <div>
                  <h2 className="font-headline-md text-lg md:text-xl font-bold text-primary mb-6">
                    Select Action Type
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Action Cards */}
                    {[
                      {
                        type: 'Protest',
                        icon: 'campaign',
                        desc: 'Direct mobilization in public spaces to demand systemic change.',
                      },
                      {
                        type: 'Town Hall',
                        icon: 'groups',
                        desc: 'Open forum for community discussion and direct representative engagement.',
                      },
                      {
                        type: 'Rally',
                        icon: 'diversity_3',
                        desc: 'A mass gathering to build momentum and show solidarity for a cause.',
                      },
                      {
                        type: 'Meeting',
                        icon: 'handshake',
                        desc: 'Strategic coordination or policy discussion among coalition members.',
                      },
                    ].map((item) => (
                      <label key={item.type} className="relative group cursor-pointer block">
                        <input
                          checked={formData.type === item.type}
                          onChange={() => handleInputChange('type', item.type)}
                          className="peer sr-only"
                          name="action_type"
                          type="radio"
                        />
                        <div className="p-5 rounded-xl border border-white/5 bg-surface-ink hover:bg-surface-container/55 transition-all group-hover:border-primary-container/30 peer-checked:border-primary-container peer-checked:bg-primary-container/10 h-full">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="material-symbols-outlined text-primary-container">
                              {item.icon}
                            </span>
                            <h3 className="font-bold text-text-primary text-sm md:text-base">
                              {item.type}
                            </h3>
                          </div>
                          <p className="text-sm md:text-sm text-text-secondary leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block font-bold text-sm md:text-sm text-text-secondary uppercase tracking-wider mb-2">
                      Action Title
                    </label>
                    <input
                      className={`w-full bg-surface-ink border rounded-xl px-4 py-3.5 text-text-primary focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/40 transition-all font-body-md text-sm md:text-base ${errors.title ? 'border-error' : 'border-white/10'
                        }`}
                      placeholder="e.g. Climate Justice Mobilization"
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                    />
                    {errors.title && (
                      <p className="text-error text-sm md:text-sm mt-1">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-sm md:text-sm text-text-secondary uppercase tracking-wider mb-2">
                      Core Objective
                    </label>
                    <textarea
                      className={`w-full bg-surface-ink border rounded-xl px-4 py-3.5 text-text-primary focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/40 transition-all font-body-md text-sm md:text-base ${errors.description ? 'border-error' : 'border-white/10'
                        }`}
                      placeholder="Describe the primary goal of this collective action..."
                      rows="4"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                    />
                    {errors.description && (
                      <p className="text-error text-sm md:text-sm mt-1">{errors.description}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 Content */}
            {step === 2 && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <div>
                  <h2 className="font-headline-md text-lg md:text-xl font-bold text-primary mb-6">
                    Location & Logistics
                  </h2>

                  {/* Format toggle switch */}
                  <div className="mb-6">
                    <label className="block font-bold text-sm md:text-sm text-text-secondary uppercase tracking-wider mb-3">
                      Participation Format
                    </label>
                    <div className="flex p-1 bg-surface-ink rounded-xl border border-white/10 w-fit">
                      <button
                        onClick={() => handleInputChange('format', 'In-Person')}
                        className={`px-6 py-2 rounded-lg font-bold text-sm md:text-sm transition-all cursor-pointer ${formData.format === 'In-Person'
                          ? 'bg-primary-container text-white crimson-glow'
                          : 'text-text-secondary hover:text-text-primary'
                          }`}
                      >
                        In-Person
                      </button>
                      <button
                        onClick={() => handleInputChange('format', 'Online')}
                        className={`px-6 py-2 rounded-lg font-bold text-sm md:text-sm transition-all cursor-pointer ${formData.format === 'Online'
                          ? 'bg-primary-container text-white crimson-glow'
                          : 'text-text-secondary hover:text-text-primary'
                          }`}
                      >
                        Online/Virtual
                      </button>
                    </div>
                  </div>

                  {/* Format conditional inputs */}
                  {formData.format === 'In-Person' ? (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div>
                        <label className="block font-bold text-sm md:text-sm text-text-secondary uppercase tracking-wider mb-2">
                          Venue Name
                        </label>
                        <input
                          className={`w-full bg-surface-ink border rounded-xl px-4 py-3.5 text-text-primary focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/40 transition-all font-body-md text-sm md:text-base ${errors.venue ? 'border-error' : 'border-white/10'
                            }`}
                          placeholder="e.g. City Hall Plaza"
                          type="text"
                          value={formData.venue}
                          onChange={(e) => handleInputChange('venue', e.target.value)}
                        />
                        {errors.venue && (
                          <p className="text-error text-sm md:text-sm mt-1">{errors.venue}</p>
                        )}
                      </div>
                      <div>
                        <label className="block font-bold text-sm md:text-sm text-text-secondary uppercase tracking-wider mb-2">
                          Full Address
                        </label>
                        <input
                          className="w-full bg-surface-ink border border-white/10 rounded-xl px-4 py-3.5 text-text-primary focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/40 transition-all font-body-md text-sm md:text-base"
                          placeholder="Street, City, State, ZIP"
                          type="text"
                          value={formData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div>
                        <label className="block font-bold text-sm md:text-sm text-text-secondary uppercase tracking-wider mb-2">
                          Meeting Link (Secure)
                        </label>
                        <input
                          className={`w-full bg-surface-ink border rounded-xl px-4 py-3.5 text-text-primary focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/40 transition-all font-body-md text-sm md:text-base ${errors.meetingLink ? 'border-error' : 'border-white/10'
                            }`}
                          placeholder="https://zoom.us/j/..."
                          type="url"
                          value={formData.meetingLink}
                          onChange={(e) => handleInputChange('meetingLink', e.target.value)}
                        />
                        {errors.meetingLink && (
                          <p className="text-error text-sm md:text-sm mt-1">{errors.meetingLink}</p>
                        )}
                      </div>
                      <div className="p-4 rounded-xl bg-surface-crimson-low border border-primary-container/20 flex gap-3">
                        <span className="material-symbols-outlined text-primary-container">
                          shield_person
                        </span>
                        <p className="text-sm md:text-sm text-on-primary-container leading-relaxed">
                          Links are only shared with verified Kollective members after RSVP.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Date & Time shared fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <div>
                      <label className="block font-bold text-sm md:text-sm text-text-secondary uppercase tracking-wider mb-2">
                        Date
                      </label>
                      <input
                        className={`w-full bg-surface-ink border rounded-xl px-4 py-3.5 text-text-primary focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/40 transition-all font-body-md text-sm md:text-base ${errors.date ? 'border-error' : 'border-white/10'
                          }`}
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                      />
                      {errors.date && (
                        <p className="text-error text-sm md:text-sm mt-1">{errors.date}</p>
                      )}
                    </div>
                    <div>
                      <label className="block font-bold text-sm md:text-sm text-text-secondary uppercase tracking-wider mb-2">
                        Start Time
                      </label>
                      <input
                        className={`w-full bg-surface-ink border rounded-xl px-4 py-3.5 text-text-primary focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/40 transition-all font-body-md text-sm md:text-base ${errors.time ? 'border-error' : 'border-white/10'
                          }`}
                        type="time"
                        value={formData.time}
                        onChange={(e) => handleInputChange('time', e.target.value)}
                      />
                      {errors.time && (
                        <p className="text-error text-sm md:text-sm mt-1">{errors.time}</p>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="mt-12 flex justify-between items-center border-t border-white/10 pt-8">
              {step === 2 ? (
                <button
                  onClick={handlePrevStep}
                  className="flex items-center gap-2 text-text-secondary hover:text-text-primary font-bold text-sm bg-transparent border-none cursor-pointer transition-all"
                >
                  <span className="material-symbols-outlined text-base">arrow_back</span>
                  Back
                </button>
              ) : (
                <div />
              )}

              {step === 1 ? (
                <button
                  onClick={handleNextStep}
                  className="flex items-center gap-2 bg-primary-container text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-primary-container/20 hover:scale-105 active:scale-95 transition-all text-sm md:text-sm cursor-pointer"
                >
                  Next Step
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
              ) : (
                <button
                  onClick={handleLaunch}
                  className="flex items-center gap-2 bg-secondary text-black px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-secondary/20 hover:scale-105 active:scale-95 transition-all text-sm md:text-sm cursor-pointer"
                >
                  Launch Action
                  <span className="material-symbols-outlined text-base">rocket_launch</span>
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Live Preview Sidebar */}
        <aside className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24">
          <h3 className="font-bold text-sm md:text-sm text-text-secondary uppercase tracking-widest">
            Live Preview
          </h3>

          <div className="relative overflow-hidden rounded-2xl bg-surface-ink border border-white/10 shadow-2xl transition-all hover:shadow-primary-container/10">
            <div className="h-44 relative overflow-hidden">
              <img
                alt="Action Preview"
                className="w-full h-full object-cover opacity-60 grayscale transition-all duration-500"
                src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-ink via-transparent to-transparent"></div>
              <div className="absolute top-4 left-4">
                <span className="bg-primary-container text-white text-[14px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-white/20">
                  {formData.type}
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-start mb-4 gap-4">
                <h4 className="font-headline-md text-base md:text-lg font-bold text-text-primary leading-snug break-words">
                  {formData.title.trim() || 'Untitled Action'}
                </h4>
                <div className="flex items-center gap-1 text-gold-muted flex-shrink-0">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  <span className="text-[12px] font-bold uppercase tracking-wider">Official</span>
                </div>
              </div>

              <p className="text-sm md:text-sm text-text-secondary line-clamp-3 mb-6 leading-relaxed">
                {formData.description.trim() || "Your action's core objective will appear here as you define the mission in step 1."}
              </p>

              <div className="space-y-3 pt-4 border-t border-white/5">
                <div className="flex items-center gap-3 text-text-secondary">
                  <span className="material-symbols-outlined text-lg">calendar_today</span>
                  <span className="text-sm font-semibold">
                    {formData.date && formData.time
                      ? new Date(`${formData.date}T${formData.time}`).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      }).toUpperCase()
                      : 'TBD'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-text-secondary">
                  <span className="material-symbols-outlined text-lg">location_on</span>
                  <span className="text-sm font-semibold truncate">
                    {formData.format === 'In-Person'
                      ? formData.venue.trim() || 'Location not set'
                      : 'Virtual Meeting Space'}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-surface-ink bg-surface-container-highest flex items-center justify-center text-[14px] font-bold text-white">
                    JD
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-surface-ink bg-surface-container-high flex items-center justify-center text-[14px] font-bold text-text-secondary">
                    +0
                  </div>
                </div>
                <span className="text-[14px] font-bold uppercase text-primary-container tracking-wider">
                  Initiated by Julian T.
                </span>
              </div>
            </div>

            <div className="h-1.5 w-full bg-surface-container overflow-hidden">
              <div className="h-full bg-primary-container w-1/3 animate-pulse"></div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-low border border-white/5 flex gap-3">
            <span className="material-symbols-outlined text-gold-muted text-xl flex-shrink-0">
              info
            </span>
            <p className="text-sm text-text-secondary leading-relaxed">
              <strong className="text-gold-muted block mb-0.5">Impact Estimation</strong>
              This action type typically attracts <span className="text-primary-container font-bold">200-500</span> participants within this coalition's reach.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};
