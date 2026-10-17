import React, { useState } from 'react';
import axios from 'axios';

export const ActiveIncidentWorkspace = ({ incidentId }) => {
    const [resolutionNotes, setResolutionNotes] = useState("");
    const [lastExtendedAt, setLastExtendedAt] = useState(0);

    const handleOperatorActivity = async () => {
        const now = Date.now();

        // Throttle guard: Only allow a lease renewal ping once every 30 seconds 
        // no matter how rapidly the operator is typing in the workspace box.
        if (now - lastExtendedAt > 30000) {
            setLastExtendedAt(now);
            try {
                console.log("⚡ [WORKSPACE HEARTBEAT]: Extending lease window on backend...");
                await axios.post(`/api/v1/admin/incidents/${incidentId}/extend`);
            } catch (err) {
                if (err.response?.status === 412) {
                    alert("⚠️ Alert: You have been inactive for too long and lost this ticket!");
                    // Route operator away or lock workspace window here
                }
            }
        }
    };

    const handleTextareaChange = (e) => {
        setResolutionNotes(e.target.value);

        // 🎯 Fire activity check on every keystroke
        handleOperatorActivity();
    };

    return (
        <div className="p-4 bg-white shadow rounded border border-gray-100">
            <h3 className="text-sm font-bold text-gray-800 mb-2">Resolution Console</h3>
            <label className="block text-xs text-gray-500 mb-1">
                Type notes here to actively keep your ticket lease alive automatically:
            </label>

            <textarea
                value={resolutionNotes}
                onChange={handleTextareaChange}
                rows={5}
                className="w-full p-2 text-sm border rounded font-sans focus:outline-blue-500"
                placeholder="Document infraction notes or resolution logic here..."
            />

            <div className="mt-3 flex justify-end">
                <button className="bg-red-600 text-white text-xs px-3 py-1.5 font-medium rounded shadow-sm hover:bg-red-700">
                    Apply Global Ban Matrix
                </button>
            </div>
        </div>
    );
};
