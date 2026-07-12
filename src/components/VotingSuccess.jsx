const VotingSuccess = ({ applicationId, txTimestamp, onReturn }) => {
    // Format the real-time server timestamp nicely
    const formattedDate = txTimestamp
        ? new Date(txTimestamp).toUTCString()
        : new Date().toUTCString();

    return (
        <div className="flex p-4 items-center justify-center min-h-[70vh] font-mono text-text-primary">
            <div className="border border-white/10 bg-surface-container p-10 max-w-[550px] w-full text-center glass-card">
                {/* Success Visual Indicator */}
                <div className="w-16 h-16 rounded-full border-2 border-rose-500 text-rose-500 text-3xl flex items-center justify-center mx-auto mb-6 bg-rose-500/10">
                    ✊
                </div>

                <div className="text-text-secondary/70 text-[10px] font-bold tracking-wider mb-1 uppercase">TRANSMISSION COMPLETE</div>
                <h1 className="text-3xl font-black mb-6 uppercase tracking-tight text-text-primary">BALLOT DEPOSITED</h1>

                {/* Confirmation Message */}
                <div className="text-left border-l-4 border-teal-500 pl-4 mb-8">
                    <p className="text-sm text-text-secondary leading-relaxed mb-3 font-sans">
                        Thank you. Your action has been recorded.
                    </p>
                    <p className="text-sm text-text-secondary leading-relaxed font-sans">
                        Please refer to the official platform guidelines for details on the verification process.
                    </p>
                </div>

                {/* Audit Trail */}
                <div className="bg-surface-container-low border border-dashed border-white/10 p-4 text-left mb-8">
                    <div className="text-[10px] text-text-secondary/80 tracking-wider mb-3 font-bold uppercase">RECEIPT MANIFEST:</div>
                    <div className="flex justify-between text-xs mb-2 border-b border-white/5 pb-1">
                        <span className="text-text-secondary">CASE FILE:</span>
                        <span className="text-text-primary font-bold">#{applicationId}</span>
                    </div>
                    <div className="flex justify-between text-xs mb-2 border-b border-white/5 pb-1">
                        <span className="text-text-secondary">TIMESTAMP:</span>
                        <span className="text-text-primary font-bold">{formattedDate}</span>
                    </div>
                    <div className="flex justify-between text-xs mb-2 border-b border-white/5 pb-1">
                        <span className="text-text-secondary">NETWORK:</span>
                        <span className="text-text-primary font-bold">PLATFORM NETWORK</span>
                    </div>
                    <div className="flex justify-between text-xs pb-1">
                        <span className="text-text-secondary">STATUS:</span>
                        <span className="text-teal-500 dark:text-teal-400 font-bold">RECORDED</span>
                    </div>
                </div>

                {/* Primary Action */}
                <button 
                    className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-6 py-4 font-mono text-sm tracking-wider uppercase w-full cursor-pointer transition-colors" 
                    onClick={onReturn}
                >
                    RETURN TO DASHBOARD
                </button>
            </div>
        </div>
    );
};

export default VotingSuccess;
