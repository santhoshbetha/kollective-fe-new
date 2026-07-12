import { useState } from 'react';
import BallotBooth from './BallotBooth';
import VotingSuccess from './VotingSuccess';

const BallotContainer = ({ applicationId, authToken, handleClose }) => {
    const [isSuccess, setIsSuccess] = useState(false);
    const [successMetadata, setSuccessMetadata] = useState(null);

    if (isSuccess) {
        return (
            <VotingSuccess
                applicationId={applicationId}
                txTimestamp={successMetadata?.data?.voted_at}
                onReturn={handleClose}
            />
        );
    }

    return (
        <BallotBooth
            applicationId={applicationId}
            authToken={authToken}
            onVoteSuccess={(apiResponse) => {
                setSuccessMetadata(apiResponse);
                setIsSuccess(true);
            }}
            onCancel={handleClose}
        />
    );
};

export default BallotContainer;
