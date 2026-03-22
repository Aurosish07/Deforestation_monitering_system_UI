import { Settings2, Layers, Map as MapIcon, SlidersHorizontal, Eye, EyeOff } from "lucide-react";

export function FiltersSidebar({ bbox, date1, setDate1, date2, setDate2, threshold, setThreshold, layers, setLayers }: any) {
    return (
        <aside className="w-72 shrink-0 bg-[#060a11]/90 border-r border-border/50 flex flex-col overflow-y-auto">
            <div className="p-4 border-b border-border/50 flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-primary" />
                <h2 className="font-mono text-xs uppercase text-primary tracking-widest">Operation Parameters</h2>
            </div>

            <div className="p-4 flex flex-col gap-6 font-mono text-xs">

                {/* BOUNDING BOX */}
                <div className="flex flex-col gap-2">
                    ,<div className="flex items-center gap-2 text-muted-foreground border-b border-white/5 pb-2">
                        <MapIcon className="h-3 w-3" />
                        <span className="uppercase tracking-widest">Active Region</span>
                    </div>
                    {bbox ? (
                        <div className="bg-black/40 border border-border/40 p-2 text-[10px] text-primary/80 grid grid-cols-2 gap-1 break-all">
                            <span>W: {bbox[0].toFixed(2)}</span>
                            <span>S: {bbox[1].toFixed(2)}</span>
                            <span>E: {bbox[2].toFixed(2)}</span>
                            <span>N: {bbox[3].toFixed(2)}</span>
                        </div>
                    ) : (
                        <div className="text-[10px] text-danger animate-pulse border border-danger/30 bg-danger/10 p-2">
                            AWAITING BBOX DRAW EVENT
                        </div>
                    )}
                </div>

                {/* DATES */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-muted-foreground border-b border-white/5 pb-2">
                        <SlidersHorizontal className="h-3 w-3" />
                        <span className="uppercase tracking-widest">Temporal Bounds</span>
                    </div>
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1">
                            <span className="text-[9px] text-muted-foreground uppercase">Reference (T0)</span>
                            <input type="date" value={date1} onChange={e => setDate1(e.target.value)} className="bg-black/40 border border-border/50 text-white px-2 py-1.5 outline-none focus:border-primary w-full" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[9px] text-muted-foreground uppercase">Target (T1)</span>
                            <input type="date" value={date2} onChange={e => setDate2(e.target.value)} className="bg-black/40 border border-border/50 text-white px-2 py-1.5 outline-none focus:border-danger w-full" />
                        </div>
                    </div>
                </div>

                {/* SENSITIVITY */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-muted-foreground border-b border-white/5 pb-2">
                        <span className="uppercase tracking-widest flex items-center gap-2"><SlidersHorizontal className="h-3 w-3" /> Sensitivity Level</span>
                        <span className="text-primary">{threshold.toFixed(2)}</span>
                    </div>
                    <input
                        type="range"
                        min="0" max="0.5" step="0.01"
                        value={threshold}
                        onChange={(e) => setThreshold(parseFloat(e.target.value))}
                        className="w-full accent-primary mt-2"
                    />
                    <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                        <span>LENIENT</span>
                        <span>STRICT</span>
                    </div>
                </div>

                {/* LAYERS */}
                <div className="flex flex-col gap-2 mt-4">
                    <div className="flex items-center gap-2 text-muted-foreground border-b border-white/5 pb-2">
                        <Layers className="h-3 w-3" />
                        <span className="uppercase tracking-widest">Visual Layers</span>
                    </div>
                    <div className="flex flex-col gap-2 mt-2 text-[11px]">
                        {[
                            { id: 'satellite', label: 'L1: Base Satellite' },
                            { id: 'polygons', label: 'L2: Detected Anomalies' },
                            { id: 'heatmap', label: 'L3: NDVI Heatmap' },
                            { id: 'bounds', label: 'L4: Admin Bounds' }
                        ].map(layer => (
                            <button
                                key={layer.id}
                                onClick={() => setLayers({ ...layers, [layer.id]: !layers[layer.id as keyof typeof layers] })}
                                className={`flex items-center justify-between p-2 border transition-colors ${layers[layer.id as keyof typeof layers] ? 'bg-primary/10 border-primary text-primary' : 'bg-black/40 border-border/40 text-muted-foreground hover:border-white/20'}`}
                            >
                                <span>{layer.label}</span>
                                {layers[layer.id as keyof typeof layers] ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                            </button>
                        ))}
                    </div>
                </div>

            </div>
        </aside>
    );
}
