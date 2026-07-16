// src/pages/EventsPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EventsFeed } from '../features/events/EventsFeed';

export const EventsPage = () => {
    const navigate = useNavigate();

    return (
        <div className="max-w-[1280px] mx-auto px-4 md:px-0 text-white flex flex-col gap-6">
            {/* ⚡ LOAD THE SEPARATED LOGIC CONTENT GRID FEED */}
            <EventsFeed
                navigate={navigate}
            //   searchQuery={searchQuery}
            //   locationQuery={locationQuery}
            //   formatFilter={formatFilter}
            //   categoryFilter={categoryFilter}
            //   viewMode={viewMode}
            />

        </div>
    );
};
