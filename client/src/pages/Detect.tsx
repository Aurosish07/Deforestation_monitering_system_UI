import { useState } from "react";
import { DeforestationMap } from "../components/DeforestationMap";
import { Activity, Layers } from "lucide-react";
import { api, type Incident } from "../lib/api";

export default function Detect() {
  const [bbox, setBbox] = useState<[number, number, number, number] | null>(
    null,
  );
  const [date1, setDate1] = useState("2020-01-01");
  const [date2, setDate2] = useState("2024-01-01");
  const [threshold, setThreshold] = useState(0.2);

  const [isProcessing, setIsProcessing] = useState(false);
  const [taskStatus, setTaskStatus] = useState<string | null>(null);
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [analysisSummary, setAnalysisSummary] = useState<{
    incidentCount: number;
    totalLossHa: number;
  } | null>(null);

  const incidentsToGeoJson = (incidents: Incident[]) => ({
    type: "FeatureCollection",
    features: incidents.map((incident) => ({
      type: "Feature",
      geometry: incident.geometry,
      properties: {
        id: incident.id,
        severity: incident.severity,
        area_ha: incident.area_ha,
        threshold: incident.threshold_used,
      },
    })),
  });

  const handleAnalyze = async () => {
    if (!bbox) {
      alert("Please draw a bounding box region to analyze first.");
      return;
    }

    setIsProcessing(true);
    setTaskStatus("QUEUING SATELLITE ANALYSIS...");
    setGeoJsonData(null);
    setAnalysisSummary(null);

    try {
      const { job_id } = await api.analyze({
        bbox,
        date_t0: date1,
        date_t1: date2,
        threshold,
      });
      pollStatus(job_id);
    } catch (err) {
      console.error(err);
      alert("Network Error: Make sure backend is running on :8000");
      setIsProcessing(false);
      setTaskStatus(null);
    }
  };

  const pollStatus = (taskId: string) => {
    setTaskStatus("FETCHING SATELLITE DATA...");

    const pollOnce = async () => {
      try {
        const task = await api.getJobStatus(taskId);

        if (task.stage) {
          setTaskStatus(task.stage.toUpperCase());
        }

        if (task.status === "done") {
          setTaskStatus("FETCHING INCIDENT GEOJSON...");
          await fetchAndSummarizeIncidents(taskId);
          return;
        }

        if (task.status === "error") {
          setTaskStatus(`ERROR: ${task.error}`);
          setIsProcessing(false);
          return;
        }

        setTimeout(pollOnce, 2000);
      } catch (e) {
        console.error(e);
        setTaskStatus("POLLING ERROR. RETRYING...");
        setTimeout(pollOnce, 3000);
      }
    };

    void pollOnce();
  };

  const fetchAndSummarizeIncidents = async (taskId: string) => {
    try {
      const latestTask = await api.getJobStatus(taskId);
      const incidents = await api.getIncidents(taskId);
      const incidentAreaHa = incidents.reduce(
        (sum, incident) => sum + (incident.area_ha || 0),
        0,
      );
      const totalLossHa =
        incidents.length > 0
          ? incidentAreaHa
          : latestTask.summary?.total_area_ha || 0;
      setGeoJsonData(incidentsToGeoJson(incidents));
      setAnalysisSummary({
        incidentCount: incidents.length,
        totalLossHa,
      });
      if (incidents.length === 0) {
        if (totalLossHa > 0) {
          setTaskStatus(
            `COMPLETE: DIFFUSE LOSS ESTIMATE ${totalLossHa.toFixed(2)} HA (BELOW POLYGON THRESHOLD)`,
          );
        } else {
          setTaskStatus(
            "COMPLETE: NO SIGNIFICANT FOREST LOSS DETECTED FOR THIS THRESHOLD",
          );
        }
      } else {
        setTaskStatus(
          `COMPLETE: ${incidents.length} INCIDENT(S), ${totalLossHa.toFixed(2)} HA LOSS`,
        );
      }
      setTimeout(() => setTaskStatus(null), 4000);
    } catch (e) {
      setTaskStatus("FAILED TO LOAD INCIDENTS.");
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
              BBOX: <br />
              {bbox ? (
                <span className="text-primary truncate">
                  [{bbox.map((n) => n.toFixed(1)).join(", ")}]
                </span>
              ) : (
                <span className="text-danger animate-pulse">
                  AWAITING DRAW TOOL (SQUARE)...
                </span>
              )}
            </div>
          </div>

          {analysisSummary && (
            <div className="font-mono text-[10px] text-emerald-300 border border-emerald-500/40 bg-emerald-900/20 px-3 py-1">
              LOSS:{" "}
              <span className="text-emerald-200">
                {analysisSummary.totalLossHa.toFixed(2)} ha
              </span>
              <br />
              INCIDENTS:{" "}
              <span className="text-emerald-200">
                {analysisSummary.incidentCount}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto justify-end">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
              Date [Start]
            </span>
            <input
              type="date"
              value={date1}
              onChange={(e) => setDate1(e.target.value)}
              className="bg-black/40 border border-border/50 font-mono text-[11px] text-white px-2 py-1 outline-none focus:border-primary w-28"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-mono text-danger uppercase tracking-widest">
              Date [End]
            </span>
            <input
              type="date"
              value={date2}
              onChange={(e) => setDate2(e.target.value)}
              className="bg-black/40 border border-border/50 font-mono text-[11px] text-white px-2 py-1 outline-none focus:border-danger w-28"
            />
          </div>

          <div className="h-6 w-[1px] bg-border/50 hidden md:block" />

          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
              Threshold
            </span>
            <input
              type="number"
              min="0.05"
              max="0.8"
              step="0.05"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="bg-black/40 border border-border/50 font-mono text-[11px] text-white px-2 py-1 outline-none focus:border-primary w-24"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isProcessing || !bbox}
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
