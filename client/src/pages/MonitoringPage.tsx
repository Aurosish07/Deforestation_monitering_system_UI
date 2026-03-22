import { useState } from "react";
import { FiltersSidebar } from "../components/monitoring/FiltersSidebar";
import { MapPanel } from "../components/monitoring/MapPanel";
import { IncidentsSidebar } from "../components/monitoring/IncidentsSidebar";
import { IncidentDetailsDrawer } from "../components/monitoring/IncidentDetailsDrawer";
import { api } from "../lib/api";
import type { Incident } from "../lib/api";
import { Layers, Download } from "lucide-react";

export default function MonitoringPage() {
    const [bbox, setBbox] = useState<[number, number, number, number] | null>(null);
    const [date1, setDate1] = useState("2023-01-01");
    const [date2, setDate2] = useState("2024-01-01");
    const [threshold, setThreshold] = useState(0.2);

    // Job & Incidents State
    const [taskStatus, setTaskStatus] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

    // Layers State
    const [layers, setLayers] = useState({
        satellite: true,
        polygons: true,
        heatmap: false,
        bounds: false,
    });

    const handleAnalyze = async () => {
        if (!bbox) {
            alert("Please draw an operational bounding box on the map first.");
            return;
        }

        setIsProcessing(true);
        setTaskStatus("INITIALIZING ANALYSIS PROTOCOL...");
        setIncidents([]);
        setSelectedIncidentId(null);

        try {
            const { job_id } = await api.analyze({
                bbox,
                date_t0: date1,
                date_t1: date2,
                threshold
            });
            pollStatus(job_id);
        } catch (err) {
            console.error(err);
            setTaskStatus("API REQUEST FAILED");
            setIsProcessing(false);
        }
    };

    const pollStatus = (id: string) => {
        setTaskStatus("DOWNLOADING SATELLITE IMAGERY...");
        const interval = setInterval(async () => {
            try {
                const job = await api.getJobStatus(id);
                if (job.status === "done") {
                    clearInterval(interval);
                    setTaskStatus("FETCHING INTELLIGENCE...");
                    const inc = await api.getIncidents(id);
                    setIncidents(inc);
                    setTaskStatus("TARGETS ACQUIRED.");
                    setTimeout(() => setTaskStatus(null), 3000);
                    setIsProcessing(false);
                } else if (job.status === "error") {
                    clearInterval(interval);
                    const errMsg = (job as any).error || "Unknown error";
                    setTaskStatus(`ERROR: ${errMsg}`);
                    setIsProcessing(false);
                }
            } catch (e) {
                console.error(e);
            }
        }, 2000);
    };

    return (
        <div className="h-full flex flex-col bg-background text-foreground overflow-hidden">
            {/* 1. Top Header Bar */}
            <header className="h-14 border-b border-border/50 bg-[#060a11] flex items-center justify-between px-6 relative z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <Layers className="h-5 w-5 text-primary" />
                    <h1 className="font-display text-sm tracking-widest text-primary uppercase">ENVIRONMENTAL MONITORING CONSOLE</h1>
                    <div className="h-4 w-[1px] bg-border/50 mx-2" />
                    <div className="flex gap-4 font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                        <span>SYS: OMEGA-2</span>
                        <span>VER: 4.1.9c</span>
                    </div>
                </div>

                <div className="flex items-center gap-4 font-mono">
                    {taskStatus && (
                        <span className="text-[10px] text-primary animate-pulse tracking-widest whitespace-nowrap hidden lg:inline">
                            &gt; {taskStatus}
                        </span>
                    )}
                    <button
                        onClick={handleAnalyze}
                        disabled={isProcessing || !bbox}
                        className="bg-primary/10 border border-primary text-primary hover:bg-primary hover:text-black text-[11px] px-6 h-8 flex items-center shrink-0 transition-all shadow-[0_0_10px_rgba(6,182,212,0.3)] disabled:opacity-30 disabled:border-muted-foreground disabled:text-muted-foreground disabled:shadow-none disabled:cursor-not-allowed uppercase font-bold tracking-widest"
                    >
                        {isProcessing ? "PROCESSING..." : "RUN ANALYSIS"}
                    </button>
                    <button className="border border-border/50 text-muted-foreground hover:text-white hover:border-white text-[11px] px-4 h-8 flex items-center gap-2 shrink-0 transition-all uppercase bg-black/40 font-bold tracking-widest">
                        <Download className="h-3 w-3" /> EXPORT
                    </button>
                </div>
            </header>

            {/* 2. Main Workspace Layout */}
            <main className="flex-1 flex overflow-hidden relative">
                {/* Left Panel: Filters */}
                <FiltersSidebar
                    bbox={bbox}
                    date1={date1}
                    setDate1={setDate1}
                    date2={date2}
                    setDate2={setDate2}
                    threshold={threshold}
                    setThreshold={setThreshold}
                    layers={layers}
                    setLayers={setLayers}
                />

                {/* Center Panel: Map */}
                <div className="flex-1 relative border-r border-border/50 bg-black overflow-hidden flex flex-col">
                    <MapPanel
                        bbox={bbox}
                        setBbox={setBbox}
                        incidents={incidents}
                        layers={layers}
                        selectedIncidentId={selectedIncidentId}
                        onIncidentSelect={setSelectedIncidentId}
                    />
                </div>

                {/* Right Panel: Incident Feed & Summaries */}
                <IncidentsSidebar
                    incidents={incidents}
                    selectedIncidentId={selectedIncidentId}
                    onIncidentSelect={setSelectedIncidentId}
                    isProcessing={isProcessing}
                />

                {/* Floating/Overlay Drawer for Incident Details */}
                <IncidentDetailsDrawer
                    incident={incidents.find(i => i.id === selectedIncidentId) || null}
                    onClose={() => setSelectedIncidentId(null)}
                />
            </main>
        </div>
    );
}
