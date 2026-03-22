import { Activity, Database, Server, BarChart2 } from "lucide-react";
import { EnvironmentalStats } from "../components/EnvironmentalStats";
import { NDVIChart } from "../components/NDVIChart";

export default function DataDashboard() {
    return (
        <div className="h-full flex flex-col gap-6 overflow-y-auto pr-2 pb-4">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                <Server className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-display text-white tracking-widest uppercase">SYSTEM ANALYTICS &amp; REPORTING</h1>
                <div className="ml-auto flex gap-4 text-[10px] font-mono text-muted-foreground items-center">
                    <span>UPTIME: 99.98%</span>
                    <span className="text-primary border border-primary/40 bg-primary/10 px-2 py-0.5">DB CONNECTED</span>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1">
                {/* Main Stats Span all */}
                <div className="xl:col-span-3 border border-border/50 bg-[#060a11]/80 p-6 backdrop-blur-sm relative overflow-hidden">
                    {/* Tech accents */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-primary/50" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-primary/50" />

                    <div className="flex items-center gap-2 mb-6 border-b border-border/50 pb-3">
                        <Activity className="h-4 w-4 text-primary" />
                        <h2 className="font-mono text-xs text-primary/80 tracking-widest uppercase">Global Environmental Status Matrix</h2>
                    </div>
                    <EnvironmentalStats />
                </div>

                {/* NDVI Analysis */}
                <div className="xl:col-span-2 border border-border/50 bg-[#060a11]/80 p-6 backdrop-blur-sm relative">
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-ice-blue/50" />

                    <div className="flex items-center gap-2 mb-6 border-b border-border/50 pb-3">
                        <BarChart2 className="h-4 w-4 text-ice" />
                        <h2 className="font-mono text-xs text-ice/80 tracking-widest uppercase">NDVI Time-Series Volatility</h2>
                    </div>
                    <NDVIChart />
                </div>

                {/* Tactical Data Log */}
                <div className="border border-border/50 bg-[#060a11]/80 p-6 backdrop-blur-sm flex flex-col relative h-[450px] xl:h-auto">
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-accent/50" />

                    <div className="flex items-center gap-2 mb-6 border-b border-border/50 pb-3">
                        <Database className="h-4 w-4 text-accent" />
                        <h2 className="font-mono text-xs text-accent/80 tracking-widest uppercase">System Event Log</h2>
                    </div>
                    <div className="flex-1 space-y-4 font-mono text-[10.5px] overflow-y-auto pr-2 custom-scrollbar">
                        {[
                            { time: "08:42:11", msg: "NDVI array processing completed for Sector AMZ-1. Matrix updated.", type: "info" },
                            { time: "08:35:04", msg: "Sat connection established (Band: L2A Secure).", type: "success" },
                            { time: "08:12:59", msg: "Anomaly detected in SEA-1. Geometric bounds validation failed.", type: "warn" },
                            { time: "07:55:20", msg: "Automated carbon impact report compiled and vaulted.", type: "info" },
                            { time: "07:40:02", msg: "Sensor recalibration advised for region AFR-1.", type: "warn" },
                            { time: "06:15:44", msg: "Thermal scan sequence finalized. No massive flares detected.", type: "info" },
                            { time: "05:00:12", msg: "Daily batch raster ingest commencing. Expected latency 5ms.", type: "info" },
                        ].map((log, i) => (
                            <div key={i} className="flex gap-4 border-b border-white/5 pb-3">
                                <span className="text-muted-foreground whitespace-nowrap">[{log.time}]</span>
                                <span className={log.type === 'warn' ? 'text-accent' : log.type === 'success' ? 'text-primary' : 'text-[#c8d4df]'}>
                                    {log.msg}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
