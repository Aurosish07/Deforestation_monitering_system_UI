import { useState } from "react";
import { DeforestationMap } from "../components/DeforestationMap";
import { Upload, Activity, Layers } from "lucide-react";

export default function Detect() {
    const [bbox, setBbox] = useState<[number, number, number, number] | null>(null);
    const [date1, setDate1] = useState("2020-01-01");
    const [date2, setDate2] = useState("2024-01-01");
    const [fileT0, setFileT0] = useState<File | null>(null);
    const [fileT1, setFileT1] = useState<File | null>(null);

    const [isProcessing, setIsProcessing] = useState(false);
    const [taskStatus, setTaskStatus] = useState<string | null>(null);
    const [geoJsonData, setGeoJsonData] = useState<any>(null);

    const handleAnalyze = async () => {
        if (!bbox) {
            alert("Please draw a bounding box region to analyze first.");
            return;
        }
        if (!fileT0 || !fileT1) {
            alert("Manual API Step 3: Please manually upload two GeoTIFFs (T0 and T1).");
            return;
        }

        setIsProcessing(true);
        setTaskStatus("UPLOADING SATELLITE DATA...");

        try {
            const formData = new FormData();
            formData.append("bbox", JSON.stringify(bbox));
            formData.append("date1", date1);
            formData.append("date2", date2);

            formData.append("t0", fileT0);
            formData.append("t1", fileT1);
            formData.append("threshold", "0.2");
            formData.append("min_area_ha", "0.01");
            formData.append("red_band", "4");
            formData.append("nir_band", "8");

            const res = await fetch("http://localhost:8000/analyze", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                setTaskStatus("API REQUEST FAILED");
                setIsProcessing(false);
                return;
            }

            const data = await res.json();

            if (data.task_id) {
                pollStatus(data.task_id);
            } else {
                alert("Failed to start task.");
                setIsProcessing(false);
            }
        } catch (err) {
            console.error(err);
            alert("Network Error: Make sure backend is running on :8000");
            setIsProcessing(false);
            setTaskStatus(null);
        }
    };

    const pollStatus = (taskId: string) => {
        setTaskStatus("PROCESSING NDVI INTELLIGENCE...");
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`http://localhost:8000/task/${taskId}`);
                if (!res.ok) return;
                const task = await res.json();

                if (task.status === "done") {
                    clearInterval(interval);
                    setTaskStatus("FETCHING GEOMETRY TARGETS...");
                    fetchGeojson(taskId);
                } else if (task.status === "error") {
                    clearInterval(interval);
                    setTaskStatus(`ERROR: ${task.error}`);
                    setIsProcessing(false);
                }
            } catch (e) {
                console.error(e);
            }
        }, 2000);
    };

    const fetchGeojson = async (taskId: string) => {
        try {
            const res = await fetch(`http://localhost:8000/incidents/${taskId}`);
            if (res.ok) {
                const gj = await res.json();
                setGeoJsonData(gj);
                setTaskStatus("TARGETS ACQUIRED. RENDERING OVERLAY.");
                setTimeout(() => setTaskStatus(null), 3000);
            } else {
                setTaskStatus("FAILED TO LOAD GEOJSON.");
            }
        } catch (e) {
            setTaskStatus("NETWORK ERROR FETCHING GEOJSON.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="h-full flex flex-col gap-4">
            {/* Control Header */}
            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 p-4 border border-border/50 bg-[#060a11]/80 backdrop-blur-md relative overflow-hidden">
                {/* Accent corners */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-primary/50" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-primary/50" />

                <div className="flex items-center gap-6 pb-2 xl:pb-0 border-b border-border/30 xl:border-none w-full xl:w-auto">
                    <div className="flex items-center gap-2 text-primary font-display whitespace-nowrap">
                        <Layers className="h-5 w-5" />
                        <h1 className="text-sm tracking-wider">TACTICAL ACQUISITION</h1>
                    </div>

                    <div className="h-6 w-[1px] bg-border/50 hidden xl:block" />

                    <div className="font-mono text-[10px] text-muted-foreground flex gap-4 min-w-[200px]">
                        <div>
                            BBOX: <br />{bbox ? <span className="text-primary truncate">[{bbox.map(n => n.toFixed(1)).join(', ')}]</span> : <span className="text-danger animate-pulse">AWAITING DRAW TOOL (SQUARE)...</span>}
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto justify-end">
                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Date [Start]</span>
                        <input type="date" value={date1} onChange={e => setDate1(e.target.value)} className="bg-black/40 border border-border/50 font-mono text-[11px] text-white px-2 py-1 outline-none focus:border-primary w-28" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-mono text-danger uppercase tracking-widest">Date [End]</span>
                        <input type="date" value={date2} onChange={e => setDate2(e.target.value)} className="bg-black/40 border border-border/50 font-mono text-[11px] text-white px-2 py-1 outline-none focus:border-danger w-28" />
                    </div>

                    <div className="h-6 w-[1px] bg-border/50 hidden md:block" />

                    {/* Step 3 Manual upload fallbacks */}
                    <div className="flex flex-col gap-1 relative group cursor-pointer">
                        <span className="text-[9px] font-mono text-muted-foreground tracking-widest uppercase">Upload T0 TIFF (Manual)</span>
                        <label className="bg-black/40 border border-border/50 hover:border-primary px-3 py-1 flex items-center gap-2 cursor-pointer transition-colors w-32">
                            <Upload className="h-3 w-3 text-primary flex-shrink-0" />
                            <span className="font-mono text-[11px] text-white truncate">{fileT0 ? fileT0.name : "SELECT FILE..."}</span>
                            <input type="file" accept=".tif,.tiff" className="hidden" onChange={e => setFileT0(e.target.files?.[0] || null)} />
                        </label>
                    </div>
                    <div className="flex flex-col gap-1 relative group cursor-pointer">
                        <span className="text-[9px] font-mono text-danger tracking-widest uppercase">Upload T1 TIFF (Manual)</span>
                        <label className="bg-black/40 border border-border/50 hover:border-danger px-3 py-1 flex items-center gap-2 cursor-pointer transition-colors w-32">
                            <Upload className="h-3 w-3 text-danger flex-shrink-0" />
                            <span className="font-mono text-[11px] text-white truncate">{fileT1 ? fileT1.name : "SELECT FILE..."}</span>
                            <input type="file" accept=".tif,.tiff" className="hidden" onChange={e => setFileT1(e.target.files?.[0] || null)} />
                        </label>
                    </div>

                    <button
                        onClick={handleAnalyze}
                        disabled={isProcessing || !bbox || !fileT0 || !fileT1}
                        className="bg-primary/10 border border-primary text-primary hover:bg-primary hover:text-black font-display text-[11px] tracking-widest px-6 h-8 flex items-center transition-all shadow-[0_0_10px_rgba(6,182,212,0.3)] disabled:opacity-30 disabled:border-muted-foreground disabled:text-muted-foreground disabled:shadow-none disabled:cursor-not-allowed ml-2"
                    >
                        {isProcessing ? "PROCESSING..." : "ANALYZE.SYS"}
                    </button>
                </div>
            </div>

            {/* Main Single Map Area */}
            <div className="flex-1 relative bg-black">
                {taskStatus && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[500] bg-black/90 border border-primary/50 text-white shadow-glow p-6 font-mono text-xs tracking-widest flex items-center gap-4">
                        <Activity className="h-5 w-5 text-primary animate-pulse" />
                        {taskStatus}
                    </div>
                )}

                <DeforestationMap
                    center={[0, 0]}
                    zoom={2}
                    geoJsonData={geoJsonData}
                    onBboxDrawn={setBbox}
                    title="SATELLITE INTELLIGENCE"
                />
            </div>
        </div>
    );
}
