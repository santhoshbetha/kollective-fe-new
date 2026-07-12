import { useParams, useNavigate } from 'react-router-dom';
import BallotBooth from './BallotBooth';

const ActivistJuryPortal = ({ activeApplicationId, userAuthToken, handleExit }) => {
    const { applicationId } = useParams();
    const navigate = useNavigate();

    const targetAppId = activeApplicationId || applicationId || '201';
    const token = userAuthToken || 'mock-user-jwt';
    const exitAction = handleExit || (() => navigate('/home'));

    return (
        <div className="min-h-[80vh] bg-transparent text-text-primary p-4 flex items-center justify-center">
            {/* 
                We inject the exact same BallotBooth component we verified earlier.
                The layout naturally adapts to the case evidence text and secure media urls, 
                and posts the standard {"vote": "approve"} contract string to the Elixir API.
            */}
            <div className="w-full max-w-xl border border-rose-500/20 glass-card">
                <BallotBooth
                    applicationId={targetAppId}
                    authToken={token}
                    onVoteSuccess={(resData) => {
                        console.log("Activist ballot cast verified via transaction trace:", resData);
                        exitAction();
                    }}
                    onCancel={exitAction}
                />
            </div>
        </div>
    );
};

export default ActivistJuryPortal;
