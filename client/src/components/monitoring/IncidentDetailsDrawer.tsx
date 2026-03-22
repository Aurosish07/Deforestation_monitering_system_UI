import { X, CheckCircle, XCircle, AlertTriangle, Image as ImageIcon } from "lucide-react";
import type { Incident } from "../../lib/api";

interface Props {
    incident: Incident | null;
    onClose: () => void;
}

export function IncidentDetailsDrawer({ incident, onClose }: Props) {
    if (!incident) return null;

    return (
        <div className="absolute top-0 right-0 h-full w-[400px] bg-[#060a11]/95 backdrop-blur-xl border-l border-border/50 z-[500] shadow-[-10px_0_30px_rgba(0,0,0,0.8)] flex flex-col transform transition-transform animate-in slide-in-from-right-8 duration-300">

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50 bg-black/40">
                <div className="flex items-center gap-3">
                    <h2 className="font-mono text-sm uppercase text-primary tracking-widest font-bold">ANOMALY {incident.id}</h2>
                    <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 border ${incident.severity === 'critical' ? 'text-danger border-danger/30 bg-danger/10' :
                        incident.severity === 'high' ? 'text-orange-500 border-orange-500/30 bg-orange-500/10' :
                            'text-amber-500 border-amber-500/30 bg-amber-500/10'
                        }`}>
                        {incident.severity}
                    </span>
                </div>
                <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors">
                    <X className="h-5 w-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 custom-scrollbar">

                {/* Metrics Matrix */}
                <div className="grid grid-cols-2 gap-px bg-border/50 border border-border/50">
                    <div className="bg-black/60 p-3 flex flex-col gap-1">
                        <span className="font-mono text-[9px] text-muted-foreground tracking-widest uppercase">Target Area</span>
                        <span className="font-mono text-lg text-white">{incident.area_ha.toFixed(2)}<span className="text-[10px] text-muted-foreground ml-1">ha</span></span>
                    </div>
                    <div className="bg-black/60 p-3 flex flex-col gap-1">
                        <span className="font-mono text-[9px] text-muted-foreground tracking-widest uppercase">Confidence</span>
                        <span className="font-mono text-lg text-primary">{(incident.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <div className="bg-black/60 p-3 flex flex-col gap-1">
                        <span className="font-mono text-[9px] text-muted-foreground tracking-widest uppercase">Ref Date (T0)</span>
                        <span className="font-mono text-xs text-white mt-1">{incident.date_t0}</span>
                    </div>
                    <div className="bg-black/60 p-3 flex flex-col gap-1">
                        <span className="font-mono text-[9px] text-muted-foreground tracking-widest uppercase">Tgt Date (T1)</span>
                        <span className="font-mono text-xs text-danger mt-1">{incident.date_t1}</span>
                    </div>
                </div>

                {/* Imagery Preview */}
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center border-b border-border/50 pb-2">
                        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                            <ImageIcon className="h-3 w-3" /> Satellite Proofs (Optical)
                        </span>
                    </div>

                    <div className="flex flex-col gap-4 mt-2">
                        <div className="relative border border-border/50 overflow-hidden group">
                            <span className="absolute top-2 left-2 z-10 bg-black/80 px-2 py-1 font-mono text-[9px] text-white border border-white/10 uppercase tracking-widest">T0 (REFERENCE)</span>
                            {incident.before_image_url ? (
                                <img src={incident.before_image_url} alt="Before" className="w-full h-40 object-cover opacity-80 group-hover:opacity-100 transition-opacity grayscale hover:grayscale-0 mix-blend-luminosity hover:mix-blend-normal" />
                            ) : (
                                <div className="w-full h-40 bg-black/40 flex items-center justify-center font-mono text-xs text-muted-foreground">NO IMAGE DATA</div>
                            )}
                        </div>
                        <div className="relative border border-danger/30 overflow-hidden shadow-[0_0_15px_rgba(240,68,68,0.15)] group">
                            <span className="absolute top-2 left-2 z-10 bg-black/80 px-2 py-1 font-mono text-[9px] text-danger border border-danger/30 uppercase tracking-widest">T1 (DETECTED LOSS)</span>
                            {incident.after_image_url ? (
                                <img src={incident.after_image_url} alt="After" className="w-full h-40 object-cover opacity-80 group-hover:opacity-100 transition-opacity grayscale hover:grayscale-0 mix-blend-luminosity hover:mix-blend-normal" />
                            ) : (
                                <div className="w-full h-40 bg-black/40 flex items-center justify-center font-mono text-xs text-muted-foreground">NO IMAGE DATA</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Clearance Actions */}
                <div className="flex flex-col gap-2 mt-4 border-t border-border/50 pt-4">
                    <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Operational Clearance</span>
                    <div className="grid grid-cols-2 gap-3">
                        <button className="bg-primary/10 border border-primary hover:bg-primary hover:text-black transition-colors font-mono text-[10px] uppercase flex items-center justify-center gap-2 py-3 text-primary tracking-widest">
                            <CheckCircle className="h-3 w-3" /> Confirm & Log
                        </button>
                        <button className="bg-white/5 border border-white/10 hover:border-white/30 transition-colors font-mono text-[10px] uppercase flex items-center justify-center gap-2 py-3 text-muted-foreground hover:text-white tracking-widest">
                            <XCircle className="h-3 w-3" /> False Positive
                        </button>
                        <button className="col-span-2 bg-[#060a11] border border-border/50 hover:border-white/30 transition-colors font-mono text-[10px] uppercase flex items-center justify-center gap-2 py-3 text-muted-foreground hover:text-white tracking-widest">
                            <AlertTriangle className="h-3 w-3" /> Execute Field Dispatch
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
