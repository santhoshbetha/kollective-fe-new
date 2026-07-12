import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreatePoll } from '../features/polls/useCreatePoll';

export const CreatePollPage = () => {
  const navigate = useNavigate();
  const createPollMutation = useCreatePoll();

  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']); // Initial 2 choices
  const [category, setCategory] = useState('Community Infrastructure');
  const [duration, setDuration] = useState('7 Days');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxOptions = 6;

  const handleAddOption = () => {
    if (options.length < maxOptions) {
      setOptions((prev) => [...prev, '']);
    } else {
      alert('Maximum of 6 options reached.');
    }
  };

  const handleRemoveOption = (indexToRemove) => {
    if (options.length > 2) {
      setOptions((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    }
  };

  const handleOptionChange = (index, value) => {
    setOptions((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!question.trim()) {
      alert('Please enter a poll question.');
      return;
    }

    const filteredOptions = options.map((opt) => opt.trim()).filter(Boolean);
    if (filteredOptions.length < 2) {
      alert('Please fill out at least two options.');
      return;
    }

    setIsSubmitting(true);

    const pollData = {
      question: question.trim(),
      options: filteredOptions,
      category: category,
      timeLeft: `${duration} left`,
    };

    createPollMutation.mutateAsync(pollData, {
      onSuccess: () => {
        setIsSubmitting(false);
        navigate('/polls');
      },
      onError: (err) => {
        setIsSubmitting(false);
        console.error('Error creating poll:', err);
        alert('Failed to create the poll. Please try again.');
      }
    });
  };

  return (
    <div className="max-w-[800px] mx-auto pb-20">
      {/* Back Link */}
      <button
        onClick={() => navigate('/polls')}
        className="flex items-center gap-2 text-text-secondary hover:text-primary-container transition-colors mb-8 group w-fit bg-transparent border-none outline-none font-bold text-sm"
      >
        <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-1">
          arrow_back
        </span>
        Back to Polls
      </button>

      {/* Header Section */}
      <header className="glass-panel p-8 rounded-2xl mb-8 relative overflow-hidden border border-white/5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-container/10 to-transparent blur-3xl -z-10"></div>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-primary-container/20 rounded-lg flex items-center justify-center border border-primary-container/30">
            <span className="material-symbols-outlined text-primary-container text-3xl">poll</span>
          </div>
          <h1 className="font-headline-lg text-2xl font-extrabold text-text-primary tracking-tight">Create a New Poll</h1>
        </div>
        <p className="font-body-md text-lg text-text-secondary leading-relaxed max-w-2xl">
          Engage the collective voice to drive democratic decision making within your local community and organizing committees.
        </p>
      </header>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section: Question */}
        <section className="glass-panel p-8 rounded-2xl border border-white/5 relative">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-primary-container">quiz</span>
            <h2 className="font-headline-md text-lg font-bold text-text-primary">Poll Question</h2>
          </div>
          <div className="space-y-4">
            <label className="text-sm font-bold text-text-secondary uppercase tracking-wider block">Question *</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full bg-surface-ink border border-white/10 rounded-xl p-4 font-body-md text-sm text-text-primary min-h-[100px] resize-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all placeholder:text-text-secondary/30"
              placeholder="What would you like to ask the collective?"
              required
            ></textarea>
            <p className="text-md text-text-secondary/70 italic leading-snug">
              Be clear and specific to get the most accurate consensus from members.
            </p>
          </div>
        </section>

        {/* Section: Options */}
        <section className="glass-panel p-8 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-primary-container">list_alt</span>
            <h2 className="font-headline-md text-lg font-bold text-text-primary">Poll Options</h2>
          </div>

          <div className="space-y-4">
            {options.map((option, idx) => (
              <div key={idx} className="space-y-2">
                <label className="text-sm font-bold text-text-secondary uppercase tracking-wider block">
                  Option {idx + 1} {idx < 2 ? '*' : ''}
                </label>
                <div className="flex gap-3">
                  <input
                    value={option}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    className="flex-1 bg-surface-ink border border-white/10 rounded-xl px-4 py-3 font-body-md text-sm text-text-primary focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all placeholder:text-text-secondary/35"
                    placeholder={`Enter choice ${idx + 1}...`}
                    type="text"
                    required={idx < 2}
                  />
                  {idx >= 2 && (
                    <button
                      onClick={() => handleRemoveOption(idx)}
                      type="button"
                      className="px-3 text-text-secondary hover:text-primary-container transition-colors flex items-center justify-center bg-transparent border-none cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleAddOption}
            type="button"
            className="mt-6 flex items-center gap-2 text-primary-container font-bold text-sm hover:bg-primary-container/10 px-4 py-2 rounded-lg border border-primary-container/20 transition-all active:scale-95 bg-transparent"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            Add Option
          </button>

          <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
            <p className="text-md text-text-secondary/80">Minimum 2 options, maximum 6 options</p>
            <span className="text-md font-bold text-primary-container">
              {options.length}/{maxOptions} options
            </span>
          </div>
        </section>

        {/* Section: Settings */}
        <section className="glass-panel p-8 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-primary-container">settings_applications</span>
            <h2 className="font-headline-md text-lg font-bold text-text-primary">Poll Settings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-bold text-text-secondary uppercase tracking-wider block">
                <span className="material-symbols-outlined text-[16px]">schedule</span>
                Poll Duration *
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-surface-ink border border-white/10 rounded-xl px-4 py-3 font-body-md text-sm text-text-primary focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all appearance-none cursor-pointer"
              >
                <option>24 Hours</option>
                <option>3 Days</option>
                <option>7 Days</option>
                <option>2 Weeks</option>
              </select>
              <p className="text-md text-text-secondary/60">How long should the collection of votes remain active?</p>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-bold text-text-secondary uppercase tracking-wider block">
                <span className="material-symbols-outlined text-[16px]">category</span>
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-surface-ink border border-white/10 rounded-xl px-4 py-3 font-body-md text-sm text-text-primary focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all appearance-none cursor-pointer"
              >
                <option>Labor Rights</option>
                <option>Community Infrastructure</option>
                <option>Resource Allocation</option>
                <option>Policy Amendment</option>
                <option>Event Planning</option>
                <option>Technology</option>
                <option>Business</option>
                <option>Science</option>
              </select>
              <p className="text-md text-text-secondary/60 font-medium">Categorization routes this poll to relevant committee feeds.</p>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <footer className="flex flex-col sm:flex-row items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-12 py-4 bg-primary-container text-white rounded-xl font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-primary-container/20 crimson-glow flex items-center justify-center gap-2.5 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">how_to_vote</span>
            {isSubmitting ? 'Creating...' : 'Create Poll'}
          </button>
          <button
            onClick={() => navigate('/polls')}
            type="button"
            className="w-full sm:w-auto px-12 py-4 bg-transparent border border-white/10 hover:bg-surface-container text-text-secondary hover:text-white rounded-xl font-bold text-sm transition-all active:scale-95"
          >
            Cancel
          </button>
        </footer>
      </form>
    </div>
  );
};
