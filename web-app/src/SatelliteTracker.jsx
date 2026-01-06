import React, { useState, useEffect, useCallback } from 'react';
import { Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import * as satellite from 'satellite.js';
import { Orbit, Info, Radio, Zap, Navigation } from 'lucide-react';

const SatelliteTracker = ({ enabled, group = "active", apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000" }) => {
  const [satellites, setSatellites] = useState([]);
  const [selectedSat, setSelectedSat] = useState(null);
  const [positions, setPositions] = useState({});
  const [orbits, setOrbits] = useState({});
  const [loading, setLoading] = useState(false);
  const map = useMap();

  // Highlighted satellites of interest
  const INTEREST_IDS = [
    25544, // ISS
    20580, // Hubble
    40069, // Meteor-M No.2
    33331, // GeoEye 1
    40697, // Sentinel-2A
    42063, // Sentinel-2B
    39084, // Landsat 8
    49260, // Landsat 9
    43013, // Sentinel-1B
  ];

  const fetchTLEFormat = async () => {
    setLoading(true);
    try {
      console.log(`🛰️ Orbital Uplink: Contacting mission control for [${group}] group...`);
      const response = await fetch(`${apiUrl}/satellites?group=${group}`);
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const text = await response.text();
      // Handle potential empty response
      if (!text || text.trim().length === 0) {
        console.warn("⚠️ Satellite cloud empty. Retrying connection...");
        return;
      }

      // Split by any newline, trim, and filter valid lines (preserving groups of 3)
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
      const parsedSats = [];

      console.log(`📡 Satellite Data Stream: ${lines.length} packets detected.`);

      // Robust 3-line parsing: [Name, Line1, Line2]
      for (let i = 0; i < lines.length - 2; i++) {
        const name = lines[i];
        const l1 = lines[i + 1];
        const l2 = lines[i + 2];

        // Validate TLE signature (Line 1 starts with '1 ', Line 2 starts with '2 ')
        if (l1.startsWith('1 ') && l2.startsWith('2 ')) {
          const noradId = parseInt(l1.substring(2, 7));

          // Load targeted interest ids or first 150 identified objects
          if (INTEREST_IDS.includes(noradId) || (parsedSats.length < 150)) {
            parsedSats.push({
              OBJECT_NAME: name,
              TLE_LINE1: l1,
              TLE_LINE2: l2,
              NORAD_CAT_ID: noradId
            });
          }
          i += 2; // Jump past processed TLE lines
        }
      }

      console.log(`✅ Orbital Synchronization Complete: ${parsedSats.length} objects online.`);
      setSatellites(parsedSats);
    } catch (e) {
      console.error("❌ Orbital Link Interrupted:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (enabled) {
      fetchTLEFormat();
    }
  }, [enabled, apiUrl, group]);

  const calculateVelocity = (v) => {
    if (!v) return "0.00";
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z).toFixed(2);
  };

  const updatePositions = useCallback(() => {
    if (!satellites.length) return;

    const newPositions = {};
    const now = new Date();

    satellites.forEach(sat => {
      try {
        const satrec = satellite.twoline2satrec(sat.TLE_LINE1, sat.TLE_LINE2);
        const positionAndVelocity = satellite.propagate(satrec, now);

        if (positionAndVelocity.position) {
          const gmst = satellite.gstime(now);
          const positionGd = satellite.eciToGeodetic(positionAndVelocity.position, gmst);

          const longitude = satellite.degreesLong(positionGd.longitude);
          const latitude = satellite.degreesLat(positionGd.latitude);
          const altitude = positionGd.height; // km

          // --- Precision Orbital Level Filtering (Calibrated to Mission Spec) ---
          let isLevelMatch = true;
          if (group === 'active') { // LEO Mode
            isLevelMatch = altitude >= 160 && altitude <= 1200;
          } else if (group === 'gps-ops') { // MEO Mode
            isLevelMatch = altitude >= 2000 && altitude <= 25000;
          } else if (group === 'geo') { // GEO Mode
            isLevelMatch = altitude >= 34000 && altitude <= 38000;
          } else if (group === 'military') { // Military Stratosphere
            isLevelMatch = altitude < 2000 || (altitude > 19000 && altitude < 22000); // LEO Recon or MEO Nav
          }

          if (!isNaN(latitude) && !isNaN(longitude) && isLevelMatch) {
            newPositions[sat.NORAD_CAT_ID] = {
              lat: latitude,
              lng: longitude,
              alt: altitude,
              velocity: calculateVelocity(positionAndVelocity.velocity)
            };
          }
        }
      } catch (e) {
        // Silently skip corrupted satrecs
      }
    });

    setPositions(newPositions);
  }, [satellites, group]);

  useEffect(() => {
    if (!enabled || satellites.length === 0) return;
    const interval = setInterval(updatePositions, 1000);
    return () => clearInterval(interval);
  }, [enabled, satellites, updatePositions]);

  const calculateOrbit = (sat) => {
    try {
      const orbitPoints = [];
      const satrec = satellite.twoline2satrec(sat.TLE_LINE1, sat.TLE_LINE2);
      const now = new Date();

      // Calculate 1.5 orbits (approx 140 mins for LEO)
      for (let i = 0; i < 140; i += 2) {
        const time = new Date(now.getTime() + i * 60000);
        const positionAndVelocity = satellite.propagate(satrec, time);
        if (positionAndVelocity.position) {
          const gmst = satellite.gstime(time);
          const positionGd = satellite.eciToGeodetic(positionAndVelocity.position, gmst);
          orbitPoints.push([
            satellite.degreesLat(positionGd.latitude),
            satellite.degreesLong(positionGd.longitude)
          ]);
        }
      }

      // Handle wrap around for the line
      const segments = [];
      let currentSegment = [];
      for (let i = 0; i < orbitPoints.length; i++) {
        if (i > 0 && Math.abs(orbitPoints[i][1] - orbitPoints[i - 1][1]) > 180) {
          segments.push(currentSegment);
          currentSegment = [];
        }
        currentSegment.push(orbitPoints[i]);
      }
      segments.push(currentSegment);

      setOrbits(prev => ({ ...prev, [sat.NORAD_CAT_ID]: segments }));
    } catch (e) {
      console.error("Orbit calculation failed", e);
    }
  };

  const getSatIcon = (name) => {
    let color = "#3b82f6"; // Default blue
    if (name.includes('ISS')) color = "#ef4444";
    if (name.includes('STARLINK')) color = "#3b82f6";
    if (name.includes('SENTINEL') || name.includes('LANDSAT')) color = "#fbbf24";

    return L.divIcon({
      className: 'custom-sat-icon',
      html: `
        <div style="
          width: 12px; 
          height: 12px; 
          background-color: ${color}; 
          border: 2px solid white; 
          border-radius: 50%;
          box-shadow: 0 0 10px ${color};
          display: flex;
          align-items: center;
          justify-content: center;
        ">
        </div>
      `,
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });
  };

  if (!enabled) return null;

  return (
    <>
      {satellites.map(sat => {
        const pos = positions[sat.NORAD_CAT_ID];
        if (!pos) return null;

        return (
          <React.Fragment key={sat.NORAD_CAT_ID}>
            <Marker
              position={[pos.lat, pos.lng]}
              icon={getSatIcon(sat.OBJECT_NAME)}
              eventHandlers={{
                click: () => {
                  setSelectedSat(sat);
                  calculateOrbit(sat);
                }
              }}
            >
              <Popup className="sat-popup">
                <div className="p-2 min-w-[200px] bg-[#0f0f0f] text-white rounded-lg border border-white/10">
                  <div className="flex items-center gap-2 mb-2 border-b border-white/10 pb-2">
                    <Navigation className="w-4 h-4 text-blue-400" />
                    <h3 className="font-bold text-sm truncate">{sat.OBJECT_NAME}</h3>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-white/40 uppercase tracking-tighter">NORAD ID</span>
                      <span className="font-mono text-blue-400">{sat.NORAD_CAT_ID}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40 uppercase tracking-tighter">Altitude</span>
                      <span>{pos.alt?.toFixed(1) || "0.0"} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40 uppercase tracking-tighter">Velocity</span>
                      <span>{pos.velocity} km/s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40 uppercase tracking-tighter">Position</span>
                      <span className="font-mono">{pos.lat.toFixed(2)}°, {pos.lng.toFixed(2)}°</span>
                    </div>

                    {/* Mission Data from Reference Table */}
                    <div className="pt-2 mt-2 border-t border-white/5 space-y-1">
                      <div className="text-[9px] text-white/30 uppercase font-black tracking-widest">Orbit Character</div>
                      <p className="text-[10px] text-blue-300 leading-tight">
                        {group === 'active' && "Fast orbit (90-120m), High-freq region pass."}
                        {group === 'gps-ops' && "Slower orbit (2-12hr), Nav-sync optimized."}
                        {group === 'geo' && "Geostationary, 24hr period. Static position."}
                        {group === 'military' && "Tactical Polar Orbit / KH-11 Recon Class."}
                        {group === 'resource' && "Earth observation optimized for imaging."}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      map.flyTo([pos.lat, pos.lng], 6);
                    }}
                    className="w-full mt-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-[10px] font-bold uppercase transition-colors"
                  >
                    Track Orbit
                  </button>
                </div>
              </Popup>
            </Marker>

            {selectedSat?.NORAD_CAT_ID === sat.NORAD_CAT_ID && orbits[sat.NORAD_CAT_ID] && (
              orbits[sat.NORAD_CAT_ID].map((segment, idx) => (
                <Polyline
                  key={`${sat.NORAD_CAT_ID}-${idx}`}
                  positions={segment}
                  pathOptions={{
                    color: '#3b82f6',
                    weight: 2,
                    dashArray: '5, 10',
                    opacity: 0.6
                  }}
                />
              ))
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};

export default SatelliteTracker;
