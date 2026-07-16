// src/pages/NetworkPage.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RelationshipList } from '../features/relationships/RelationshipList';

export const NetworkPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('followers'); // 'followers' | 'following' | 'requests'

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-20 w-full animate-in fade-in duration-200">

      {/* 🧭 Pivot Action Header Navigation Panel Row Layout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight">Social Network Parameters</h1>
          <p className="text-xs text-text-secondary mt-0.5">Audit connection channels and incoming citizen validations.</p>
        </div>
        <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 bg-surface-container border border-white/10 rounded-xl text-xs font-bold text-text-primary flex items-center gap-1 cursor-pointer w-fit"><span className="material-symbols-outlined text-sm">arrow_back</span>Back</button>
      </div>

      {/* 📊 Tab Switching Matrices */}
      <div className="flex bg-surface-container-lowest p-1 rounded-xl select-none">
        {['followers', 'following', 'requests'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors border border-transparent cursor-pointer ${activeTab === tab ? 'bg-surface-container-high text-text-primary border-white/5 font-black shadow-sm' : 'text-text-secondary hover:text-text-primary bg-transparent'}`}
          >
            {tab === 'requests' ? 'Pending Validation' : tab}
          </button>
        ))}
      </div>

      {/* ⚡ LOAD THE UNIFIED VIRTUALIZED GRAPH SCROLLER COMPONENT */}
      <RelationshipList accountId={id} type={activeTab} />

    </div>
  );
};
