import type { Incident } from "../../lib/api";
import { AlertOctagon, Activity, ChevronRight } from "lucide-react";

interface Props {
    incidents: Incident[];
    selectedIncidentId: string | null;
    onIncidentSelect: (id: string) => void;
    isProcessing: boolean;
}

export function IncidentsSidebar({ incidents, selectedIncidentId, onIncidentSelect, isProcessing }: Props) {
    // Compute summary stats
    const totalArea = incidents.reduce((acc, inc) => acc + inc.area_ha, 0);
    const criticalCount = incidents.filter(i => i.severity === 'critical').length;

    return (
        <aside className="w-80 shrink-0 bg-[#060a11]/90 border-l border-border/50 flex flex-col overflow-hidden relative z-20">

            {/* Top Summary Cards */}
            <div className="p-4 border-b border-border/50 flex flex-col gap-4 bg-black/40">
                <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    <h2 className="font-mono text-xs uppercase text-primary tracking-widest">Intelligence Summary</h2>
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono">
                    <div className="border border-border/40 bg-black/40 p-3 flex flex-col gap-1">
                        <span className="text-[9px] text-muted-foreground uppercase">Impacted Area</span>
                        <span className="text-xl text-primary">{totalArea.toFixed(1)}<span className="text-xs text-muted-foreground ml-1">ha</span></span>
                    </div>
                    <div className="border border-border/40 bg-black/40 p-3 flex flex-col gap-1">
                        <span className="text-[9px] text-muted-foreground uppercase">Critical Alerts</span>
                        <span className="text-xl text-danger">{criticalCount}</span>
                    </div>
                </div>

                <div className="h-10 border border-border/40 bg-black/40 flex items-center px-3 relative overflow-hidden">
                    {/* Fake mini trend line */}
                    <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0wLDIwIEwyMCwzMCBMNDAsMTAgTDYwLDE1IEw4MCw1IEwxMDAsMjUiIHN0cm9rZT0iIzA2YjZkNCIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+')] bg-cover bg-no-repeat bg-center" />
                    <span className="text-[9px] text-primary relative z-10">7-DAY ACTIVITY TREND</span>
                </div>
            </div>

            {/* Incident Feed */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 flex flex-col gap-2">
                <div className="px-2 py-2 flex justify-between items-center text-[10px] font-mono text-muted-foreground uppercase border-b border-white/5 mx-2">
                    <span>Detected Anomalies ({incidents.length})</span>
                </div>

                {isProcessing && (
                    <div className="p-6 flex flex-col gap-4 opacity-50">
                        <div className="h-16 bg-white/5 border border-white/10 animate-pulse" />
                        <div className="h-16 bg-white/5 border border-white/10 animate-pulse delay-75" />
                        <div className="h-16 bg-white/5 border border-white/10 animate-pulse delay-150" />
                    </div>
                )}

                {!isProcessing && incidents.length === 0 && (
                    <div className="p-8 text-center text-xs font-mono text-muted-foreground uppercase tracking-widest border border-white/5 m-4 border-dashed">
                        No anomalies detected in current operating bounds.
                    </div>
                )}

                {!isProcessing && incidents.map((inc) => (
                    <button
                        key={inc.id}
                        onClick={() => onIncidentSelect(inc.id)}
                        className={`text-left border transition-all p-3 font-mono flex flex-col gap-2 group relative overflow-hidden focus:outline-none ${selectedIncidentId === inc.id
                            ? 'bg-primary/10 border-primary shadow-[inset_2px_0_0_#06b6d4]'
                            : 'bg-black/40 border-border/40 hover:border-white/20 hover:bg-white/5'
                            }`}
                    >
                        {/* Status indicator line */}
                        <div className={`absolute top-0 left-0 w-1 h-full ${inc.severity === 'critical' ? 'bg-danger' :
                            inc.severity === 'high' ? 'bg-orange-500' :
                                inc.severity === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                            }`} />

                        <div className="flex justify-between items-start ml-2">
                            <span className={`text-[10px] font-bold ${selectedIncidentId === inc.id ? 'text-primary' : 'text-white'}`}>
                                {inc.id}
                            </span>
                            <div className="flex items-center gap-1">
                                {inc.severity === 'critical' && <AlertOctagon className="h-3 w-3 text-danger" />}
                                <span className={`text-[9px] uppercase tracking-wider px-1 border ${inc.severity === 'critical' ? 'text-danger border-danger/30 bg-danger/10' :
                                    inc.severity === 'high' ? 'text-orange-500 border-orange-500/30 bg-orange-500/10' :
                                        'text-amber-500 border-amber-500/30 bg-amber-500/10'
                                    }`}>
                                    {inc.severity}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px] ml-2 text-muted-foreground">
                            <div className="flex flex-col">
                                <span>AREA [HA]</span>
                                <strong className="text-white font-normal">{inc.area_ha.toFixed(2)}</strong>
                            </div>
                            <div className="flex flex-col">
                                <span>CONFIDENCE</span>
                                <strong className="text-white font-normal">{(inc.confidence * 100).toFixed(0)}%</strong>
                            </div>
                        </div>

                        <ChevronRight className={`absolute bottom-3 right-3 h-4 w-4 transition-transform ${selectedIncidentId === inc.id ? 'text-primary translate-x-1' : 'text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1'}`} />
                    </button>
                ))}
            </div>

        </aside>
    );
}
