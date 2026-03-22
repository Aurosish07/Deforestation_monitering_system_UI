import { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';

const DEFORESTATION_DATA = [
  { lat: -3.4653, lng: -62.2159, size: 0.1, color: '#ff3333' }, // Amazon
  { lat: -0.7893, lng: 113.9213, size: 0.1, color: '#ff3333' }, // Borneo
  { lat: -1.3813, lng: 20.3209, size: 0.08, color: '#ff3333' }, // Congo
  { lat: -3.8378, lng: 101.4468, size: 0.05, color: '#ff3333' }, // Sumatra
  { lat: 61.524, lng: 105.3188, size: 0.06, color: '#ff3333' }, // Siberia
  { lat: 56.1304, lng: -106.3468, size: 0.04, color: '#ff3333' }, // Canada
];

export default function EarthGlobe() {
  const globeRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    // Initial point of view centered roughly on Amazon
    if (globeRef.current) {
      globeRef.current.pointOfView({ lat: 10, lng: -40, altitude: 2.5 }, 1000);
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.8;
      globeRef.current.controls().enableZoom = false; // Disable zoom so it doesn't break layout by accident
    }

    // Delay setting POV again just in case dimensions take a bit to settle
    const timeoutMsg = setTimeout(() => {
        if (globeRef.current) {
            globeRef.current.controls().autoRotate = true;
            globeRef.current.controls().autoRotateSpeed = 0.8;
        }
    }, 500);

    return () => {
      window.removeEventListener('resize', updateDimensions);
      clearTimeout(timeoutMsg);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing pb-8 lg:pb-0"
    >
      {dimensions.width > 0 && (
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          pointsData={DEFORESTATION_DATA}
          pointAltitude="size"
          pointColor="color"
          pointRadius={1}
          backgroundColor="rgba(0,0,0,0)"
          atmosphereColor="#ffffff"
          atmosphereAltitude={0.15}
        />
      )}
    </div>
  );
}
