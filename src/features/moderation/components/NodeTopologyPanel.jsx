// src/features/moderation/components/NodeTopologyPanel.jsx
import React, { useState } from 'react';
import { useMeshTopology } from '../hooks/useMeshTopology';
import { Server, Activity, Globe, RefreshCw, Cpu, Wifi, AlertTriangle, Loader2, ZapOff } from 'lucide-react';
import { cn } from '../../../lib/utils';

export function NodeTopologyPanel() {
    const {
        meshData,
        isLoading,
        isRecovering,
        networkError,
        refreshTopology,
        triggerForcePartitionRecovery
    } = useMeshTopology();

    // Safety guard track state to verify the operator genuinely wants to run a network reset
    const [confirmTargetNode, setConfirmTargetNode] = useState(null);

    const handleRecoveryClick = (nodeName) => {
        if (confirmTargetNode === nodeName) {
            triggerForcePartitionRecovery(nodeName);
            setConfirmTargetNode(null);
        } else {
            setConfirmTargetNode(nodeName);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6 p-6 bg-[#141414] border border-white/5 rounded-[28px] shadow-2xl font-sans text-left text-neutral-200 select-none animate-in fade-in duration-200">

            {/* Top Toolbar Ribbon Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-primary-container/10 border border-primary-container/20 rounded-xl text-primary-container shrink-0">
                        <Activity className="w-4 h-4 stroke-[2.5px]" />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-white tracking-tight">Mesh Cluster Topology</h3>
                        <p className="text-[11px] font-medium text-neutral-400 leading-none mt-0.5">
                            Real-time tracking and healing of self-hosted server nodes running over libcluster.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    disabled={isLoading || isRecovering}
                    onClick={refreshTopology}
                    className="p-2.5 bg-[#181818] border border-white/10 text-neutral-400 hover:text-white rounded-xl transition-all cursor-pointer outline-none flex items-center justify-center disabled:opacity-40"
                >
                    <RefreshCw className={cn("w-4 h-4 stroke-[2.5px]", isLoading && "animate-spin text-primary-container")} />
                </button>
            </div>

            {/* Network Infrastructure Summary Metrics Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-[#181818] border border-white/5 rounded-2xl flex items-center gap-4">
                    <Server className="w-5 h-5 text-primary-container stroke-[2px]" />
                    <div>
                        <span className="block font-mono text-[9px] font-black uppercase text-neutral-500 tracking-wider">Active Cluster Size</span>
                        <span className="text-xl font-mono font-black text-white block mt-1">{meshData.nodes?.length || 0} Nodes</span>
                    </div>
                </div>

                <div className="p-4 bg-[#181818] border border-white/5 rounded-2xl flex items-center gap-4">
                    <Cpu className="w-5 h-5 text-emerald-400 stroke-[2px]" />
                    <div>
                        <span className="block font-mono text-[9px] font-black uppercase text-neutral-500 tracking-wider">Routing Protocol</span>
                        <span className="text-xs font-mono font-black text-neutral-200 tracking-wide block mt-1.5 truncate max-w-[180px]">
                            {meshData.network_protocol || "Erlang_Distribution"}
                        </span>
                    </div>
                </div>

                <div className="p-4 bg-[#181818] border border-white/5 rounded-2xl flex items-center gap-4">
                    <Wifi className="w-5 h-5 text-primary-container stroke-[2px]" />
                    <div>
                        <span className="block font-mono text-[9px] font-black uppercase text-neutral-500 tracking-wider">Mesh Core Status</span>
                        <span className={cn("text-xs font-mono font-black tracking-wider uppercase block mt-1.5 flex items-center gap-1.5",
                            isRecovering ? "text-amber-400 animate-pulse" : "text-emerald-400"
                        )}>
                            <span className={cn("w-2 h-2 rounded-full bg-green-500", isRecovering ? "bg-amber-400 animate-ping" : "bg-green-500")} />
                            <span>{isRecovering ? "HEALING_MESH..." : "OPERATIONAL"}</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Dynamic Real-Time Nodes Grid Panel Canvas */}
            <div className="space-y-2">
                <label className="text-[10px] font-mono font-black uppercase tracking-wider text-neutral-500 ml-1">
                    Inter-Connected Infrastructure Node Grid Mapping
                </label>

                {networkError && (
                    <div className="p-4 bg-rose-500/5 border border-rose-500/10 text-rose-400 rounded-xl flex items-center gap-3 text-xs font-medium animate-in slide-in-from-top-2">
                        <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
                        <span>{networkError}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
                    {isLoading && meshData.nodes?.length === 0 ? (
                        <div className="col-span-full py-20 text-center font-mono text-xs text-neutral-500 flex flex-col items-center justify-center gap-2 opacity-60 h-48">
                            <Loader2 className="w-4 h-4 animate-spin text-primary-container" />
                            <span>COMPILING LIVE DISTRIBUTED CLUSTER MAPS...</span>
                        </div>
                    ) : meshData.nodes?.length > 0 ? (
                        meshData.nodes.map((node, index) => {
                            const isNodePendingHeal = confirmTargetNode === node.node_name;
                            return (
                                <div
                                    key={node.node_name || `node-${index}`}
                                    className={cn(
                                        "p-4 bg-[#181818] border rounded-2xl flex flex-col justify-between gap-4 transition-all relative overflow-hidden",
                                        node.is_local ? "border-primary-container/30 ring-1 ring-primary-container/10 shadow-md" : "border-white/5"
                                    )}
                                >
                                    <div className="w-full flex items-start justify-between gap-4">
                                        <div className="min-w-0 flex items-start gap-3">
                                            <div className={cn("p-2 rounded-xl mt-0.5 shrink-0 border",
                                                node.is_local ? "bg-primary-container/10 text-primary-container border-primary-container/20" : "bg-white/5 text-neutral-400 border-white/5"
                                            )}>
                                                <Globe className="w-4 h-4 stroke-[2px]" />
                                            </div>

                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-xs font-mono font-black text-white truncate max-w-[150px] sm:max-w-xs block leading-tight">
                                                        {node.node_name}
                                                    </span>
                                                    {node.is_local && (
                                                        <span className="text-[8px] font-mono font-black text-primary-container bg-primary-container/10 border border-primary-container/20 px-1.5 py-0.2 rounded shadow-sm">
                                                            LOCAL_MASTER
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[10px] font-mono text-neutral-500 font-bold mt-1.5 uppercase tracking-wider">
                                                    Geographic Zone: <span className="text-neutral-300 font-black">{node.zone}</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 font-mono text-[9px] font-black uppercase text-emerald-400 bg-emerald-500/5 px-2 py-0.5 border border-emerald-500/10 rounded tracking-wider select-none shrink-0 shadow-sm mt-0.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                            <span>ONLINE</span>
                                        </div>
                                    </div>

                                    {/* 🛠️ FORCE PARTITION HEAL INTERACTION BAR BUTTON TIER */}
                                    <div className="w-full pt-2 border-t border-white/5 flex justify-end font-mono text-[10px] font-black uppercase tracking-wider">
                                        <button
                                            type="button"
                                            disabled={isRecovering}
                                            onClick={() => handleRecoveryClick(node.node_name)}
                                            className={cn(
                                                "px-3 py-1.5 border rounded-xl flex items-center gap-1.5 cursor-pointer outline-none transition-all active:scale-95",
                                                isNodePendingHeal
                                                    ? "bg-amber-600 border-amber-600 text-white hover:brightness-105 animate-pulse"
                                                    : "bg-transparent border-white/10 text-neutral-500 hover:text-amber-400 hover:border-amber-500/30"
                                            )}
                                        >
                                            {isNodePendingHeal ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Network className="w-4 h-4" />
                                            )}
                                            <span>{isNodePendingHeal ? "FORCING RECOVERY..." : "Initiate Emergency Re-sync"}</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        isLoading && (<div className="col-span-full py-12 text-center font-mono text-xs text-neutral-500 flex flex-col items-center justify-center gap-2 opacity-60">
                            <AlertTriangle className="w-5 h-5" />
                            <span>NO ACTIVE INFRASTRUCTURE NODES DETECTED IN LIVE CLUSTER MAP.</span>
                        </div>)
                    )}
                </div>

                {/* Recovery Confirmation Overlay Panel */}
                <ConfirmRecoveryModal
                    isOpen={!!confirmTargetNode}
                    targetNode={confirmTargetNode || ''}
                    onConfirm={handleConfirmRecovery}
                    onCancel={() => setConfirmTargetNode(null)}
                    isSubmitting={isSubmittingRecovery}
                />
            </div>
        </div>
    );
}