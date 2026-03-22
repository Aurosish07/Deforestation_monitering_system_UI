import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Flag, Bell, TrendingDown, AlertTriangle } from "lucide-react";
import { Button } from "../components/ui/button";
import { BeforeAfterSlider } from "../components/BeforeAfterSlider";
import { NDVIChart } from "../components/NDVIChart";
import { useToast } from "../hooks/use-toast";

// Simulated before/after images from placehold
const BEFORE_IMG = "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80";
const AFTER_IMG = "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80";

interface Incident {
  id: string;
  name: string;
  location: string;
  area: number; // ha
  severity: "low" | "medium" | "high" | "critical";
  date: string;
  coords: [number, number];
}

interface IncidentModalProps {
  incident: Incident | null;
  onClose: () => void;
}

const severityConfig = {
  low: { label: "Low", className: "bg-forest/20 text-forest" },
  medium: { label: "Medium", className: "bg-accent/20 text-accent" },
  high: { label: "High", className: "bg-orange-500/20 text-orange-400" },
  critical: { label: "Critical", className: "bg-danger/20 text-danger" },
};

export function IncidentModal({ incident, onClose }: IncidentModalProps) {
  const { toast } = useToast();

  if (!incident) return null;

  const handleDownloadGeoJSON = () => {
    const geoJSON = {
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [incident.coords[1], incident.coords[0]],
        },
        properties: {
          name: incident.name,
          area_ha: incident.area,
          severity: incident.severity,
          date: incident.date,
        },
      }],
    };
    const blob = new Blob([JSON.stringify(geoJSON, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `incident-${incident.id}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "GeoJSON downloaded", description: `${incident.name} data saved.` });
  };

  const handleFlagFalsePositive = () => {
    toast({
      title: "Flagged as false positive",
      description: "This incident has been marked for review.",
      variant: "default",
    });
    onClose();
  };

  const handleSendAlert = () => {
    toast({
      title: "✅ Alert sent to stakeholders",
      description: `Deforestation alert for ${incident.name} has been dispatched.`,
    });
  };

  const sev = severityConfig[incident.severity];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-md"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.94, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.94, y: 20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative w-full max-w-3xl rounded-2xl border border-border bg-card shadow-card overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-start justify-between gap-4 bg-card/95 backdrop-blur-sm border-b border-border p-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-danger" />
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sev.className}`}>
                  {sev.label} Severity
                </span>
              </div>
              <h2 className="font-display text-xl font-bold">{incident.name}</h2>
              <p className="text-sm text-muted-foreground">{incident.location} · {incident.date}</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Area Affected", value: `${incident.area.toLocaleString()} ha`, icon: "🌲" },
                { label: "NDVI Drop", value: "−0.52", icon: "📉" },
                { label: "CO₂ Impact", value: `${(incident.area * 2.4).toFixed(0)}t`, icon: "💨" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-border bg-muted/30 p-3 text-center">
                  <div className="text-xl mb-1">{stat.icon}</div>
                  <p className="font-display font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Before / After Slider */}
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Before / After Comparison — drag slider
              </p>
              <div className="h-64 rounded-xl overflow-hidden border border-border">
                <BeforeAfterSlider
                  beforeSrc={BEFORE_IMG}
                  afterSrc={AFTER_IMG}
                  beforeLabel="2020 — Dense Forest"
                  afterLabel="2024 — Cleared"
                />
              </div>
            </div>

            {/* NDVI Chart */}
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-danger" />
                NDVI Trend — Vegetation Health Index
              </p>
              <div className="h-48 rounded-xl border border-border bg-muted/20 p-3">
                <NDVIChart />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 pt-1">
              <Button
                onClick={handleSendAlert}
                className="bg-gradient-danger border-0 shadow-danger font-display flex-1 min-w-[140px]"
              >
                <Bell className="mr-2 h-4 w-4" />
                Send Alert
              </Button>
              <Button
                onClick={handleDownloadGeoJSON}
                variant="outline"
                className="border-primary/40 hover:bg-primary/10 text-foreground flex-1 min-w-[140px]"
              >
                <Download className="mr-2 h-4 w-4" />
                Download GeoJSON
              </Button>
              <Button
                onClick={handleFlagFalsePositive}
                variant="outline"
                className="border-muted-foreground/30 hover:bg-muted/50 text-muted-foreground flex-1 min-w-[140px]"
              >
                <Flag className="mr-2 h-4 w-4" />
                Flag False Positive
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
