import { DeforestationMap } from "../DeforestationMap";

export function MapPanel({ bbox, setBbox, incidents, layers, onIncidentSelect }: any) {

    // Generate valid GeoJSON FeatureCollection dynamically from the mock incidents feed
    const geoJsonData = (layers.polygons && incidents.length > 0) ? {
        type: "FeatureCollection",
        features: incidents.map((inc: any) => ({
            type: "Feature",
            geometry: inc.geometry,
            properties: {
                id: inc.id,
                area_ha: inc.area_ha,
                confidence: inc.confidence,
                severity: inc.severity
            }
        }))
    } : null;

    return (
        <div className="w-full h-full relative group">
            <DeforestationMap
                center={bbox ? [(bbox[1] + bbox[3]) / 2, (bbox[0] + bbox[2]) / 2] : [0, 0]}
                zoom={bbox ? 6 : 2}
                geoJsonData={geoJsonData}
                onBboxDrawn={setBbox}
                onIncidentClick={onIncidentSelect}
                title="SATELLITE INTELLIGENCE"
            />

            {/* Optional Heatmap Overlay Simulation */}
            {layers.heatmap && (
                <div className="absolute inset-0 pointer-events-none z-[450] mix-blend-screen opacity-30 bg-[radial-gradient(ellipse_at_center,_rgba(6,182,212,0.5)_0%,_rgba(0,0,0,0)_60%)] transition-opacity duration-1000" />
            )}
        </div>
    );
}
