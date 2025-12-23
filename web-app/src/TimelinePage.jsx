// Dedicated Timeline Page Component
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { ArrowLeft, ArrowRight, Play, Pause, Clock as ClockIcon, X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const API_URL = "http://localhost:8000";

const TimelinePage = () => {
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
  const [locationName, setLocationName] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [timelineData, setTimelineData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef(null);

  // Parse URL parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const lat = params.get('lat');
    const lon = params.get('lon');
    const name = params.get('name');

    if (lat && lon) {
      setMapCenter([parseFloat(lat), parseFloat(lon)]);
      setLocationName(decodeURIComponent(name || 'Selected Location'));
    } else {
      // Fallback to user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setMapCenter([latitude, longitude]);
            setLocationName('Your Location');
          },
          (error) => {
            console.error("Error getting location:", error);
            setLocationName('Default Location');
          }
        );
      }
    }
  }, []);

  useEffect(() => {
    const fetchTimeline = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/timeline/${mapCenter[0]}/${mapCenter[1]}`);
        const data = await response.json();
        if (data.status === 'success') {
          setTimelineData(data.timeline);
        }
      } catch (err) {
        console.error("Timeline fetch failed:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTimeline();
  }, [mapCenter]);

  useEffect(() => {
    let interval;
    if (isAutoplay && timelineData) {
      interval = setInterval(() => {
        const years = Object.keys(timelineData).sort((a, b) => a - b);
        const currentIndex = years.indexOf(selectedYear.toString());
        const nextIndex = (currentIndex + 1) % years.length;
        setSelectedYear(parseInt(years[nextIndex]));
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isAutoplay, timelineData, selectedYear]);

  return (
    <div className="relative h-screen w-full bg-[#0a0a0a] overflow-hidden">
      {/* Map */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={mapCenter}
          zoom={14}
          maxZoom={20}
          style={{ height: "100%", width: "100%" }}
          ref={mapRef}
          zoomControl={false}
        >
          <TileLayer
            attribution="&copy; Google"
            url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
            subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
            opacity={1}
            maxZoom={20}
            className={
              selectedYear < 2010
                ? "sepia-filter"
                : selectedYear < 2018
                  ? "contrast-filter"
                  : ""
            }
          />
        </MapContainer>
      </div>

      {/* Timeline Controls - Top of Page */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-2xl border-b border-white/20 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500/20 p-3 rounded-full">
                <ClockIcon className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Historical Satellite Timeline</h1>
                <p className="text-sm text-white/50">
                  {locationName ? `Viewing: ${locationName}` : 'Explore satellite imagery from 2000 to present'}
                </p>
              </div>
            </div>
            <button
              onClick={() => window.close()}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all"
            >
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>

          {/* Timeline Bar */}
          <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <div className="flex items-center gap-6">
              {/* Autoplay Button */}
              <button
                onClick={() => setIsAutoplay(!isAutoplay)}
                className={`p-3 rounded-full transition-all ${isAutoplay
                  ? "bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                  : "text-white/40 hover:text-white hover:bg-white/5"
                  }`}
                title={isAutoplay ? "Pause Autoplay" : "Auto-Play Timeline"}
              >
                {isAutoplay ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              {/* Previous Year */}
              <button
                onClick={() => setSelectedYear(prev => Math.max(2000, prev - 1))}
                className="p-2 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors"
                disabled={isAutoplay}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              {/* Current Year Display */}
              <div className="min-w-[150px] text-center">
                <div className="text-3xl font-black text-blue-400 tracking-tight">{selectedYear}</div>
                <div className="text-xs text-white/40 uppercase tracking-widest mt-1">
                  {timelineData?.[selectedYear]?.metadata?.sensor || "Loading..."}
                </div>
              </div>

              {/* Next Year */}
              <button
                onClick={() => setSelectedYear(prev => Math.min(new Date().getFullYear(), prev + 1))}
                className="p-2 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors"
                disabled={isAutoplay}
              >
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* Timeline Slider */}
              <div className="flex-1 relative h-12 flex items-center px-4">
                <div className="absolute inset-x-4 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]"
                    style={{ width: `${((selectedYear - 2000) / (new Date().getFullYear() - 2000)) * 100}%` }}
                  />
                </div>
                <input
                  type="range"
                  min="2000"
                  max={new Date().getFullYear()}
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="absolute inset-x-4 w-[calc(100%-32px)] opacity-0 cursor-pointer z-10 h-12"
                />
                <div className="absolute inset-x-4 flex justify-between pointer-events-none">
                  {[2000, 2005, 2010, 2015, 2020, 2024].map(y => (
                    <div key={y} className="flex flex-col items-center">
                      <div className={`w-1 h-1 rounded-full mb-6 ${selectedYear >= y ? "bg-blue-400" : "bg-white/20"}`} />
                      <span className="text-[9px] font-bold text-white/30 uppercase tracking-tighter">{y}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Metadata Display */}
          {timelineData?.[selectedYear]?.metadata && (
            <div className="mt-4 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-white/60">Provider:</span>
                <span className="text-white font-bold">{timelineData[selectedYear].metadata.provider}</span>
              </div>
              <div className="w-px h-4 bg-white/20" />
              <div className="flex items-center gap-2">
                <span className="text-white/60">Resolution:</span>
                <span className="text-white font-bold">{timelineData[selectedYear].metadata.resolution}</span>
              </div>
              <div className="w-px h-4 bg-white/20" />
              <div className="flex items-center gap-2">
                <span className="text-white/60">Date:</span>
                <span className="text-white font-bold">{timelineData[selectedYear].metadata.date}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="text-white text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm uppercase tracking-widest">Loading Timeline...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelinePage;
