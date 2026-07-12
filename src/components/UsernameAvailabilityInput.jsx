// UsernameAvailabilityInput.jsx
import React, { useState, useEffect, useCallback } from 'react';

const UsernameAvailabilityInput = ({ onValidated }) => {
    const [username, setUsername] = useState("");
    const [status, setStatus] = useState("idle"); // "idle", "checking", "available", "taken", "invalid"

    // ─── DEBOUNCING LIFECYCLE ENGINE ───
    useEffect(() => {
        if (username.trim().length < 2) {
            setStatus("idle");
            return;
        }

        setStatus("checking");

        // Clear previous execution timers to establish the sliding input window
        const delayDebounceFn = setTimeout(() => {
            fetch(`/api/v1/auth/check-username?username=${encodeURIComponent(username)}`)
                .then(res => res.json())
                .then(json => {
                    if (json.status === "success") {
                        if (json.available) {
                            setStatus("available");
                            onValidated(json.username); // Pass clean text back up to parent form schema
                        } else {
                            setStatus("taken");
                            onValidated(null);
                        }
                    } else {
                        setStatus("invalid");
                        onValidated(null);
                    }
                })
                .catch(() => setStatus("idle"));
        }, 250); // Fires request only when user stops typing for 250ms

        return () => clearTimeout(delayDebounceFn);
    }, [username, onValidated]);

    return (
        <div className="form-group mb-4 relative">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-2">Create Your Handle</label>
            <div className="flex items-center relative">
                <span className="absolute left-3 text-zinc-600 font-bold text-sm">@</span>
                <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))} // Immediate client sanitization
                    placeholder="username"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-8 pr-12 text-sm text-zinc-100 focus:outline-none focus:border-indigo-600 font-medium tracking-wide transition-all"
                />

                {/* Real-Time UI Indicator Layout Feedback */}
                <div className="absolute right-4 text-sm font-bold">
                    {status === "checking" && <span className="text-zinc-500 animate-pulse">...</span>}
                    {status === "available" && <span className="text-emerald-500">✨ Ready</span>}
                    {status === "taken" && <span className="text-rose-500">🔒 Taken</span>}
                </div>
            </div>
        </div>
    );
};

export default UsernameAvailabilityInput;
