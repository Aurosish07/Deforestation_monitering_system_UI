import { useMemo, useState } from "react";
import { DeforestationMap } from "../components/DeforestationMap";
import { api, type Incident } from "../lib/api";
import { Activity, Sparkles } from "lucide-react";

interface AnalysisSummary {
  totalLossHa: number;
  incidentCount: number;
  bySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as
  | string
  | undefined;

function buildGeoJson(incidents: Incident[]) {
  return {
    type: "FeatureCollection",
    features: incidents.map((incident) => ({
      type: "Feature",
      geometry: incident.geometry,
      properties: {
        id: incident.id,
        area_ha: incident.area_ha,
        severity: incident.severity,
      },
    })),
  };
}

function summarizeIncidents(
  incidents: Incident[],
  fallbackAreaHa = 0,
): AnalysisSummary {
  const bySeverity = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };

  let areaSum = 0;
  for (const incident of incidents) {
    areaSum += incident.area_ha || 0;
    if (incident.severity === "critical") bySeverity.critical += 1;
    else if (incident.severity === "high") bySeverity.high += 1;
    else if (incident.severity === "medium") bySeverity.medium += 1;
    else bySeverity.low += 1;
  }

  return {
    totalLossHa: incidents.length > 0 ? areaSum : fallbackAreaHa,
    incidentCount: incidents.length,
    bySeverity,
  };
}

