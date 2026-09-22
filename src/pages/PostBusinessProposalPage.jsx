import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateProposal } from '../features/businesses/useProposalsFeature';
import { useAuthStore } from '../store/auth/useAuthStore';

export const PostBusinessProposalPage = () => {
  const navigate = useNavigate();
  const createProposalMutation = useCreateProposal();
  const user = useAuthStore((state) => state.user);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Infrastructure',
    location: '',
    fundingGoal: '',
    minInvest: '',
    maxInvest: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const triggerToast = (msg, type = 'error') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim() || !formData.fundingGoal) {
      triggerToast('Please fill out the proposal title, description, and funding goal.', 'error');
      return;
    }

    setIsSubmitting(true);

    const goal = parseInt(formData.fundingGoal, 10) || 50000;
    const minInv = parseInt(formData.minInvest, 10) || 100;
    const maxInv = parseInt(formData.maxInvest, 10) || 10000;

    const proposalData = {
      name: formData.title.trim(),
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      location: formData.location || 'Local District',
      address: formData.location || 'Local District',
      fundingGoal: goal,
      money_required: goal,
      minInvest: minInv,
      minimum_amount: minInv,
      maxInvest: maxInv,
      maximum_amount: maxInv,
      funding_required: true,
      fundingCollected: 0,
      percent: 0,
      daysLeft: 45,
      participants: '0 Members',
      status: 'New',
      metadata: {
        funding_data: {
          funding_required: true,
          money_required: goal,
          fundingGoal: goal,
          minimum_amount: minInv,
          minInvest: minInv,
          maximum_amount: maxInv,
          maxInvest: maxInv,
          fundingCollected: 0,
          percent: 0,
          daysLeft: 45,
          participants: '0 Members',
          status: 'New'
        },
        location: formData.location || 'Local District',
        looking_for: ['Co-founder', 'Tech Lead', 'Operations'],
        owner_handle: user.username
      }
    };

    // Trigger proposal creation mutation
    createProposalMutation.mutate(proposalData, {
      onSuccess: () => {
        triggerToast('Community business proposal successfully published!', 'success');
        setTimeout(() => {
          setIsSubmitting(false);
          navigate('/businesses');
        }, 1200);
      },
      onError: (err) => {
        setIsSubmitting(false);
        console.error('Error posting proposal:', err);
        triggerToast(err?.message || 'Failed to post business proposal. Please check details and try again.', 'error');
      }
    });
  };

  return (
    <div className="max-w-[1280px] mx-auto relative">
      {/* Embedded Floating Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 animate-fadeIn transition-all ${toastMessage.type === 'success'
          ? 'bg-green-600 text-white border border-green-500 shadow-green-900/30'
          : 'bg-[#a10836] text-white border border-red-500 shadow-red-900/30'
          }`}>
          <span>{toastMessage.msg}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="bg-transparent border-none text-white cursor-pointer ml-2 hover:opacity-80"
          >
            <span className="material-symbols-outlined text-[14px]">close</span>
          </button>
        </div>
      )}
      {/* Breadcrumb & Navigation */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-text-secondary text-[12px] font-bold mb-4 uppercase tracking-wider">
            <span className="hover:text-primary-container cursor-pointer" onClick={() => navigate('/businesses')}>Businesses</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-primary-container">Post Proposal</span>
          </nav>
          <h1 className="font-headline-lg text-3xl font-extrabold text-text-primary tracking-tight">New Business Proposal</h1>
          <p className="text-text-secondary font-body-md text-lg max-w-2xl mt-2 leading-relaxed">
            Draft your initiative for community backing and investment. Scale solidarity networks and shared infrastructure.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/businesses')}
            className="px-6 py-3 border border-white/10 rounded-xl text-text-secondary hover:bg-surface-container-high hover:text-white transition-all font-label-md text-lgfont-bold"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-3 bg-primary-container text-white rounded-xl font-bold text-lghover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-primary-container/30 crimson-glow flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Publishing...' : 'Post Proposal'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Section */}
        <div className="lg:col-span-8">
          <div className="glass-panel rounded-2xl p-8 border border-white/5 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-lgfont-bold text-text-secondary uppercase tracking-wider block">Proposal Title *</label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full bg-surface-ink border border-white/10 rounded-xl p-4 text-text-primary focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all text-lg placeholder:text-text-secondary/30 font-body-md"
                  placeholder="e.g. District Solar Hydro-Grid"
                  type="text"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-lgfont-bold text-text-secondary uppercase tracking-wider block">Detailed Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full bg-surface-ink border border-white/10 rounded-xl p-4 text-text-primary focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all text-lg placeholder:text-text-secondary/30 font-body-md min-h-[160px] resize-none"
                  placeholder="Provide a detailed breakdown of your vision, the problem it solves, and how the community stands to gain..."
                  rows="6"
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-lgfont-bold text-text-secondary uppercase tracking-wider block">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full bg-surface-ink border border-white/10 rounded-xl p-4 text-text-primary focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all text-lg appearance-none cursor-pointer"
                  >
                    <option>Food & Beverage</option>
                    <option>Grocery Store</option>
                    <option>Healthcare</option>
                    <option>Transportation</option>
                    <option>Retail & Crafts</option>
                    <option>Fitness & Wellness</option>
                    <option>Beauty & Personal Care</option>
                    <option>Agriculture</option>
                    <option>Cleaning Services</option>
                    <option>Movers</option>
                    <option>Technology</option>
                    <option>Professional Services</option>
                    <option>Legal Services</option>
                    <option>Tax Services</option>
                    <option>Manufacturing</option>
                    <option>Construction</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-lgfont-bold text-text-secondary uppercase tracking-wider block">Target Location *</label>
                  <div className="relative">
                    <input
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full bg-surface-ink border border-white/10 rounded-xl p-4 pl-12 text-text-primary focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all text-lg placeholder:text-text-secondary/30"
                      placeholder="e.g. District 4, Haven City"
                      type="text"
                    />
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary-container text-[20px]">
                      location_on
                    </span>
                  </div>
                </div>
              </div>

              {/* Funding Goal & Investment Bounds */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h4 className="font-bold text-lg text-text-primary">Financial & Investment Structure</h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-lgfont-bold text-text-secondary uppercase tracking-wider block">Funding Goal (USD) *</label>
                    <div className="relative">
                      <input
                        name="fundingGoal"
                        value={formData.fundingGoal}
                        onChange={handleInputChange}
                        className="w-full bg-surface-ink border border-white/10 rounded-xl p-4 pl-10 text-text-primary focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all text-lg"
                        placeholder="e.g. 150000"
                        type="number"
                        required
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-bold text-lg">$</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-lgfont-bold text-text-secondary uppercase tracking-wider block">Min Backing (USD)</label>
                    <div className="relative">
                      <input
                        name="minInvest"
                        value={formData.minInvest}
                        onChange={handleInputChange}
                        className="w-full bg-surface-ink border border-white/10 rounded-xl p-4 pl-10 text-text-primary focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all text-lg"
                        placeholder="e.g. 50"
                        type="number"
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-bold text-lg">$</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-lgfont-bold text-text-secondary uppercase tracking-wider block">Max Backing (USD)</label>
                    <div className="relative">
                      <input
                        name="maxInvest"
                        value={formData.maxInvest}
                        onChange={handleInputChange}
                        className="w-full bg-surface-ink border border-white/10 rounded-xl p-4 pl-10 text-text-primary focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all text-lg"
                        placeholder="e.g. 25000"
                        type="number"
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-bold text-lg">$</span>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Context/Collaboration Information */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Visual Strategy */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 group">
            <div className="relative h-48 w-full bg-surface-container-high overflow-hidden">
              <img
                alt="Strategy Preview"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700 opacity-60"
                src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-80"></div>
            </div>
            <div className="p-6">
              <h3 className="font-headline-md text-md font-bold text-primary-container mb-2">Proposal Clarity</h3>
              <p className="font-body-md text-lg text-text-secondary leading-relaxed">
                Detail exactly how the requested capital will be utilized. Transparent budgeting and milestone planning attract the highest backer engagement.
              </p>
            </div>
          </div>

          {/* Collaboration Highlights */}
          <div className="bg-surface-crimson-low/50 border border-primary-container/20 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-container/10 blur-[40px] rounded-full"></div>
            <div className="flex items-center gap-3 mb-6 text-text-secondary">
              <span className="material-symbols-outlined">hub</span>
              <h3 className="text-[20px] font-bold uppercase tracking-wider">Collaboration Features</h3>
            </div>

            <ul className="space-y-4">
              <li className="flex gap-3 items-start">
                <span className="material-symbols-outlined text-primary-container text-[20px]">visibility</span>
                <div>
                  <p className="font-bold text-[18px] text-text-primary">Global Visibility</p>
                  <p className="text-[15px] text-text-secondary leading-normal mt-0.5">
                    Your proposal is indexed across all Kollective nodes for maximized exposure.
                  </p>
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <span className="material-symbols-outlined text-primary-container text-[20px]">groups</span>
                <div>
                  <p className="font-bold text-[18px] text-text-primary">Syndicate Matching</p>
                  <p className="text-[15px] text-text-secondary leading-normal mt-0.5">
                    Matches your proposal with active syndicates searching for matching categories.
                  </p>
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <span className="material-symbols-outlined text-primary-container text-[20px]">contract</span>
                <div>
                  <p className="font-bold text-[18px] text-text-primary">Smart Backing</p>
                  <p className="text-[15px] text-text-secondary leading-normal mt-0.5">
                    Automated mechanisms secure transparent and verifiable capital backing.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Priority Idea Suggestions Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-500/10 to-primary-container/10 border border-amber-500/30 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-[15px] uppercase tracking-wider">
              <span className="material-symbols-outlined text-base">rocket_launch</span>
              <span>Priority Anti-Monopoly Ideas</span>
            </div>
            <h4 className="font-bold text-text-primary text-[15px]">Needed Community Proposals</h4>
            <p className="text-[15px] text-text-secondary leading-relaxed">
              We strongly encourage proposals that establish people-centered alternatives to corporate giants:
            </p>
            <ul className="space-y-2 text-[15px] text-text-secondary">
              <li className="flex items-start gap-2 bg-surface-container-low p-2.5 rounded-xl border border-white/5">
                <span className="material-symbols-outlined text-primary-container text-sm shrink-0 mt-0.5">local_cafe</span>
                <div>
                  <strong className="text-text-primary block font-bold">Coffee Shops & Restaurants</strong>
                  Displace corporate chains like Starbucks, McDonald's & Wendy's with local co-ops & fair-wage diners.
                </div>
              </li>
              <li className="flex items-start gap-2 bg-surface-container-low p-2.5 rounded-xl border border-white/5">
                <span className="material-symbols-outlined text-emerald-400 text-sm shrink-0 mt-0.5">medical_services</span>
                <div>
                  <strong className="text-text-primary block font-bold">Low-Cost Medical & Clinics</strong>
                  Create people-pro, low-margin health centers & pharmacies to beat monopolies like CVS & Walgreens.
                </div>
              </li>
            </ul>
          </div>

          {/* Proposal Guidelines Checklist */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xl font-bold text-text-primary uppercase tracking-wider">Proposal Guidelines</h4>
              <span className="material-symbols-outlined text-text-secondary text-[18px]">info</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[16px] text-text-secondary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                Define target outcomes and timeline clearly.
              </div>
              <div className="flex items-center gap-2 text-[16px] text-text-secondary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                Specify transparent return mechanics.
              </div>
              <div className="flex items-center gap-2 text-[16px] text-text-secondary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                Highlight eco-social community value and people-first structure.
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
