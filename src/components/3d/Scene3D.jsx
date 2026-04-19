import React, { useState, useEffect, useRef } from 'react';
import Globe from 'react-globe.gl';

const Scene3D = () => {
  const globeEl = useRef();
  const [arcsData, setArcsData] = useState([]);
  const [pointsData, setPointsData] = useState([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef();

  // Generate Data
  useEffect(() => {
    const N = 40;
    const arcs = [...Array(N).keys()].map(() => ({
      startLat: (Math.random() - 0.5) * 180,
      startLng: (Math.random() - 0.5) * 360,
      endLat: (Math.random() - 0.5) * 180,
      endLng: (Math.random() - 0.5) * 360,
      color: ['#00f3ff', '#ff6b00', '#facc15'][Math.floor(Math.random() * 3)]
    }));
    setArcsData(arcs);

    const points = [];
    arcs.forEach(arc => {
      points.push({ lat: arc.startLat, lng: arc.startLng, color: arc.color });
      points.push({ lat: arc.endLat, lng: arc.endLng, color: arc.color });
    });
    setPointsData(points);
  }, []);

  // Setup Resize Observer
  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        if (!entries || !entries.length) return;
        const { width, height } = entries[0].contentRect;
        setDimensions({ width, height });
      });
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  // Setup Globe Controls
  useEffect(() => {
    if (globeEl.current && dimensions.width > 0) {
      // Access the internal OrbitControls
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 1.2;
      globeEl.current.controls().enableZoom = false;
      
      // Point the camera a bit further out
      globeEl.current.pointOfView({ altitude: 2.2 });
    }
  }, [dimensions.width]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* Deep space radial gradient background */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at center, #020813 0%, #000000 100%)', zIndex: -1 }}></div>
      
      {/* Wait for dimensions to render the globe so it sizes perfectly */}
      {dimensions.width > 0 && (
        <Globe
          ref={globeEl}
          width={dimensions.width}
          height={dimensions.height}
          
          // Globe Assets (Dark continent map with topology)
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          
          // Transparent background to let CSS gradient show through
          backgroundColor="rgba(0,0,0,0)"
          
          // Atmosphere (Cyan Halo)
          atmosphereColor="#00f3ff"
          atmosphereAltitude={0.25}
          
          // Animated Arcs
          arcsData={arcsData}
          arcColor="color"
          arcDashLength={0.4}
          arcDashGap={2}
          arcDashInitialGap={() => Math.random() * 5}
          arcDashAnimateTime={2500}
          arcStroke={0.5}
          
          // City Nodes
          pointsData={pointsData}
          pointColor="color"
          pointAltitude={0.01}
          pointRadius={0.05}
          pointsMerge={true}
        />
      )}
    </div>
  );
};

export default Scene3D;
