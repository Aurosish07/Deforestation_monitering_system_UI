import { useState } from "react";
import { FiltersSidebar } from "../components/monitoring/FiltersSidebar";
import { MapPanel } from "../components/monitoring/MapPanel";
import { IncidentsSidebar } from "../components/monitoring/IncidentsSidebar";
import { IncidentDetailsDrawer } from "../components/monitoring/IncidentDetailsDrawer";
import { api } from "../lib/api";
import type { Incident } from "../lib/api";
import { Layers, Download, X } from "lucide-react";
import { DeforestationAIChat } from "../components/DeforestationAIChat";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

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

    const [showDetailsCard, setShowDetailsCard] = useState(false);
    const [currentJobId, setCurrentJobId] = useState<string | null>(null);
    const [analysisSummary, setAnalysisSummary] = useState<{
        incidentCount: number;
        totalLossHa: number;
    } | null>(null);

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

                    const incidentAreaHa = inc.reduce((sum, incident) => sum + (incident.area_ha || 0), 0);
                    const totalLossHa = inc.length > 0 ? incidentAreaHa : job.summary?.total_area_ha || 0;
                    setAnalysisSummary({
                        incidentCount: inc.length,
                        totalLossHa,
                    });
                    setCurrentJobId(id);
                    setShowDetailsCard(true);

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

    const getSeverityData = () => {
        const critical = incidents.filter((i) => i.severity === "critical").length;
        const high = incidents.filter((i) => i.severity === "high").length;
        const medium = incidents.filter((i) => i.severity === "medium").length;
        const low = incidents.filter((i) => i.severity === "low").length;
        return [
            { name: "Critical", value: critical },
            { name: "High", value: high },
            { name: "Medium", value: medium },
            { name: "Low", value: low },
        ].filter((item) => item.value > 0);
    };

    const getSeverityAreaData = () => {
        const critical = incidents.filter((i) => i.severity === "critical").reduce((sum, i) => sum + (i.area_ha || 0), 0);
        const high = incidents.filter((i) => i.severity === "high").reduce((sum, i) => sum + (i.area_ha || 0), 0);
        const medium = incidents.filter((i) => i.severity === "medium").reduce((sum, i) => sum + (i.area_ha || 0), 0);
        const low = incidents.filter((i) => i.severity === "low").reduce((sum, i) => sum + (i.area_ha || 0), 0);
        return [
            { name: "Critical", area: Number(critical.toFixed(2)) },
            { name: "High", area: Number(high.toFixed(2)) },
            { name: "Medium", area: Number(medium.toFixed(2)) },
            { name: "Low", area: Number(low.toFixed(2)) },
        ].filter((item) => item.area > 0);
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

                {/* Detailed Analysis Card Modal (with Charts, images, AI) */}
                {showDetailsCard && analysisSummary && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-end sm:items-center justify-center p-4">
                        <div className="bg-black border border-primary/50 rounded-lg shadow-[0_0_30px_rgba(6,182,212,0.3)] w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                            <div className="flex flex-col sm:flex-row h-[90vh]">
                                {/* Left Side: Charts and Data */}
                                <div className="flex-1 flex flex-col overflow-hidden">
                                    <div className="bg-gradient-to-r from-black to-primary/10 border-b border-primary/30 p-4 flex items-start justify-between flex-shrink-0">
                                        <div>
                                            <h2 className="text-lg font-bold text-primary font-mono tracking-wider">
                                                DEFORESTATION ANALYSIS
                                            </h2>
                                            <p className="text-[10px] text-muted-foreground font-mono mt-1">
                                                {date1} → {date2} | T:{threshold}
                                            </p>
                                        </div>
                                        <button onClick={() => setShowDetailsCard(false)} className="text-primary hover:text-red-400 transition-colors flex-shrink-0">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="border border-emerald-500/50 bg-emerald-950/40 p-3 rounded">
                                                <div className="text-lg font-bold text-emerald-400">{analysisSummary.totalLossHa.toFixed(2)}</div>
                                                <div className="text-[9px] text-emerald-300 uppercase tracking-widest mt-1">Loss (HA)</div>
                                            </div>
                                            <div className="border border-orange-500/50 bg-orange-950/40 p-3 rounded">
                                                <div className="text-lg font-bold text-orange-400">{analysisSummary.incidentCount}</div>
                                                <div className="text-[9px] text-orange-300 uppercase tracking-widest mt-1">Incidents</div>
                                            </div>
                                            <div className="border border-cyan-500/50 bg-cyan-950/40 p-3 rounded">
                                                <div className="text-lg font-bold text-cyan-400">{(analysisSummary.totalLossHa / (analysisSummary.incidentCount || 1)).toFixed(2)}</div>
                                                <div className="text-[9px] text-cyan-300 uppercase tracking-widest mt-1">Avg (HA)</div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="border border-primary/30 bg-primary/5 p-3 rounded">
                                                <h3 className="text-[9px] font-mono tracking-widest text-primary uppercase mb-2">Severity Distribution</h3>
                                                {incidents.length > 0 ? (
                                                    <ResponsiveContainer width="100%" height={150}>
                                                        <PieChart>
                                                            <Pie data={getSeverityData()} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={1} dataKey="value">
                                                                <Cell fill="#ef4444" />
                                                                <Cell fill="#f97316" />
                                                                <Cell fill="#facc15" />
                                                                <Cell fill="#22c55e" />
                                                            </Pie>
                                                            <Tooltip formatter={(value) => `${value}`} />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                ) : (
                                                    <div className="h-[150px] flex items-center justify-center text-muted-foreground text-[10px]">No incident data</div>
                                                )}
                                            </div>

                                            <div className="border border-primary/30 bg-primary/5 p-3 rounded">
                                                <h3 className="text-[9px] font-mono tracking-widest text-primary uppercase mb-2">Area by Severity</h3>
                                                {incidents.length > 0 ? (
                                                    <ResponsiveContainer width="100%" height={150}>
                                                        <BarChart data={getSeverityAreaData()}>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.1)" />
                                                            <XAxis dataKey="name" stroke="#666" tick={{ fontSize: 10 }} />
                                                            <YAxis stroke="#666" tick={{ fontSize: 10 }} />
                                                            <Tooltip />
                                                            <Bar dataKey="area" fill="#06b6d4" radius={[3, 3, 0, 0]} />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                ) : (
                                                    <div className="h-[150px] flex items-center justify-center text-muted-foreground text-[10px]">No incident data</div>
                                                )}
                                            </div>

                                            {currentJobId && (
                                                <div className="border border-primary/30 bg-primary/5 p-3 rounded">
                                                    <h3 className="text-[9px] font-mono tracking-widest text-primary uppercase mb-2">Satellite Comparison (True Color)</h3>
                                                    <div className="flex gap-4">
                                                        <div className="flex-1">
                                                            <div className="text-[9px] font-mono text-muted-foreground uppercase mb-1">{date1}</div>
                                                            <img src={`http://127.0.0.1:8000/preview/${currentJobId}/t0`} className="w-full aspect-square object-cover border border-primary/30 rounded" alt="Before" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="text-[9px] font-mono text-danger uppercase mb-1">{date2}</div>
                                                            <img src={`http://127.0.0.1:8000/preview/${currentJobId}/t1`} className="w-full aspect-square object-cover border border-primary/30 rounded" alt="After" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: AI Chat */}
                                <DeforestationAIChat
                                    incidents={incidents}
                                    totalLossHa={analysisSummary.totalLossHa}
                                    incidentCount={analysisSummary.incidentCount}
                                    bbox={bbox}
                                    dateStart={date1}
                                    dateEnd={date2}
                                    threshold={threshold}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