export default function AnalysisMapView() {
  const [bbox, setBbox] = useState<[number, number, number, number] | null>(
    null,
  );
  const [date1, setDate1] = useState("2023-01-01");
  const [date2, setDate2] = useState("2024-01-01");
  const [threshold, setThreshold] = useState(0.15);

  const [isProcessing, setIsProcessing] = useState(false);
  const [taskStatus, setTaskStatus] = useState<string | null>(null);
  const [summary, setSummary] = useState<AnalysisSummary | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [insight, setInsight] = useState<string | null>(null);

  const geoJsonData = useMemo(() => buildGeoJson(incidents), [incidents]);

  const getGeminiInsight = async (
    analysis: AnalysisSummary,
  ): Promise<string | null> => {
    if (!GEMINI_API_KEY) return null;

    const prompt = [
      "You are an environmental analyst.",
      "Create a concise 4-line analysis from deforestation detection output.",
      "Include risk level, likely pattern, and one action recommendation.",
      `Total loss area (ha): ${analysis.totalLossHa.toFixed(2)}`,
      `Incident count: ${analysis.incidentCount}`,
      `Critical: ${analysis.bySeverity.critical}, High: ${analysis.bySeverity.high}, Medium: ${analysis.bySeverity.medium}, Low: ${analysis.bySeverity.low}`,
    ].join("\n");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      },
    );

    if (!response.ok) return null;
    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  };

  const analyze = async () => {
    if (!bbox) {
      alert("Draw an area on the map first.");
      return;
    }

    setIsProcessing(true);
    setTaskStatus("QUEUING ANALYSIS...");
    setSummary(null);
    setIncidents([]);
    setInsight(null);

    try {
      const { job_id } = await api.analyze({
        bbox,
        date_t0: date1,
        date_t1: date2,
        threshold,
      });

      const pollOnce = async () => {
        try {
          const task = await api.getJobStatus(job_id);
          if (task.stage) setTaskStatus(task.stage.toUpperCase());

          if (task.status === "done") {
            const rows = await api.getIncidents(job_id);
            const result = summarizeIncidents(
              rows,
              task.summary?.total_area_ha || 0,
            );
            setIncidents(rows);
            setSummary(result);

            if (rows.length > 0) {
              setTaskStatus(
                `COMPLETE: ${result.incidentCount} INCIDENTS, ${result.totalLossHa.toFixed(2)} HA`,
              );
            } else if (result.totalLossHa > 0) {
              setTaskStatus(
                `COMPLETE: DIFFUSE LOSS ${result.totalLossHa.toFixed(2)} HA`,
              );
            } else {
              setTaskStatus("COMPLETE: NO SIGNIFICANT LOSS DETECTED");
            }

            const aiText = await getGeminiInsight(result);
            if (aiText) setInsight(aiText);

            setIsProcessing(false);
            setTimeout(() => setTaskStatus(null), 5000);
            return;
          }

          if (task.status === "error") {
            setTaskStatus(`ERROR: ${task.error || "Unknown backend error"}`);
            setIsProcessing(false);
            return;
          }

          setTimeout(pollOnce, 2000);
        } catch {
          setTaskStatus("POLLING ERROR. RETRYING...");
          setTimeout(pollOnce, 3000);
        }
      };

      void pollOnce();
    } catch (err) {
      console.error(err);
      setTaskStatus("FAILED TO START ANALYSIS");
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="border border-border/50 bg-[#060a11]/80 p-4 flex flex-col gap-4">
        <div className="flex flex-wrap items-end gap-3 justify-between">
          <div className="font-display text-sm text-primary tracking-widest">
            SEVERITY ANALYSIS MAP
          </div>
          <div className="text-[10px] font-mono text-muted-foreground">
            Draw bbox then run analysis
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
              Date Start
            </span>
            <input
              type="date"
              value={date1}
              onChange={(e) => setDate1(e.target.value)}
              className="bg-black/40 border border-border/50 font-mono text-[11px] text-white px-2 py-1 outline-none focus:border-primary w-32"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
              Date End
            </span>
            <input
              type="date"
              value={date2}
              onChange={(e) => setDate2(e.target.value)}
              className="bg-black/40 border border-border/50 font-mono text-[11px] text-white px-2 py-1 outline-none focus:border-danger w-32"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
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
            onClick={analyze}
            disabled={isProcessing || !bbox}
            className="bg-primary/10 border border-primary text-primary hover:bg-primary hover:text-black font-display text-[11px] tracking-widest px-6 h-8 flex items-center transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isProcessing ? "PROCESSING..." : "RUN SEVERITY ANALYSIS"}
          </button>
        </div>

        <div className="flex flex-wrap gap-4 text-[10px] font-mono">
          <div className="px-2 py-1 border border-red-500/60 text-red-400 bg-red-900/20">
            CRITICAL: RED
          </div>
          <div className="px-2 py-1 border border-orange-500/60 text-orange-300 bg-orange-900/20">
            HIGH: ORANGE
          </div>
          <div className="px-2 py-1 border border-yellow-500/60 text-yellow-300 bg-yellow-900/20">
            MEDIUM: YELLOW
          </div>
          <div className="px-2 py-1 border border-green-500/60 text-green-300 bg-green-900/20">
            LOW: GREEN
          </div>
        </div>
      </div>

      <div className="flex-1 relative border border-border/50 bg-black">
        {taskStatus && (
          <div className="absolute top-4 left-4 z-[500] bg-black/90 border border-primary/50 text-white p-3 font-mono text-xs tracking-widest flex items-center gap-3">
            <Activity className="h-4 w-4 text-primary animate-pulse" />
            {taskStatus}
          </div>
        )}

        <DeforestationMap
          center={[0, 0]}
          zoom={2}
          geoJsonData={geoJsonData}
          onBboxDrawn={setBbox}
          title="SEVERITY MAP VIEW"
          useSeverityColors
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border border-border/50 bg-[#060a11]/80 p-4 font-mono text-xs">
          <div className="text-primary mb-3 tracking-widest">
            ANALYSIS SUMMARY
          </div>
          <div className="space-y-2 text-muted-foreground">
            <div>
              Total Loss:{" "}
              <span className="text-white">
                {summary ? `${summary.totalLossHa.toFixed(2)} ha` : "-"}
              </span>
            </div>
            <div>
              Incidents:{" "}
              <span className="text-white">
                {summary?.incidentCount ?? "-"}
              </span>
            </div>
            <div>
              Critical:{" "}
              <span className="text-red-400">
                {summary?.bySeverity.critical ?? 0}
              </span>
            </div>
            <div>
              High:{" "}
              <span className="text-orange-300">
                {summary?.bySeverity.high ?? 0}
              </span>
            </div>
            <div>
              Medium:{" "}
              <span className="text-yellow-300">
                {summary?.bySeverity.medium ?? 0}
              </span>
            </div>
            <div>
              Low:{" "}
              <span className="text-green-300">
                {summary?.bySeverity.low ?? 0}
              </span>
            </div>
          </div>
        </div>

        <div className="border border-border/50 bg-[#060a11]/80 p-4 font-mono text-xs">
          <div className="text-primary mb-3 tracking-widest flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> AI INSIGHT
          </div>
          {GEMINI_API_KEY ? (
            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {insight || "Run analysis to generate AI insight."}
            </p>
          ) : (
            <p className="text-muted-foreground leading-relaxed">
              Gemini API key not configured. Add `VITE_GEMINI_API_KEY` in
              `CLIENT/client/.env` to enable AI summary.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
