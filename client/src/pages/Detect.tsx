import { useState } from "react";
import { DeforestationMap } from "../components/DeforestationMap";
import { Activity, Layers, X } from "lucide-react";
import { DeforestationAIChat } from "../components/DeforestationAIChat";
import { api, type Incident } from "../lib/api";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

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
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [showDetailsCard, setShowDetailsCard] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

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
      setCurrentJobId(job_id);
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
      const fetchedIncidents = await api.getIncidents(taskId);
      const incidentAreaHa = fetchedIncidents.reduce(
        (sum, incident) => sum + (incident.area_ha || 0),
        0,
      );
      const totalLossHa =
        fetchedIncidents.length > 0
          ? incidentAreaHa
          : latestTask.summary?.total_area_ha || 0;
      setGeoJsonData(incidentsToGeoJson(fetchedIncidents));
      setIncidents(fetchedIncidents);
      setAnalysisSummary({
        incidentCount: fetchedIncidents.length,
        totalLossHa,
      });
      // Open charts + AI chat automatically when analysis is ready.
      setShowDetailsCard(true);
      if (fetchedIncidents.length === 0) {
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
          `COMPLETE: ${fetchedIncidents.length} INCIDENT(S), ${totalLossHa.toFixed(2)} HA LOSS`,
        );
      }
      setTimeout(() => setTaskStatus(null), 4000);
    } catch (e) {
      setTaskStatus("FAILED TO LOAD INCIDENTS.");
    } finally {
      setIsProcessing(false);
    }
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
    const critical = incidents
      .filter((i) => i.severity === "critical")
      .reduce((sum, i) => sum + (i.area_ha || 0), 0);
    const high = incidents
      .filter((i) => i.severity === "high")
      .reduce((sum, i) => sum + (i.area_ha || 0), 0);
    const medium = incidents
      .filter((i) => i.severity === "medium")
      .reduce((sum, i) => sum + (i.area_ha || 0), 0);
    const low = incidents
      .filter((i) => i.severity === "low")
      .reduce((sum, i) => sum + (i.area_ha || 0), 0);
    return [
      { name: "Critical", area: Number(critical.toFixed(2)) },
      { name: "High", area: Number(high.toFixed(2)) },
      { name: "Medium", area: Number(medium.toFixed(2)) },
      { name: "Low", area: Number(low.toFixed(2)) },
    ].filter((item) => item.area > 0);
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

      {/* Detailed Analysis Card Modal */}
      {showDetailsCard && analysisSummary && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-end sm:items-center justify-center p-4">
          <div className="bg-black border border-primary/50 rounded-lg shadow-[0_0_30px_rgba(6,182,212,0.3)] w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col sm:flex-row h-[90vh]">
              {/* Left Side: Charts and Data */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-black to-primary/10 border-b border-primary/30 p-4 flex items-start justify-between flex-shrink-0">
                  <div>
                    <h2 className="text-lg font-bold text-primary font-mono tracking-wider">
                      DEFORESTATION ANALYSIS
                    </h2>
                    <p className="text-[10px] text-muted-foreground font-mono mt-1">
                      {date1} → {date2} | T:{threshold}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDetailsCard(false)}
                    className="text-primary hover:text-red-400 transition-colors flex-shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content Area - Scrollable */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="border border-emerald-500/50 bg-emerald-950/40 p-3 rounded">
                      <div className="text-lg font-bold text-emerald-400">
                        {analysisSummary.totalLossHa.toFixed(2)}
                      </div>
                      <div className="text-[9px] text-emerald-300 uppercase tracking-widest mt-1">
                        Loss (HA)
                      </div>
                    </div>
                    <div className="border border-orange-500/50 bg-orange-950/40 p-3 rounded">
                      <div className="text-lg font-bold text-orange-400">
                        {analysisSummary.incidentCount}
                      </div>
                      <div className="text-[9px] text-orange-300 uppercase tracking-widest mt-1">
                        Incidents
                      </div>
                    </div>
                    <div className="border border-cyan-500/50 bg-cyan-950/40 p-3 rounded">
                      <div className="text-lg font-bold text-cyan-400">
                        {(analysisSummary.totalLossHa / (analysisSummary.incidentCount || 1)).toFixed(2)}
                      </div>
                      <div className="text-[9px] text-cyan-300 uppercase tracking-widest mt-1">
                        Avg (HA)
                      </div>
                    </div>
                  </div>

                  {/* Charts */}
                  <div className="space-y-4">
                    {/* Severity Distribution Pie Chart */}
                    <div className="border border-primary/30 bg-primary/5 p-3 rounded">
                      <h3 className="text-[9px] font-mono tracking-widest text-primary uppercase mb-2">
                        Severity Distribution
                      </h3>
                      {incidents.length > 0 ? (
                        <ResponsiveContainer width="100%" height={150}>
                          <PieChart>
                            <Pie
                              data={getSeverityData()}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={60}
                              paddingAngle={1}
                              dataKey="value"
                            >
                              <Cell fill="#ef4444" />
                              <Cell fill="#f97316" />
                              <Cell fill="#facc15" />
                              <Cell fill="#22c55e" />
                            </Pie>
                            <Tooltip formatter={(value) => `${value}`} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-[150px] flex items-center justify-center text-muted-foreground text-[10px]">
                          No incident data
                        </div>
                      )}
                    </div>

                    {/* Area Distribution Bar Chart */}
                    <div className="border border-primary/30 bg-primary/5 p-3 rounded">
                      <h3 className="text-[9px] font-mono tracking-widest text-primary uppercase mb-2">
                        Area by Severity
                      </h3>
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
                        <div className="h-[150px] flex items-center justify-center text-muted-foreground text-[10px]">
                          No incident data
                        </div>
                      )}
                    </div>

                    {/* Satellite Comparison Images */}
                    {currentJobId && (
                      <div className="border border-primary/30 bg-primary/5 p-3 rounded">
                        <h3 className="text-[9px] font-mono tracking-widest text-primary uppercase mb-2">
                          Satellite Comparison (True Color)
                        </h3>
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <div className="text-[9px] font-mono text-muted-foreground uppercase mb-1">{date1}</div>
                            <img 
                              src={`http://127.0.0.1:8000/preview/${currentJobId}/t0`} 
                              className="w-full aspect-square object-cover border border-primary/30 rounded" 
                              alt="Before" 
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} 
                            />
                          </div>
                          <div className="flex-1">
                            <div className="text-[9px] font-mono text-danger uppercase mb-1">{date2}</div>
                            <img 
                              src={`http://127.0.0.1:8000/preview/${currentJobId}/t1`} 
                              className="w-full aspect-square object-cover border border-primary/30 rounded" 
                              alt="After" 
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} 
                            />
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
    </div>
  );
}
