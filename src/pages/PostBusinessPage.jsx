import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateBusiness } from '../features/businesses/useBusinessesFeature';

export const PostBusinessPage = () => {
  const navigate = useNavigate();
  const createBusinessMutation = useCreateBusiness();

  const [formData, setFormData] = useState({
    name: '',
    category: 'Manufacturing',
    legalStructure: 'Cooperative (Recommended)',
    description: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    email: '',
    phone: '',
    website: '',
    established: new Date().getFullYear().toString(),
    employees: '1-5',
    hours: '9:00 AM - 5:00 PM',
    image: 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=600&q=80',
  });

  const [selectedTags, setSelectedTags] = useState(['Unionized Shop']);
  const [availableTags, setAvailableTags] = useState(['Local Sourcing', 'Eco-Friendly', 'Community Funded']);
  const [customTag, setCustomTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleTag = (tag, isSelected) => {
    if (isSelected) {
      setSelectedTags((prev) => prev.filter((t) => t !== tag));
      setAvailableTags((prev) => [...prev, tag]);
    } else {
      setAvailableTags((prev) => prev.filter((t) => t !== tag));
      setSelectedTags((prev) => [...prev, tag]);
    }
  };

  const handleAddCustomTag = (e) => {
    e.preventDefault();
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags((prev) => [...prev, customTag.trim()]);
      setCustomTag('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.description) {
      alert('Please fill out the business name and description.');
      return;
    }

    setIsSubmitting(true);

    // Formatting business details for the database model
    const businessData = {
      name: formData.name,
      category: formData.category,
      legalStructure: formData.legalStructure,
      description: formData.description,
      address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zip}`,
      city: formData.city,
      state: formData.state,
      zip: formData.zip,
      email: formData.email,
      phone: formData.phone,
      website: formData.website || 'kollective.social',
      established: parseInt(formData.established, 10) || new Date().getFullYear(),
      employees: formData.employees,
      hours: formData.hours,
      image: formData.image,
      services: selectedTags,
      owner: 'julian_thorne',
      ownerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDkj_L45i8SmnUNelsTSM7xt_t_GV39eYINp6PEQVVLlXUxSvJaNjQYzESvNDMuqrIwONlm6hWBLqOoS8riEyh-1rKUOHRC9C0nsco1tez2QwPMohMyfQvIRlEG3LSpzE_csuDr2MokaO0fyDbrBtLG8zyRK0UE4YoMGHfKU7mmL9pHuChnByhBWfv5g3nPIU3ijvm7g9FXRvV2fzc5TP7CmY_3iFzk73u23dxjIYRKOVsoB-DnXNeLelemr06EtW5rrGyER3EA6c',
      rating: 5.0,
      reviewsCount: 0,
      verified: false,
      open: true,
    };

    createBusinessMutation.mutate(businessData, {
      onSuccess: () => {
        setIsSubmitting(false);
        navigate('/businesses');
      },
      onError: (err) => {
        setIsSubmitting(false);
        console.error('Error listing business:', err);
        alert('Failed to register business. Please try again.');
      }
    });
  };

  return (
    <div className="max-w-[1280px] mx-auto">
      {/* Breadcrumb & Navigation */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-text-secondary text-[12px] font-bold mb-4 uppercase tracking-wider">
            <span className="hover:text-primary-container cursor-pointer" onClick={() => navigate('/businesses')}>Businesses</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-primary-container">Post Business</span>
          </nav>
          <h1 className="font-headline-lg text-3xl font-extrabold text-text-primary tracking-tight">List Your Enterprise</h1>
          <p className="text-text-secondary font-body-md text-lg max-w-2xl mt-2 leading-relaxed">
            Scale the collective economy by sharing your local business with the Kollective community. Let's build resilience together.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/businesses')}
            className="px-6 py-3 border border-white/10 rounded-xl text-text-secondary hover:bg-surface-container-high hover:text-white transition-all font-label-md text-lg font-bold"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-3 bg-primary-container text-white rounded-xl font-bold text-lg hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-primary-container/30 crimson-glow flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Publishing...' : 'Publish Listing'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Sections */}
        <div className="lg:col-span-8 space-y-8">
          {/* Section: Basic Information */}
          <section className="glass-panel p-8 rounded-2xl border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-primary-container">info</span>
              <h3 className="font-headline-md text-xl font-bold text-text-primary">Basic Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-lg font-bold text-text-secondary uppercase tracking-wider block">Business Name *</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-surface-ink border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all text-lg placeholder:text-text-secondary/30"
                  placeholder="e.g. Iron & Grain Cooperative"
                  type="text"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-lg font-bold text-text-secondary uppercase tracking-wider block">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full bg-surface-ink border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all text-lg appearance-none cursor-pointer"
                >
                  <option>Food & Beverage</option>
                  <option>Grocery Store</option>
                  <option>Health & Wellness</option>
                  <option>Services</option>
                  <option>Tax Services</option>
                  <option>Movers</option>
                  <option>Transportation</option>
                  <option>Manufacturing</option>
                  <option>Retail & Crafts</option>
                  <option>Agriculture</option>
                  <option>Technology</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-lg font-bold text-text-secondary uppercase tracking-wider block">Legal Structure *</label>
                <select
                  name="legalStructure"
                  value={formData.legalStructure}
                  onChange={handleInputChange}
                  className="w-full bg-surface-ink border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all text-lg appearance-none cursor-pointer"
                >
                  <option>Cooperative (Recommended)</option>
                  <option>LLC</option>
                  <option>Non-Profit</option>
                  <option>Sole Proprietorship</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-lg font-bold text-text-secondary uppercase tracking-wider block">Business Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full bg-surface-ink border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all text-lg placeholder:text-text-secondary/30 min-h-[120px] resize-none"
                  placeholder="Tell the community about your mission, values, and what makes your business unique..."
                  rows="4"
                  required
                ></textarea>
              </div>
            </div>
          </section>

          {/* Section: Contact & Location */}
          <section className="glass-panel p-8 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-primary-container">location_on</span>
              <h3 className="font-headline-md text-xl font-bold text-text-primary">Contact & Location</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="md:col-span-2 lg:col-span-3 space-y-2">
                <label className="text-lg font-bold text-text-secondary uppercase tracking-wider block">Street Address</label>
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full bg-surface-ink border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all text-lg placeholder:text-text-secondary/30"
                  placeholder="e.g. 542 Syndicate Blvd"
                  type="text"
                />
              </div>

              <div className="space-y-2">
                <label className="text-lg font-bold text-text-secondary uppercase tracking-wider block">City</label>
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full bg-surface-ink border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all text-lg placeholder:text-text-secondary/30"
                  placeholder="New Haven"
                  type="text"
                />
              </div>

              <div className="space-y-2">
                <label className="text-lg font-bold text-text-secondary uppercase tracking-wider block">State/Province</label>
                <input
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full bg-surface-ink border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all text-lg placeholder:text-text-secondary/30"
                  placeholder="Connecticut"
                  type="text"
                />
              </div>

              <div className="space-y-2">
                <label className="text-lg font-bold text-text-secondary uppercase tracking-wider block">Postal Code</label>
                <input
                  name="zip"
                  value={formData.zip}
                  onChange={handleInputChange}
                  className="w-full bg-surface-ink border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all text-lg placeholder:text-text-secondary/30"
                  placeholder="06511"
                  type="text"
                />
              </div>

              <div className="space-y-2">
                <label className="text-lg font-bold text-text-secondary uppercase tracking-wider block">Business Email</label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-surface-ink border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all text-lg placeholder:text-text-secondary/30"
                  placeholder="contact@enterprise.coop"
                  type="email"
                />
              </div>

              <div className="space-y-2">
                <label className="text-lg font-bold text-text-secondary uppercase tracking-wider block">Phone Number</label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-surface-ink border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all text-lg placeholder:text-text-secondary/30"
                  placeholder="+1 (555) 000-0000"
                  type="tel"
                />
              </div>

              <div className="space-y-2">
                <label className="text-lg font-bold text-text-secondary uppercase tracking-wider block">Website</label>
                <input
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full bg-surface-ink border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all text-lg placeholder:text-text-secondary/30"
                  placeholder="https://enterprise.coop"
                  type="url"
                />
              </div>
            </div>
          </section>

          {/* Section: Additional Details */}
          <section className="glass-panel p-8 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-primary-container">add_chart</span>
              <h3 className="font-headline-md text-xl font-bold text-text-primary">Additional Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-lg font-bold text-text-secondary uppercase tracking-wider block">Year Established</label>
                <input
                  name="established"
                  value={formData.established}
                  onChange={handleInputChange}
                  className="w-full bg-surface-ink border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all text-lg placeholder:text-text-secondary/30"
                  placeholder="2026"
                  type="number"
                />
              </div>

              <div className="space-y-2">
                <label className="text-lg font-bold text-text-secondary uppercase tracking-wider block">Number of Employees</label>
                <select
                  name="employees"
                  value={formData.employees}
                  onChange={handleInputChange}
                  className="w-full bg-surface-ink border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all text-lg appearance-none cursor-pointer"
                >
                  <option>1-5</option>
                  <option>6-20</option>
                  <option>21-50</option>
                  <option>50+</option>
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-lg font-bold text-text-secondary uppercase tracking-wider block">Business Hours</label>
                <input
                  name="hours"
                  value={formData.hours}
                  onChange={handleInputChange}
                  className="w-full bg-surface-ink border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all text-lg placeholder:text-text-secondary/30"
                  placeholder="e.g. 9:00 AM - 5:00 PM"
                  type="text"
                />
              </div>

              <div className="md:col-span-2 space-y-4">
                <label className="text-lg font-bold text-text-secondary uppercase tracking-wider block">Services & Offerings (Tags)</label>

                {/* Active Tags */}
                <div className="flex flex-wrap gap-2.5 mb-2">
                  {selectedTags.map((tag) => (
                    <div
                      key={tag}
                      onClick={() => toggleTag(tag, true)}
                      className="px-4 py-2 bg-primary-container text-white rounded-full flex items-center gap-2 text-lg cursor-pointer hover:bg-primary-container/90 active:scale-95 transition-all font-bold shadow-md shadow-primary-container/10"
                    >
                      <span>{tag}</span>
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </div>
                  ))}
                </div>

                {/* Available Suggestions */}
                <div className="flex flex-wrap gap-2.5">
                  {availableTags.map((tag) => (
                    <div
                      key={tag}
                      onClick={() => toggleTag(tag, false)}
                      className="px-4 py-2 bg-surface-container-high border border-white/5 rounded-full flex items-center gap-2 text-lg cursor-pointer hover:border-primary-container/30 text-text-secondary hover:text-white transition-all"
                    >
                      <span>{tag}</span>
                      <span className="material-symbols-outlined text-[14px]">add</span>
                    </div>
                  ))}
                </div>

                {/* Custom Add tag */}
                <div className="flex gap-2 max-w-sm">
                  <input
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    placeholder="Enter custom service..."
                    className="flex-1 bg-surface-ink border border-white/10 rounded-xl px-4 py-2 text-text-primary text-lg focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                    type="text"
                  />
                  <button
                    onClick={handleAddCustomTag}
                    className="px-4 py-2 bg-surface-container-highest border border-white/10 rounded-xl text-lg text-text-primary hover:text-primary-container font-bold"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Preview & Image */}
        <div className="lg:col-span-4 space-y-8">
          {/* Section: Image URL */}
          <section className="glass-panel p-8 rounded-2xl border border-white/5 text-center">
            <h3 className="font-headline-md text-lg font-bold text-text-primary mb-6 text-left">Business Profile Image</h3>

            <div className="group relative aspect-video w-full rounded-2xl bg-surface-container overflow-hidden border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-3">
              {formData.image ? (
                <img
                  alt="Business Hero"
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-75 transition-opacity"
                  src={formData.image}
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary-container/20 flex items-center justify-center text-primary-container mb-2">
                  <span className="material-symbols-outlined text-3xl">storefront</span>
                </div>
              )}
              <div className="relative z-10 flex flex-col items-center p-4">
                <span className="material-symbols-outlined text-3xl text-white mb-2">image</span>
                <p className="text-lg font-bold text-white">Profile Image Preview</p>
              </div>
            </div>

            <div className="mt-4 text-left space-y-2">
              <label className="text-[14px] font-bold text-text-secondary uppercase tracking-wider block">Image URL</label>
              <input
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                className="w-full bg-surface-ink border border-white/10 rounded-xl px-4 py-2.5 text-text-primary text-lg focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                placeholder="Enter image URL..."
                type="text"
              />
            </div>
          </section>

          {/* Live Preview Card */}
          <section className="bg-surface-crimson-low/40 p-8 rounded-2xl border border-primary-container/20">
            <div className="flex items-center gap-2 text-primary-container font-bold text-lg mb-6 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
              Live Preview Status
            </div>

            <div className="space-y-4">
              <h4 className="font-headline-md text-lg font-bold text-text-primary truncate">
                {formData.name || 'Your Enterprise Name'}
              </h4>
              <p className="text-lg text-text-secondary leading-relaxed line-clamp-4">
                {formData.description || 'Provide a description on the left to see it updated here in real time...'}
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <div>
                  <p className="text-[14px] uppercase font-bold tracking-wider text-text-secondary opacity-60">Category</p>
                  <p className="text-text-primary font-bold text-lg">{formData.category}</p>
                </div>
                <div>
                  <p className="text-[14px] uppercase font-bold tracking-wider text-text-secondary opacity-60">Location</p>
                  <p className="text-text-primary font-bold text-lg truncate">
                    {formData.city || 'City'}{formData.state ? `, ${formData.state}` : ''}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-text-secondary text-[18px] mt-8 italic leading-snug">
              This is how your enterprise card will appear to other users searching the local business registry.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
