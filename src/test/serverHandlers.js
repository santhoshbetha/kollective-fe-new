// src/test/serverHandlers.js
import { http, HttpResponse } from 'msw';

export const handlers = [
    // 📡 Intercept the authenticated follow relationship endpoint
    http.post('/api/v1/accounts/:id/follow', ({ params }) => {
        const { id } = params;

        // Symmetrically mock the returned Elixir account schema response
        return HttpResponse.json({
            id: id,
            username: "target_user",
            name: "Target User",
            following: true, // The backend confirms the follow relationship status
            followersCount: 151 // Incremented on server disk
        }, { status: 200 });
    })
];
