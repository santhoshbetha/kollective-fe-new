import axios from 'axios'; // Or your custom fetch API client wrapper
import { useIncidentCluster } from './IncidentClusterContext';
import { IncidentLeaseTimer } from './IncidentLeaseTimer';

export const IncidentRowItem = ({ incident, currentUserId }) => {
    const { incidents } = useIncidentCluster();
    const isLockedByMe = incident.leased_by_id === String(currentUserId);
    const isLockedBySomeoneElse = incident.leased_by_id && incident.leased_by_id !== currentUserId;

    const handleClaim = async () => {
        try {
            await axios.post(`/api/v1/admin/incidents/${incident.id}/claim`);
        } catch (err) {
            alert(err.response?.data?.error || "Failed to claim ticket.");
        }
    };

    const handleRelease = async () => {
        try {
            await axios.post(`/api/v1/admin/incidents/${incident.id}/release`);
        } catch (err) {
            alert("Failed to drop ticket lease.");
        }
    };

    return (
        <div className={`incident-row ${isLockedBySomeoneElse ? 'opacity-50' : ''}`}>
            <h4>Incident ID: {incident.id}</h4>
            <p>{incident.description}</p>

            {isLockedByMe && (
                <>
                    {/* Render visual ticking clock synchronized with your backend reaper values */}
                    <IncidentLeaseTimer
                        expiresAtUnix={incident.leased_until}
                        onTimeout={() => {
                            console.warn("Operator lease window closed out locally.");
                            // Optional: Force state refresh or update view models here
                        }}
                    />

                    <span className="text-xs text-gray-500 italic">
                        Your lease will release automatically on timeout.
                    </span>
                </>
            )}

            <div className="action-buttons">
                {/* CLAIM BUTTON */}
                {!incident.leased_by_id && (
                    <button onClick={handleClaim} className="bg-blue-500 text-white text-xs p-2">
                        Claim Ticket
                    </button>
                )}

                {/* WORK-STEALING WARNING LABELS */}
                {isLockedBySomeoneElse && (
                    <span className="text-red-500 text-xs italic">
                        Currently locked by Operator #{incident.leased_by_id}
                    </span>
                )}

                {/* RELEASE/DROP LEASE BUTTON */}
                {isLockedByMe && (
                    <div className="flex gap-2">
                        <span className="text-green-500 font-bold text-xs">You Hold the Lease</span>
                        <button onClick={handleRelease} className="bg-gray-400 text-white text-xs p-1">
                            Drop Ticket
                        </button>
                        <button className="bg-red-600 text-white text-xs p-1">
                            Resolve Infraction
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
