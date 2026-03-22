import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";

interface DeforestationMapProps {
  center?: [number, number];
  zoom?: number;
  geoJsonData?: any; // the incidents geojson from backend
  onBboxDrawn?: (bbox: [number, number, number, number] | null) => void;
  onIncidentClick?: (id: string) => void;
  title?: string;
  useSeverityColors?: boolean;
}

export function DeforestationMap({
  center = [0, 0],
  zoom = 2,
  geoJsonData,
  onBboxDrawn,
  onIncidentClick,
  title,
  useSeverityColors = false,
}: DeforestationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const rectangleDrawerRef = useRef<L.Draw.Rectangle | null>(null);

  const drawShapeOptions: L.PathOptions = {
    color: "#f97316",
    weight: 3,
    fillColor: "#f97316",
    fillOpacity: 0.2,
    dashArray: "8 6",
  };

  // Initialise map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center,
      zoom,
      zoomControl: false,
      attributionControl: false,
    });

    // 1. Esri World Imagery (Satellite)
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { attribution: "Tiles © Esri" },
    ).addTo(map);

    // 2. Setup leaflet-draw feature group
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    drawnItemsRef.current = drawnItems;

    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup: drawnItems,
      },
      draw: {
        polygon: false,
        polyline: false,
        circle: false,
        circlemarker: false,
        marker: false,
        rectangle: {
          shapeOptions: drawShapeOptions,
        },
      },
    });

    map.addControl(drawControl);

    const rectangleDrawer = new L.Draw.Rectangle(map, {
      shapeOptions: drawShapeOptions,
    });
    rectangleDrawerRef.current = rectangleDrawer;

    // Auto-enable rectangle mode so users can drag-to-select immediately.
    setTimeout(() => {
      rectangleDrawer.enable();
    }, 200);

    // 3. Handle draw events
    map.on(L.Draw.Event.CREATED, (e: any) => {
      const layer = e.layer;
      drawnItems.clearLayers(); // Only allow one bbox at a time
      drawnItems.addLayer(layer);

      const bounds = layer.getBounds();

      // Auto-expand tiny point-clicks so they form a proper ~500m bounding box
      let w = bounds.getWest();
      let s = bounds.getSouth();
      let e_lon = bounds.getEast();
      let n = bounds.getNorth();

      const MIN_SPAN = 0.005; // ~500m
      if (Math.abs(e_lon - w) < MIN_SPAN) {
        const mid = (w + e_lon) / 2;
        w = mid - MIN_SPAN / 2;
        e_lon = mid + MIN_SPAN / 2;
      }
      if (Math.abs(n - s) < MIN_SPAN) {
        const mid = (s + n) / 2;
        s = mid - MIN_SPAN / 2;
        n = mid + MIN_SPAN / 2;
      }

      // bbox format: [minLng, minLat, maxLng, maxLat]
      if (onBboxDrawn) {
        onBboxDrawn([w, s, e_lon, n]);
      }
    });

    map.on(L.Draw.Event.DELETED, () => {
      if (onBboxDrawn) onBboxDrawn(null);
    });

    mapRef.current = map;

    // Tactical UI requires map to respond to flex/panel resizing instantly
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update view when center/zoom changes
  useEffect(() => {
    mapRef.current?.setView(center, zoom, { animate: true });
  }, [center, zoom]);

  // Update GeoJSON representation when data arrives from backend
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old geojson layer
    if (geojsonLayerRef.current) {
      map.removeLayer(geojsonLayerRef.current);
      geojsonLayerRef.current = null;
    }

    if (
      geoJsonData &&
      geoJsonData.features &&
      geoJsonData.features.length > 0
    ) {
      const geojsonLayer = L.geoJSON(geoJsonData, {
        style: (feature) => {
          const severity = feature?.properties?.severity;
          const areaHa = Number(feature?.properties?.area_ha || 0);

          if (useSeverityColors) {
            let color = "#22c55e"; // low
            if (severity === "critical" || areaHa >= 20) color = "#ef4444";
            else if (severity === "high" || areaHa >= 10) color = "#f97316";
            else if (severity === "medium" || areaHa >= 2) color = "#facc15";
            return {
              color,
              fillColor: color,
              fillOpacity: 0.45,
              weight: 2,
            };
          }

          return {
            color: "#ef4444",
            fillColor: "#ef4444",
            fillOpacity: 0.4,
            weight: 2,
          };
        },
        onEachFeature: (feature, layer) => {
          if (feature.properties && feature.properties.id) {
            layer.on("click", () => {
              if (onIncidentClick) onIncidentClick(feature.properties.id);
            });
            layer.bindTooltip(
              `[${feature.properties.id}] SEVERITY: ${feature.properties.severity?.toUpperCase() || "UNKNOWN"}`,
              {
                className:
                  "bg-black text-primary border border-primary/50 font-mono text-[10px] rounded-none shadow-glow px-2 py-1",
                direction: "top",
              },
            );
          }
        },
      }).addTo(map);

      geojsonLayerRef.current = geojsonLayer;

      // Auto-fit to the newly generated data
      if (geojsonLayer.getBounds().isValid()) {
        map.fitBounds(geojsonLayer.getBounds(), {
          padding: [50, 50],
          maxZoom: 14,
        });
      }
    }
  }, [geoJsonData]);

  return (
    <div className="relative w-full h-full overflow-hidden border border-border/50">
      <button
        type="button"
        onClick={() => rectangleDrawerRef.current?.enable()}
        className="absolute top-3 left-3 z-[450] bg-black/85 border border-orange-400/60 text-orange-300 hover:bg-orange-400/20 hover:text-orange-200 px-3 py-1 font-mono text-[10px] tracking-widest shadow-glow"
      >
        DRAG TO SELECT AREA
      </button>
      {title && (
        <div className="absolute top-3 right-3 z-[400] bg-black/80 border border-primary/50 text-white shadow-glow px-4 py-2 font-mono text-xs font-bold pointer-events-none uppercase tracking-widest flex flex-col items-end gap-1">
          <span className="text-primary">{title}</span>
          <span className="text-[10px] text-muted-foreground">
            SATELLITE IMAGERY © ESRI
          </span>
        </div>
      )}
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}
