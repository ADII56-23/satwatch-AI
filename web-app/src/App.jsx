import React, { useState, useRef, useEffect } from 'react';
import { Upload, ArrowRight, ArrowLeft, Loader2, Map as MapIcon, Layers, Eye, EyeOff, Lock, Mail, FileImage, CheckCircle, AlertCircle, ScanLine, X, Globe, User, History as HistoryIcon, Phone, Menu, ChevronRight, ChevronDown, Download, Trash2, Calendar, RotateCcw, Search, Bell, MapPin, Clock, MoreVertical, Play, Pause, Orbit, Navigation, Info, Radio, Zap, ShieldCheck, Target, Facebook, Linkedin, Instagram, Youtube, Twitter, ChevronUp, Camera, Pencil } from 'lucide-react';
import SatelliteTracker from './SatelliteTracker';
import TimelinePage from './TimelinePage';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MapContainer, TileLayer, GeoJSON, Rectangle, Circle, Marker, useMap, ImageOverlay, Pane, useMapEvents, Polyline, Polygon, LayerGroup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Assets & Icons Setup ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// --- Utility Components ---
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const Navbar = ({ activePage, setPage, user, onLogout }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = ['Home', 'Analyse', 'Live', 'Track', 'Dashboard', 'Contact Us'];

  return (
    <>
      <nav className={cn(
        "flex items-center justify-between px-4 md:px-8 py-5 fixed top-0 left-0 right-0 z-[100] transition-all duration-300",
        isScrolled ? "bg-black/80 backdrop-blur-xl border-b border-white/5 py-4" : "bg-transparent py-6"
      )}>
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer z-[110]" onClick={() => { setPage('landing'); setIsMobileMenuOpen(false); }}>
          <div className="bg-white p-1.5 rounded-full overflow-hidden w-8 h-8 md:w-10 md:h-10 flex items-center justify-center">
            <img src="/logo.png" className="w-full h-full object-contain" alt="SatWatch AI" />
          </div>
          <span className="text-lg md:text-xl font-bold tracking-tight text-white">SatWatch AI</span>
        </div>

        {/* Center Nav - Pill Shape (Desktop) */}
        <div className="hidden lg:flex items-center bg-white/10 backdrop-blur-md rounded-full px-2 py-1.5 border border-white/10">
          {menuItems.map((item) => {
            const slug = item.toLowerCase().replace(' ', '');
            const isActive = activePage === slug || (slug === 'home' && activePage === 'landing');

            return (
              <button
                key={item}
                onClick={() => setPage(slug === 'home' ? 'landing' : slug)}
                className={cn(
                  "px-4 xl:px-6 py-2 rounded-full text-sm font-medium transition-all duration-300",
                  isActive
                    ? "bg-white text-black shadow-lg"
                    : "text-white/80 hover:text-white hover:bg-white/5"
                )}
              >
                {item}
              </button>
            );
          })}
        </div>

        {/* Right Side - Auth & Hamburger */}
        <div className="flex items-center gap-2 md:gap-4 z-[110]">
          {!user ? (
            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={() => setPage('login')}
                className="hidden sm:block text-sm font-medium text-white/70 hover:text-white transition-colors"
              >
                Log in
              </button>
              <button
                onClick={() => setPage('register')}
                className="px-4 md:px-6 py-2 md:py-2.5 bg-white text-black rounded-full text-xs md:text-sm font-bold hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                Join
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end mr-2 text-right">
                <span className="text-[9px] font-black uppercase tracking-widest text-blue-400 leading-none mb-1">Active Mission</span>
                <span className="text-[11px] font-bold text-white/80 max-w-[100px] truncate">{user.email}</span>
              </div>

              <div className="relative group">
                <button className="w-10 h-10 md:w-12 md:h-12 bg-white/10 border border-white/20 rounded-full flex items-center justify-center hover:bg-white/20 transition-all overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-sm">
                    {user.email[0].toUpperCase()}
                  </div>
                </button>
                {/* Desktop Dropdown */}
                <div className="absolute right-0 top-14 w-48 bg-[#0f0f0f] border border-white/10 rounded-2xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 shadow-2xl backdrop-blur-xl hidden md:block">
                  <div className="p-3 border-b border-white/5 mb-2">
                    <p className="text-[10px] uppercase font-black text-white/20 tracking-widest">Logged in as</p>
                    <p className="text-xs font-bold truncate">{user.email}</p>
                  </div>
                  <button onClick={() => setPage('profile')} className="w-full flex items-center gap-3 px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                    <User className="w-4 h-4" /> Profile Info
                  </button>
                  <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={cn(
        "fixed inset-0 z-[90] bg-[#0a0a0a] transition-all duration-500 flex flex-col pt-32 px-8 lg:hidden",
        isMobileMenuOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-10"
      )}>
        <div className="flex flex-col gap-6">
          {menuItems.map((item, idx) => {
            const slug = item.toLowerCase().replace(' ', '');
            const isActive = activePage === slug || (slug === 'home' && activePage === 'landing');
            return (
              <button
                key={item}
                onClick={() => { setPage(slug === 'home' ? 'landing' : slug); setIsMobileMenuOpen(false); }}
                className={cn(
                  "text-3xl font-bold tracking-tighter text-left transition-all",
                  isActive ? "text-white translate-x-4" : "text-white/30 hover:text-white"
                )}
                style={{ transitionDelay: `${idx * 50}ms` }}
              >
                {item}
              </button>
            );
          })}
        </div>

        {user && (
          <div className="mt-auto mb-12 border-t border-white/10 pt-8 flex flex-col gap-4">
            <button onClick={() => { setPage('profile'); setIsMobileMenuOpen(false); }} className="flex items-center gap-4 text-white/60 text-xl font-bold">
              <User className="w-6 h-6" /> Profile Info
            </button>
            <button onClick={() => { onLogout(); setIsMobileMenuOpen(false); }} className="flex items-center gap-4 text-red-400 text-xl font-bold">
              Sign Out
            </button>
          </div>
        )}
      </div>
    </>
  );
};

const HeroLanding = ({ onStart }) => {
  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-white overflow-hidden flex flex-col pt-32">

      {/* Background Gradients/Glows */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 md:space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] md:text-xs font-medium tracking-wider text-blue-400">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            AI-POWERED SATELLITE ANALYSIS
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.9]">
            Seamless <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-white">
              Global Coverage
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/60 max-w-lg leading-relaxed">
            Detect infrastructure changes, deforestation, and urban expansion instantly with our military-grade AI models.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
            <button
              onClick={onStart}
              className="h-14 px-8 rounded-full bg-white text-black font-semibold text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 group"
            >
              Get started
              <div className="bg-black text-white rounded-full p-1 group-hover:rotate-45 transition-transform">
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
            <button className="h-14 px-8 rounded-full border border-white/20 hover:bg-white/5 font-medium transition-colors">
              View Demo
            </button>
          </div>

          <div className="flex items-center gap-[-10px] pt-8">
            <div className="flex -space-x-3">
              {/* {[1, 2, 3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-gray-600" />
              ))} */}
            </div>
            <div className="ml-4 text-sm font-medium">
              {/* <span className="text-white">120k+</span> <span className="text-white/50">users analysing Earth daily</span> */}
            </div>
          </div>
        </div>

        {/* Satellite Visual */}
        <div className="relative h-[600px] w-full hidden lg:flex items-center justify-center">
          {/* Decorative Rings */}
          <div className="absolute w-[500px] h-[500px] border border-white/5 rounded-full animate-[spin_10s_linear_infinite]" />
          <div className="absolute w-[600px] h-[600px] border border-dashed border-white/10 rounded-full animate-[spin_20s_linear_infinite_reverse]" />

          {/* Main Earth Circle */}
          <div className="relative w-[400px] h-[400px] rounded-full overflow-hidden border-4 border-white/10 shadow-[0_0_100px_rgba(59,130,246,0.3)] z-10 group bg-black">
            <img
              src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"
              alt="Earth Satellite"
              className="w-full h-full object-cover transform transition-transform duration-[2s] group-hover:scale-110"
            />
            {/* Shine/Gloss Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/40 pointer-events-none" />
          </div>

          {/* Floating Cards */}
          <div className="absolute top-1/4 right-0 z-20 bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10 animate-float shadow-xl">
            <div className="flex items-center gap-3">
              <div className="bg-green-500/20 p-2 rounded-lg">
                <ScanLine className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="text-[10px] text-white/50 font-bold tracking-wider">SYSTEM STATUS</div>
                <div className="font-bold text-sm">Operational</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



const GISAssistant = ({ onTryNow }) => {
  return (
    <section className="bg-[#0a0a0a] py-24 px-8 relative">
      <div className="container mx-auto px-4 md:px-8">
        <div className="relative rounded-[40px] overflow-hidden min-h-[600px] md:min-h-[700px] border border-white/5 flex items-center justify-center md:justify-start shadow-3xl">
          {/* Background Image */}
          <img
            src="/land_viewer.png"
            className="absolute inset-0 w-full h-full object-cover opacity-80"
            alt="Mount Rainier 3D GIS View"
          />
          <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-black/90 via-black/40 to-transparent" />

          {/* Text Card */}
          <div className="relative z-10 max-w-2xl m-4 md:ml-12 p-6 md:p-12 bg-[#1a1c23]/90 backdrop-blur-xl border border-white/10 rounded-[32px] space-y-6 md:space-y-8 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
                <Layers className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-[4px] text-white">Land Viewer</h3>
            </div>

            <p className="text-white/60 text-xs md:text-sm leading-relaxed font-bold border-l-2 border-blue-500/50 pl-4">
              Your online GIS assistant that provides a set of specific technologies to extract valuable information from big data, applicable to real business tasks.
            </p>

            <div className="space-y-4 md:space-y-6">
              {[
                { title: "A Huge Catalog of Satellite Imagery", desc: "Access both free and commercial satellite images from an unlimited scope of sensors, providing quick search and easy-to-access storage." },
                { title: "Processing Functions", desc: "Equipped with Mosaic, Time-lapse, Band combinations, and Time Series Analysis for complex orbital data processing." },
                { title: "Analytical Algorithms", desc: "Diverse range of algorithms for NDVI analysis, cloud masking, atmospheric correction, and multi-period change detection." }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-1" />
                  <div className="space-y-1">
                    <h4 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-white">{item.title}</h4>
                    <p className="text-[10px] md:text-[12px] text-white/40 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <button
                onClick={onTryNow}
                className="px-10 py-4 bg-[#ff7a45] hover:bg-[#ff9c6e] text-white font-black uppercase tracking-widest text-[10px] md:text-xs rounded-xl transition-all shadow-lg hover:scale-105 active:scale-95 text-center"
              >
                Try Now
              </button>
              <button className="px-10 py-4 border border-white/20 text-white/60 hover:text-white hover:bg-white/5 font-black uppercase tracking-widest text-[10px] md:text-xs rounded-xl transition-all text-center">
                More Info
              </button>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};

const ImageryShowcase = ({ onTryNow }) => {
  return (
    <section className="bg-[#0a0a0a] py-24 px-8 relative">
      <div className="container mx-auto px-4 md:px-8">
        <div className="relative rounded-[40px] overflow-hidden min-h-[500px] md:min-h-[600px] border border-white/5 flex items-center justify-center md:justify-start shadow-3xl">
          {/* Background Image */}
          <img
            src="/imagery_showcase.png"
            className="absolute inset-0 w-full h-full object-cover opacity-80"
            alt="High Res Satellite Imagery"
          />
          <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-black/90 via-black/40 to-transparent" />

          {/* Text Card */}
          <div className="relative z-10 max-w-xl m-4 md:ml-12 p-6 md:p-12 bg-[#1a1c23]/95 backdrop-blur-xl border border-white/10 rounded-[32px] space-y-4 md:space-y-6 shadow-2xl">
            <h3 className="text-2xl md:text-4xl font-bold tracking-tighter text-white">High Resolution Imagery</h3>
            <p className="text-white/50 text-xs md:text-sm leading-relaxed font-medium">
              As a distributor of satellite imagery, SatWatch AI offers both historical and up-to-date high-resolution images from top providers. If you need high accuracy and frequency, ordering commercial imagery directly from our platform is a cost-effective proposition.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <button
                onClick={onTryNow}
                className="px-10 py-4 bg-[#ff7a45] hover:bg-[#ff9c6e] text-white font-black uppercase tracking-widest text-[10px] md:text-xs rounded-xl transition-all shadow-lg hover:scale-105 active:scale-95 text-center"
              >
                Try Now
              </button>
              <button className="px-10 py-4 border border-white/20 text-white/60 hover:text-white hover:bg-white/5 font-black uppercase tracking-widest text-[10px] md:text-xs rounded-xl transition-all text-center">
                More Info
              </button>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};

const ImageComparisonSlider = ({ beforeImage, afterImage }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [width, setWidth] = useState(0);
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => setWidth(containerRef.current.offsetWidth);
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const handleMouseMove = (e) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percent);
  };

  const handleTouchMove = (e) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percent);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[500px] overflow-hidden rounded-xl cursor-col-resize select-none bg-black/5 group"
      onMouseDown={() => isDragging.current = true}
      onMouseUp={() => isDragging.current = false}
      onMouseLeave={() => isDragging.current = false}
      onMouseMove={handleMouseMove}
      onTouchStart={() => isDragging.current = true}
      onTouchEnd={() => isDragging.current = false}
      onTouchMove={handleTouchMove}
    >
      <img src={afterImage} alt="After" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
      <div
        className="absolute inset-0 w-full h-full overflow-hidden border-r-2 border-primary/50 bg-background"
        style={{ width: `${sliderPosition}%` }}
      >
        <img src={beforeImage} alt="Before" className="absolute top-0 left-0 max-w-none h-full object-contain pointer-events-none" style={{ width: width || '100%' }} />
      </div>
      <div className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize flex items-center justify-center -ml-0.5 shadow-[0_0_10px_rgba(0,0,0,0.5)]" style={{ left: `${sliderPosition}%` }}>
        <div className="bg-white text-black p-1.5 rounded-full shadow-lg transform -translate-x-1/2 flex items-center justify-center">
          <ScanLine className="w-4 h-4" />
        </div>
      </div>
      <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md pointer-events-none">Before</div>
      <div className="absolute top-4 right-4 bg-primary/90 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md pointer-events-none">After</div>
    </div>
  );
};

const MissionIntelligence = () => {
  return (
    <section className="bg-[#0a0a0a] py-24 px-8 relative overflow-hidden">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          {/* Detailed Image Showcase */}
          <div className="flex-1 relative group w-full">
            <div className="absolute inset-0 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-blue-600/20 transition-all duration-1000" />
            <div className="relative rounded-[40px] overflow-hidden border border-white/10 shadow-3xl bg-black aspect-video">
              <img
                src="/land_viewer_detail.jpg"
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-[10s]"
                alt="Detailed Terrain Intelligence"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              {/* Floating Metrics Overlay */}
              <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-500 p-2 rounded-lg">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-[10px] text-white/50 font-black uppercase tracking-widest leading-none mb-1">Target Region</div>
                      <div className="text-lg font-bold text-white uppercase tracking-tighter">Sector 7G Analysis</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex flex-col items-center min-w-[120px]">
                  <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest mb-1">Resolution</span>
                  <span className="text-xl font-black text-blue-400">0.3m/px</span>
                </div>
              </div>
            </div>
          </div>

          {/* Intelligence Content */}
          <div className="flex-1 space-y-8">
            <div className="space-y-4">
              <p className="text-blue-400 font-black uppercase tracking-[0.3em] text-xs">Mission Intelligence</p>
              <h2 className="text-5xl md:text-6xl font-bold tracking-tighter text-white leading-[0.9]">
                Advanced <br /> <span className="text-white/40">Multi-Spectral</span> <br /> Observation
              </h2>
            </div>
            <p className="text-white/50 text-lg leading-relaxed max-w-lg">
              Unlock the power of regional surveillance with SatWatch AI's multi-spectral imaging. Our high-frequency mission profiles capture structural and environmental shifts in Sector 7G with sub-meter precision.
            </p>
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="bg-white/5 border border-white/5 p-6 rounded-3xl space-y-2">
                <Radio className="w-6 h-6 text-orange-500" />
                <h4 className="text-sm font-bold text-white">Live Uplink</h4>
                <p className="text-xs text-white/30">Near real-time data sync across all tactical nodes.</p>
              </div>
              <div className="bg-white/5 border border-white/5 p-6 rounded-3xl space-y-2">
                <Zap className="w-6 h-6 text-blue-400" />
                <h4 className="text-sm font-bold text-white">Neural Processing</h4>
                <p className="text-xs text-white/30">Automated change detection and asset identification.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const ProductSection = () => {
  return (
    <section className="bg-[#0a0a0a] py-32 px-8 relative overflow-hidden border-t border-white/5">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto relative z-10">
        <div className="text-center mb-20 space-y-4">
          <p className="text-orange-500 font-black uppercase tracking-[0.3em] text-xs">Our Product</p>
          <h2 className="text-5xl md:text-6xl font-bold tracking-tighter text-white">Satellite-as-a-service</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Step 1 */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[40px] p-12 hover:bg-white/[0.06] transition-all duration-500 group shadow-2xl">
            <p className="text-white/20 font-black uppercase tracking-widest text-xs mb-6">Step 1</p>
            <h3 className="text-2xl font-bold text-white mb-8 leading-snug group-hover:text-blue-400 transition-colors">
              Imagery with custom band configurations
            </h3>
            <p className="text-white/50 text-sm leading-relaxed font-medium">
              Infrastructure changes mapping, monitoring, and detection, Deforestation monitoring, Resource mapping, Land reclamation monitoring.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[40px] p-12 hover:bg-white/[0.06] transition-all duration-500 group shadow-2xl">
            <p className="text-white/20 font-black uppercase tracking-widest text-xs mb-6">Step 2</p>
            <h3 className="text-2xl font-bold text-white mb-8 leading-snug group-hover:text-blue-400 transition-colors">
              Analytics and visualization
            </h3>
            <p className="text-white/50 text-sm leading-relaxed font-medium">
              Data-driven sustainability reporting, Land use and land cover mapping, Crop classification & yield prediction, Carbon stock estimation.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-gradient-to-br from-[#4ade80] via-[#2dd4bf] to-[#3b82f6] rounded-[40px] p-12 shadow-[0_30px_60px_rgba(59,130,246,0.3)] hover:scale-[1.03] transition-all duration-500 group">
            <p className="text-black/30 font-black uppercase tracking-widest text-xs mb-6">Step 3</p>
            <h3 className="text-2xl font-bold text-black mb-8 leading-snug">
              Products based on satellite analytics
            </h3>
            <p className="text-black/70 text-sm leading-relaxed font-bold">
              Imagery integration in SatWatch AI Crop Monitoring to power precision agriculture, and into the carbon stock management platform.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const AnalysisDashboard = ({ onSaveHistory, analysisState, setAnalysisState }) => {
  const { beforeFile, afterFile, beforePreview, afterPreview, result, error, activeTab } = analysisState;
  const [loading, setLoading] = useState(false);

  const handleFileSelect = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if same as other file
    const otherFile = type === 'before' ? afterFile : beforeFile;
    if (otherFile && file.name === otherFile.name && file.size === otherFile.size) {
      setAnalysisState(prev => ({ ...prev, error: "Snapshot Conflict: You are attempting to compare identical data. Please select a different temporal capture for T2." }));
      return;
    }

    const preview = URL.createObjectURL(file);
    if (type === 'before') {
      setAnalysisState(prev => ({ ...prev, beforeFile: file, beforePreview: preview, error: null }));
    }
    else {
      setAnalysisState(prev => ({ ...prev, afterFile: file, afterPreview: preview, error: null }));
    }
  };

  const handleRemoveFile = (type) => {
    if (type === 'before') {
      setAnalysisState(prev => ({ ...prev, beforeFile: null, beforePreview: null }));
    }
    else {
      setAnalysisState(prev => ({ ...prev, afterFile: null, afterPreview: null }));
    }
  };

  const handleReset = () => {
    setAnalysisState({
      beforeFile: null,
      afterFile: null,
      beforePreview: null,
      afterPreview: null,
      result: null,
      error: null,
      activeTab: 'visual'
    });
  };

  const handleUpload = async () => {
    if (!beforeFile || !afterFile) {
      setAnalysisState(prev => ({ ...prev, error: "Please select both files." }));
      return;
    }

    // --- Input Validation: Different Things Check ---
    if (beforeFile.name === afterFile.name && beforeFile.size === afterFile.size) {
      setAnalysisState(prev => ({ ...prev, error: "Identical images detected. Analysis requires two distinct orbital snapshots to calculate change delta." }));
      return;
    }

    setLoading(true);
    setAnalysisState(prev => ({ ...prev, error: null, result: null }));

    const formData = new FormData();
    formData.append("before_image", beforeFile);
    formData.append("after_image", afterFile);

    try {
      const response = await fetch(`${API_URL}/analyze`, { method: "POST", body: formData });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Verification Failed");
      }
      const data = await response.json();
      setAnalysisState(prev => ({ ...prev, result: data }));
      if (onSaveHistory) {
        onSaveHistory(data);
      }
    } catch (err) {
      setAnalysisState(prev => ({ ...prev, error: err.message }));
    }
    finally { setLoading(false); }
  };

  const setActiveTab = (tab) => {
    setAnalysisState(prev => ({ ...prev, activeTab: tab }));
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-white pt-28 pb-12">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Control Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col gap-6 flex-1">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-bold flex items-center gap-3">
                  <div className="bg-blue-500/20 p-2 rounded-lg">
                    <Layers className="w-5 h-5 text-blue-400" />
                  </div>
                  Detection Hub
                </h2>
                <div className="flex items-center gap-2 group cursor-help">
                  <p className="text-xs text-white/50 leading-relaxed">
                    Spectral validation active. Only <span className="text-blue-400 font-bold">Orbital Imagery</span> is accepted.
                  </p>
                  <Globe className="w-3 h-3 text-blue-400 animate-pulse" />
                </div>
              </div>
              <button
                onClick={handleReset}
                title="Reset All Logistics"
                className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group hover:rotate-[-45deg]"
              >
                <RotateCcw className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
              </button>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {[{ id: 'before', label: 'Reference Image (T1)', file: beforeFile, preview: beforePreview },
              { id: 'after', label: 'Monitor Image (T2)', file: afterFile, preview: afterPreview }].map((item) => (
                <div key={item.id} className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-[2px] text-white/40">{item.label}</label>
                  {!item.file ? (
                    <label className="block w-full aspect-video border-2 border-dashed border-white/10 rounded-2xl hover:bg-white/5 cursor-pointer transition-all group relative overflow-hidden">
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="p-3 bg-white/5 rounded-full mb-3 group-hover:scale-110 transition-transform bg-blue-500/10">
                          <Upload className="w-5 h-5 text-blue-400" />
                        </div>
                        <span className="text-xs text-white/40 font-medium text-center px-4">Upload Satellite Capture</span>
                      </div>
                      <input type="file" className="hidden" accept="image/*,.tif" onChange={(e) => handleFileSelect(e, item.id)} />
                    </label>
                  ) : (
                    <div className="group relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                      <img src={item.preview} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-500" alt="Preview" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button onClick={() => handleRemoveFile(item.id)} className="p-2.5 bg-red-500 text-white rounded-full hover:scale-110 transition-transform shadow-xl">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleUpload}
              disabled={loading || !beforeFile || !afterFile}
              className="w-full py-4 bg-white text-black rounded-2xl font-bold flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:hover:scale-100 disabled:active:scale-100 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)] group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              {loading ? (
                <div className="flex items-center gap-3 font-black text-[10px] uppercase tracking-widest">
                  <Loader2 className="animate-spin w-4 h-4" />
                  Verifying Spectral Signature...
                </div>
              ) : (
                <>AI Analysis <ChevronRight className="w-5 h-5 translate-x-0 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex gap-3 animate-shake">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <div className="space-y-1">
                  <p className="font-bold">IMAGERY REJECTED</p>
                  <p className="opacity-70 leading-tight">{error}</p>
                </div>
              </div>
            )}

            {result && (
              <div className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-2xl flex items-center justify-between shadow-inner">
                <div className="flex items-center gap-3 text-blue-400 font-bold text-[10px] uppercase tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                  AI Verified Stream
                </div>
                <div className="text-[10px] font-black bg-blue-500/20 px-3 py-1 rounded-full text-blue-400">SUCCESS</div>
              </div>
            )}
          </div>
        </div>

        {/* Right Visualization Panel */}
        <div className="lg:col-span-8 flex flex-col gap-6 min-h-[750px]">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex flex-col relative flex-1">
            {result && (
              <div className="absolute top-6 right-6 z-[1001] bg-black/60 backdrop-blur-md border border-white/10 rounded-full p-1.5 flex shadow-2xl">
                <button
                  onClick={() => setActiveTab('visual')}
                  className={cn(
                    "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                    activeTab === 'visual' ? "bg-white text-black" : "hover:text-white text-white/40"
                  )}
                >
                  Side-by-Side
                </button>
                <button
                  onClick={() => setActiveTab('map')}
                  className={cn(
                    "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                    activeTab === 'map' ? "bg-white text-black" : "hover:text-white text-white/40"
                  )}
                >
                  Live Map
                </button>
              </div>
            )}

            <div className="flex-1 relative min-h-[300px] md:min-h-[500px]">
              {!result ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 animate-pulse">
                    <MapIcon className="w-10 h-10 text-white/20" />
                  </div>
                  <h3 className="text-lg font-bold tracking-tight mb-2">Awaiting Stream</h3>
                  <p className="text-sm text-white/30 max-w-xs text-center">Configure and upload imagery pairs to initialize the visualization pipeline.</p>
                </div>
              ) : (
                activeTab === 'visual'
                  ? <div className="p-4 h-full space-y-4 overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-[3px] text-white/30">Dual-Stream Sync (Detection Active)</span>
                    </div>
                    <div className="flex-1 flex gap-2 overflow-hidden">
                      <div className="flex-1 relative rounded-2xl overflow-hidden border border-white/5 bg-black">
                        <img src={API_URL + result.before_url} className="w-full h-full object-contain" alt="Before" />
                        <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 border border-white/10 backdrop-blur rounded-full text-[9px] font-bold tracking-tighter">PRE-PERIOD (T1)</div>
                      </div>
                      <div className="flex-1 relative rounded-2xl overflow-hidden border border-red-500/30 bg-black">
                        <img src={API_URL + result.after_url} className="w-full h-full object-contain" alt="After" />
                        {/* Virtual Overlay layer */}
                        <div className="absolute inset-0 pointer-events-none bg-red-600/5 mix-blend-screen" />
                        <div className="absolute top-4 left-4 px-3 py-1 bg-red-600 border border-red-400/50 backdrop-blur rounded-full text-[9px] font-bold tracking-tighter">POST-PERIOD (T2)</div>
                        <div className="absolute inset-0 p-8 flex items-center justify-center opacity-30">
                          {/* Decorative red circles to simulate 'detected' points on the image itself */}
                          <div className="absolute top-1/3 left-1/4 w-12 h-12 border-2 border-red-500 rounded-full animate-ping" />
                          <div className="absolute bottom-1/4 right-1/3 w-8 h-8 border-2 border-red-500 rounded-full animate-ping delay-700" />
                        </div>
                      </div>
                    </div>
                  </div>
                  : <div className="h-full w-full animate-in fade-in duration-700">
                    <ChangeMap geoJsonData={result.geojson} />
                  </div>
              )}
            </div>
          </div>

          {/* Semantic Report Section */}
          {result && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-10 duration-700">
              <div className="flex flex-col md:flex-row gap-12 items-start">
                <div className="flex-1 space-y-4">
                  <div className="text-xs font-black uppercase tracking-[4px] text-blue-400">Analysis Summary</div>
                  <h3 className="text-3xl font-bold tracking-tighter leading-none">{result.report?.summary}</h3>
                  <div className="flex flex-wrap gap-4 pt-4">
                    {result.report?.metrics?.map((m, idx) => (
                      <div key={idx} className="bg-white/5 border border-white/5 px-6 py-4 rounded-2xl flex flex-col min-w-[140px]">
                        <span className="text-[9px] font-bold text-white/30 uppercase mb-1">{m.label}</span>
                        <div className="text-xl font-bold flex items-center gap-2">
                          {m.value}
                          <span className={cn("text-[10px]", m.trend === 'up' ? "text-green-500" : "text-red-500")}>
                            {m.trend === 'up' ? '▲' : '▼'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="md:w-1/3 bg-white/10 border border-white/10 p-6 rounded-2xl space-y-5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 flex items-center gap-2">
                    <ScanLine className="w-4 h-4 text-blue-400" /> Intelligence Findings
                  </span>
                  <ul className="space-y-4">
                    {result.report?.findings?.map((f, idx) => (
                      <li key={idx} className="flex gap-3 text-sm leading-relaxed text-white/70">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Delta Intelligence Map Section */}
          {result && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-10 duration-1000">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-xs font-black uppercase tracking-[4px] text-orange-400">Delta Intelligence Map</div>
                    <h3 className="text-2xl font-bold tracking-tighter">Intensity Spectral Mapping</h3>
                  </div>

                </div>

                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black aspect-[21/9] group">
                  <img
                    src={result.change_map_url ? API_URL + result.change_map_url : "/change_detection_demo.png"}
                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-[10s]"
                    alt="Change Detection Heatmap"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                  {/* Tactical Grid Overlay */}
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid.png')] opacity-20 pointer-events-none" />

                  {/* Floating Coordinates */}
                  <div className="absolute bottom-6 left-6 p-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl space-y-1">
                    <div className="text-[8px] font-black tracking-widest text-white/30 uppercase leading-none">Detection Active</div>
                    <div className="text-xs font-mono text-blue-400">LAT: 34.0522 N | LON: 118.2437 W</div>
                  </div>
                </div>

                <p className="text-white/40 text-sm leading-relaxed max-w-3xl">
                  The Intensity Spectral Map identifies structural and topographical variances across the selected timeline. Using high-fidelity neural delta analysis, the mission core highlights areas of <span className="text-blue-400 font-bold">geopolitical shift</span> and industrial evolution with glowing spectral signatures for rapid tactical assessment.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProfilePage = ({ user, setUser, history, onClearHistory, onDownloadPDF, onDownloadImagery }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [downloadingId, setDownloadingId] = useState(null);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || 'asd',
    lastName: user?.lastName || 'mn',
    email: user?.email || 'jideb50123@m3player.com',
    language: user?.language || 'English',
    country: user?.country || 'India'
  });

  const fileInputRef = useRef(null);

  const handleDownload = async (item, type) => {
    setDownloadingId(`${item.job_id}-${type}`);
    if (type === 'pdf') {
      await onDownloadPDF(item);
    } else {
      await onDownloadImagery(item);
    }
    setDownloadingId(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);

    // Simulate tactical uplink
    setTimeout(() => {
      const satwatchUsers = JSON.parse(localStorage.getItem('satwatch_users') || '{}');
      const emailKey = formData.email.toLowerCase();

      const updatedUser = {
        ...user,
        ...formData,
        avatar: avatarPreview
      };

      // Update global mission state
      setUser(updatedUser);

      // Archives indexed by email for persistence across deployments
      satwatchUsers[emailKey] = updatedUser;
      localStorage.setItem('satwatch_users', JSON.stringify(satwatchUsers));
      localStorage.setItem('satwatch_user', JSON.stringify(updatedUser));

      setIsSaving(false);
      setSaveSuccess(true);

      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1200);
  };

  return (
    <div className="relative min-h-screen bg-[#060606] text-white pt-32 pb-12 px-8 overflow-hidden">
      {/* Background/Glows matching landing page */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/15 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="container mx-auto max-w-5xl relative z-10">
        {/* Profile Navigation Tabs */}
        <div className="flex items-center gap-12 mb-12 border-b border-white/10 pb-4">
          {['profile', 'security', 'my activity'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "text-[10px] font-black uppercase tracking-[3px] transition-all relative",
                activeTab === tab ? "text-white" : "text-white/30 hover:text-white/60"
              )}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute -bottom-[18px] inset-x-0 h-0.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              )}
            </button>
          ))}
        </div>

        {activeTab === 'profile' && (
          <div className="bg-white/[0.03] backdrop-blur-[60px] border border-white/10 rounded-[48px] p-8 md:p-12 shadow-2xl relative overflow-hidden animate-in fade-in duration-500">
            {/* Progress Overlay */}
            {isSaving && (
              <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4 animate-in fade-in duration-300">
                <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[4px] text-blue-400">Syncing avec mission control...</p>
              </div>
            )}

            <h2 className="text-2xl font-bold tracking-tighter mb-12">Account info</h2>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              {/* Form Fields */}
              <div className="lg:col-span-7 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[2px] text-white/30 px-2">First Name</label>
                    <div className="relative group">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-400 transition-all duration-500" />
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-all text-sm placeholder:text-white/10"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[2px] text-white/30 px-2">Last Name</label>
                    <div className="relative group">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-400 transition-all duration-500" />
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-all text-sm placeholder:text-white/10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[2px] text-white/30 px-2 flex justify-between">
                    Email Address
                    <span className="text-[8px] text-blue-500/50 flex items-center gap-1"><Lock className="w-2 h-2" /> Identity Constant</span>
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input
                      type="email"
                      value={formData.email}
                      readOnly
                      className="w-full bg-white/[0.01] border border-white/5 rounded-2xl py-4 pl-12 pr-6 outline-none text-sm text-white/40 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[2px] text-white/30 px-2">Language</label>
                    <div className="relative group">
                      <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-400 transition-all duration-500" />
                      <select
                        value={formData.language}
                        onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                        className="w-full bg-[#0d0d0d] border border-white/10 rounded-2xl py-4 pl-12 pr-10 outline-none focus:border-blue-500/50 transition-all text-sm appearance-none cursor-pointer"
                      >
                        <option className="bg-[#0a0a0a]">English</option>
                        <option className="bg-[#0a0a0a]">Spanish</option>
                        <option className="bg-[#0a0a0a]">French</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[2px] text-white/30 px-2">Country</label>
                    <div className="relative group">
                      <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-400 transition-all duration-500" />
                      <select
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full bg-[#0d0d0d] border border-white/10 rounded-2xl py-4 pl-12 pr-10 outline-none focus:border-blue-500/50 transition-all text-sm appearance-none cursor-pointer"
                      >
                        <option className="bg-[#0a0a0a]">India</option>
                        <option className="bg-[#0a0a0a]">USA</option>
                        <option className="bg-[#0a0a0a]">Germany</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 mt-4">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={cn(
                      "px-12 py-5 font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center gap-3",
                      saveSuccess ? "bg-green-500 text-white" : "bg-[#ff7a45] hover:bg-[#ff9c6e] text-white shadow-[0_20px_40px_-10px_rgba(255,122,69,0.3)]"
                    )}
                  >
                    {saveSuccess ? (
                      <><CheckCircle className="w-4 h-4" /> Changes Persisted</>
                    ) : (
                      "Save Changes"
                    )}
                  </button>

                  {saveSuccess && (
                    <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest animate-in slide-in-from-left-4 duration-500">
                      Mission Data Synchronized
                    </p>
                  )}
                </div>
              </div>

              {/* Profile Photo Upload */}
              <div className="lg:col-span-5 space-y-8">
                <label className="text-[10px] font-black uppercase tracking-[2px] text-white/30 px-2">Profile photo</label>
                <div className="flex flex-col gap-8 items-center lg:items-start text-center lg:text-left">
                  <div className="w-56 h-56 bg-white/[0.03] border border-white/10 rounded-[48px] flex items-center justify-center relative group overflow-hidden shadow-inner">
                    {avatarPreview ? (
                      <img src={avatarPreview} className="w-full h-full object-cover" alt="Profile" />
                    ) : (
                      <User className="w-20 h-20 text-white/10" />
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-4 bg-white text-black rounded-full hover:scale-110 transition-transform shadow-2xl"
                      >
                        <Camera className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  <div className="space-y-6">
                    <p className="text-[11px] text-white/30 leading-relaxed font-medium">
                      Accepted formats: <span className="text-white/50">PNG, JPG</span>. <br />
                      Dimensions: <span className="text-white/50">min 30x30px</span>. <br />
                      Limit: <span className="text-white/50">7 MB</span>.
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-8 py-4 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Upload Photo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'my activity' && (
          <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-bold tracking-tighter">Mission History Log</h2>
              {history.length > 0 && (
                <button
                  onClick={onClearHistory}
                  className="flex items-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  <Trash2 className="w-4 h-4" /> Clear Logistics
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="bg-white/[0.03] border border-white/10 rounded-[48px] p-24 text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mx-auto">
                  <FileImage className="w-8 h-8 text-white/10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">No Records Found</h3>
                  <p className="text-white/30 text-sm max-w-xs mx-auto">Initialize a new analysis stream to start logging mission data.</p>
                </div>
              </div>
            ) : (
              <div className="grid gap-6">
                {[...history].reverse().map((item, index) => (
                  <div key={item.id || index} className="group bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 hover:bg-white/[0.05] transition-all duration-500">
                    <div className="flex flex-col md:flex-row justify-between gap-8">
                      <div className="flex-1 space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                            <Calendar className="w-3 h-3" /> {new Date(item.timestamp).toLocaleString()}
                          </div>
                          <div className="px-4 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-[10px] font-bold text-green-400 uppercase tracking-widest">
                            {item.geojson?.features?.length || 0} Detections
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-2xl font-bold tracking-tight group-hover:text-blue-400 transition-colors line-clamp-1">
                            {item.report?.summary || "Standard Assessment"}
                          </h4>
                          <p className="text-white/40 text-sm leading-relaxed line-clamp-2">
                            Precision analysis completed. Metrics and intelligence findings extracted via neural pipeline.
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {item.report?.metrics?.map((m, i) => (
                            <div key={i} className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg flex items-center gap-2">
                              <span className="text-[8px] font-bold text-white/20 uppercase">{m.label}:</span>
                              <span className="text-[10px] font-black text-white/80">{m.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col justify-center gap-3 md:w-48 border-l border-white/5 pl-8 shrink-0">
                        <button
                          onClick={() => handleDownload(item, 'pdf')}
                          disabled={downloadingId !== null}
                          className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl disabled:opacity-50"
                        >
                          {downloadingId === `${item.job_id}-pdf` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                          Export Report
                        </button>
                        <button
                          onClick={() => handleDownload(item, 'img')}
                          disabled={downloadingId !== null}
                          className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500/20 transition-all"
                        >
                          {downloadingId === `${item.job_id}-img` ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileImage className="w-4 h-4" />}
                          Imagery
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'security' && (
          <div className="bg-white/[0.03] backdrop-blur-[60px] border border-white/10 rounded-[48px] p-12 text-center animate-in fade-in duration-500">
            <ShieldCheck className="w-16 h-16 text-blue-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">Security Protocol</h2>
            <p className="text-white/30 text-sm max-w-md mx-auto leading-relaxed">
              Your mission credentials and encrypted data-streams are protected via 256-bit orbital encryption. Access logs and key rotation settings can be managed here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const LoginPage = ({ onBack, onLoginSuccess, onSwitchToRegister }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsAuthenticating(true);

    // Mock Authentication Logic
    setTimeout(() => {
      // For demo purposes, we accept any non-empty credentials
      if (email && password) {
        // Try to retrieve existing mission profile for this specific frequency (email)
        const savedUsers = JSON.parse(localStorage.getItem('satwatch_users') || '{}');
        const existingUser = savedUsers[email.toLowerCase()];

        if (existingUser) {
          console.log('📡 Mission profile found. Restoring archives...');
          onLoginSuccess(existingUser);
        } else {
          // Initialize new mission profile if first-time deployment
          onLoginSuccess({ email: email.toLowerCase() });
        }
      } else {
        setError('Please enter both email and password');
        setIsAuthenticating(false);
      }
    }, 1500);
  };

  return (
    <div className="relative min-h-screen bg-[#060606] text-white flex items-center justify-center p-6 overflow-hidden">
      {/* Volumetric Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[1000px] h-[1000px] bg-blue-600/15 rounded-full blur-[160px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[140px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />

      {/* Back Button */}
      <button
        onClick={onBack}
        className="absolute top-8 left-8 p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all group z-[100] backdrop-blur-xl shadow-2xl"
      >
        <X className="w-5 h-5 group-hover:rotate-90 transition-transform text-white/50 group-hover:text-white" />
      </button>

      {/* 3D Perspective Wrapper */}
      <div className="perspective-[2000px] w-full max-w-4xl relative z-10 scale-[0.95] md:scale-100">
        <div className="relative flex flex-col lg:flex-row items-center gap-0 bg-white/[0.03] backdrop-blur-[60px] border border-white/20 rounded-[48px] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)] transform rotate-x-[2deg] rotate-y-[-5deg] hover:rotate-x-0 hover:rotate-y-0 transition-all duration-1000 ease-out transition-sm-0">

          {/* Reflective Gloss Overlay */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/[0.05] via-transparent to-transparent opacity-50" />

          {/* Left Section: Login Form */}
          <div className="flex-1 p-8 md:p-10 space-y-6 w-full relative z-10">
            <div className="space-y-3 text-center lg:text-left">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tighter bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">Welcome back</h1>
              <p className="text-white/30 text-sm font-medium">Continue with one of the following options</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-2xl animate-shake backdrop-blur-md flex items-center gap-3">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[2px] text-white/30 px-2">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-blue-400 transition-all duration-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@satwatch.ai"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 pl-14 pr-6 outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-all text-sm placeholder:text-white/10 backdrop-blur-md shadow-inner"
                  />
                  <div className="absolute inset-0 rounded-2xl border border-blue-500/0 group-focus-within:border-blue-500/20 pointer-events-none transition-all duration-500" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[2px] text-white/30 px-2">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-blue-400 transition-all duration-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 pl-14 pr-14 outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-all text-sm placeholder:text-white/10 backdrop-blur-md shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-all p-1"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  <div className="absolute inset-0 rounded-2xl border border-blue-500/0 group-focus-within:border-blue-500/20 pointer-events-none transition-all duration-500" />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] px-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-white/5 checked:bg-blue-500 transition-all ring-offset-black focus:ring-blue-500" />
                  <span className="text-white/30 group-hover:text-white/50 transition-colors">Remember me</span>
                </label>
                <a href="#" className="text-blue-400 font-bold hover:text-blue-300 transition-colors uppercase tracking-widest text-[9px]">Forgot Password?</a>
              </div>

              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase tracking-[2px] text-xs hover:scale-[1.02] active:scale-98 transition-all shadow-[0_20px_40px_-10px_rgba(255,255,255,0.2)] flex items-center justify-center gap-3 disabled:opacity-50 relative overflow-hidden group/btn"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                {isAuthenticating ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign in <ArrowRight className="w-4 h-4" /></>}
              </button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                <div className="relative flex justify-center text-[9px] uppercase font-black tracking-[4px]"><span className="bg-[#0f0f0f]/80 backdrop-blur-xl px-4 text-white/10">or</span></div>
              </div>

              <button type="button" className="w-full py-5 bg-white/[0.03] border border-white/10 rounded-2xl font-bold flex items-center justify-center gap-4 hover:bg-white/[0.08] transition-all group/google backdrop-blur-xl hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                <svg className="w-5 h-5 group-hover/google:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="text-xs uppercase tracking-widest">Continue with Google</span>
              </button>
            </form>

            <p className="text-center text-[10px] uppercase font-bold tracking-[2px] text-white/20">
              Don't have an account? <span className="text-blue-400 cursor-pointer hover:text-white transition-colors" onClick={onSwitchToRegister}>Join now</span>
            </p>
          </div>

          {/* Right Section: 3D Illustration */}
          <div className="hidden lg:block flex-1 h-full p-8 pt-24 min-h-[500px] relative overflow-hidden group/img">
            <div className="w-full h-full rounded-[40px] overflow-hidden border border-white/20 relative group bg-[#020202] shadow-[20px_0_100px_rgba(0,0,0,0.8)] transform group-hover/img:translate-z-10 transition-transform duration-700">
              <img
                src="/login-bg.jpg"
                className="w-full h-full object-cover transform scale-110 group-hover:scale-125 transition-transform duration-[8s] opacity-80"
                alt="Orbital Satellite"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#060606] via-transparent to-transparent opacity-90 pointer-events-none" />

              {/* Deep Space Glow Elements */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px] animate-pulse pointer-events-none" />
              <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none" />
            </div>

            {/* Floating UI Decorative Elements */}
            <div className="absolute bottom-20 right-20 w-32 h-32 border border-white/10 rounded-full animate-spin-slow opacity-20 pointer-events-none ring-8 ring-white/5" />
          </div>
        </div>
      </div>
    </div>
  );
};

function ChangeMap({ geoJsonData }) {
  const center = geoJsonData?.features?.length > 0 && geoJsonData?.features[0]?.geometry?.coordinates?.[0]?.[0]
    ? [geoJsonData.features[0].geometry.coordinates[0][0][1], geoJsonData.features[0].geometry.coordinates[0][0][0]]
    : [20, 0];

  return (
    <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution="&copy; Google"
        url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
        subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
      />
      <GeoJSON data={geoJsonData} style={() => ({ color: '#ef4444', weight: 2, fillColor: '#ef4444', fillOpacity: 0.4 })} />
    </MapContainer>
  );
}

const ZoomHandler = () => {
  const [clickCount, setClickCount] = useState(0);
  const map = useMapEvents({
    click: (e) => {
      if (clickCount >= 2) return;
      setClickCount(prev => prev + 1);
      map.flyTo(e.latlng, Math.min(map.getZoom() + 4, 18), { duration: 1.5 });
    },
  });
  return null;
};
const DrawingHandler = ({ isDrawing, drawPoints, setDrawPoints }) => {
  useMapEvents({
    click: (e) => {
      if (!isDrawing) return;
      const newPoint = [e.latlng.lat, e.latlng.lng];
      setDrawPoints(prev => [...prev, newPoint]);
    }
  });

  if (drawPoints.length === 0 && !isDrawing) return null;

  return (
    <LayerGroup>
      {drawPoints.map((point, i) => (
        <Circle
          key={i}
          center={point}
          radius={5}
          pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.8, weight: 2 }}
        />
      ))}
      {drawPoints.length > 1 && (
        <Polyline positions={drawPoints} pathOptions={{ color: '#3b82f6', weight: 3, dashArray: '10, 10' }} />
      )}
      {drawPoints.length > 2 && (
        <Polygon
          positions={drawPoints}
          pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.2, weight: 2 }}
        />
      )}
    </LayerGroup>
  );
};

const LiveSection = ({ user, onSaveAlert }) => {
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Centered over India
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedLocation, setSearchedLocation] = useState(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isHistoricalMode, setIsHistoricalMode] = useState(false);
  const [is3DMode, setIs3DMode] = useState(false);
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawPoints, setDrawPoints] = useState([]);
  const [drawAreaCenter, setDrawAreaCenter] = useState(null);
  const [showRegionRequiredPopup, setShowRegionRequiredPopup] = useState(false);
  const [isHourPickerOpen, setIsHourPickerOpen] = useState(false);

  const ClipPathHandler = ({ points, paneName }) => {
    const map = useMap();
    // Use layout effect to prevent flash of unclipped content if possible, though useEffect is standard for refs
    useEffect(() => {
      const pane = map.getPane(paneName);
      if (!pane || !points || points.length < 3) {
        if (pane) pane.style.clipPath = 'none';
        return;
      }

      const updateClip = () => {
        const pixelPoints = points.map(p => map.latLngToLayerPoint(p));
        const polygon = pixelPoints.map(p => `${p.x}px ${p.y}px`).join(', ');
        pane.style.clipPath = `polygon(${polygon})`;
      };

      // Initial calculation
      updateClip();

      // Update on map movements
      map.on('move', updateClip);
      map.on('zoom', updateClip);
      map.on('viewreset', updateClip);
      map.on('resize', updateClip);

      return () => {
        map.off('move', updateClip);
        map.off('zoom', updateClip);
        map.off('viewreset', updateClip);
        map.off('resize', updateClip);
        if (pane) pane.style.clipPath = 'none';
      };
    }, [map, points, paneName]);

    return null;
  };

  const mapRef = useRef(null);
  const suggestionTimeoutRef = useRef(null);

  const [formData, setFormData] = useState({
    target: '',
    fromDate: '',
    toDate: '',
    hours: 8,
  });

  const clearDrawing = () => {
    setDrawPoints([]);
    setDrawAreaCenter(null);
    setIsDrawing(false);
  };

  const finishDrawing = () => {
    if (drawPoints.length < 3) return;

    // Calculate center of points for timeline
    const latSum = drawPoints.reduce((sum, p) => sum + p[0], 0);
    const lonSum = drawPoints.reduce((sum, p) => sum + p[1], 0);
    const center = [latSum / drawPoints.length, lonSum / drawPoints.length];

    setDrawAreaCenter(center);
    setIsDrawing(false);
    setIsHistoricalMode(true); // Automatically switch to historical mode to load data
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter([latitude, longitude]);
          setUserLocation([latitude, longitude]);
          if (mapRef.current) mapRef.current.setView([latitude, longitude], 18);
        },
        (error) => console.error("Error getting location:", error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      const zoomLevel = (mapCenter[0] === 20.5937 && mapCenter[1] === 78.9629) ? 5 : 13;
      mapRef.current.flyTo(mapCenter, zoomLevel, { duration: 2.5, easeLinearity: 0.25, noMoveStart: true });
    }
  }, [mapCenter]);

  useEffect(() => {
    if (suggestionTimeoutRef.current) clearTimeout(suggestionTimeoutRef.current);
    if (!searchQuery || searchQuery.length < 3) { setSuggestions([]); return; }
    suggestionTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`);
        const data = await response.json();
        setSuggestions(data || []);
      } catch (err) { console.error("Suggestions fetch failed:", err); }
    }, 500);
    return () => clearTimeout(suggestionTimeoutRef.current);
  }, [searchQuery]);

  const selectSuggestion = (suggestion) => {
    const { lat, lon, boundingbox, display_name } = suggestion;
    const bounds = [[parseFloat(boundingbox[0]), parseFloat(boundingbox[2])], [parseFloat(boundingbox[1]), parseFloat(boundingbox[3])]];
    setSearchQuery(display_name);
    setMapCenter([parseFloat(lat), parseFloat(lon)]);
    setSearchedLocation({ name: display_name, lat: parseFloat(lat), lon: parseFloat(lon) });
    setSearchBounds(bounds);
    setSuggestions([]);
    if (mapRef.current) mapRef.current.flyToBounds(bounds, { padding: [50, 50], maxZoom: 18, duration: 3 });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    setIsSearching(true);
    setSearchBounds(null);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon, boundingbox, display_name } = data[0];
        const bounds = [[parseFloat(boundingbox[0]), parseFloat(boundingbox[2])], [parseFloat(boundingbox[1]), parseFloat(boundingbox[3])]];
        setMapCenter([parseFloat(lat), parseFloat(lon)]);
        setSearchedLocation({ name: display_name, lat: parseFloat(lat), lon: parseFloat(lon) });
        setSearchBounds(bounds);
        if (mapRef.current) mapRef.current.flyToBounds(bounds, { padding: [50, 50], maxZoom: 18, duration: 3 });
      }
    } catch (err) { console.error("Search failed:", err); }
    finally { setIsSearching(false); }
  };

  const [timelineData, setTimelineData] = useState(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [showSurveillancePopup, setShowSurveillancePopup] = useState(false);
  const [surveillanceData, setSurveillanceData] = useState(null);

  useEffect(() => {
    let interval;
    if (isAutoplay && isHistoricalMode && timelineData) {
      interval = setInterval(() => {
        const years = Object.keys(timelineData).sort((a, b) => a - b);
        const currentIndex = years.indexOf(selectedYear.toString());
        const nextIndex = (currentIndex + 1) % years.length;
        setSelectedYear(parseInt(years[nextIndex]));
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isAutoplay, isHistoricalMode, timelineData, selectedYear]);

  useEffect(() => {
    const controller = new AbortController();

    // Use drawn area center if exists
    const targetLat = drawAreaCenter?.[0] || searchedLocation?.lat || mapCenter[0];
    const targetLon = drawAreaCenter?.[1] || searchedLocation?.lon || mapCenter[1];

    if (isTimelineOpen || isHistoricalMode) {
      const fetchTimeline = async () => {
        setIsHistoryLoading(true);
        try {
          console.log(`📡 Accessing mission logs for: ${targetLat}, ${targetLon}`);

          const response = await fetch(`${API_URL}/timeline/${targetLat}/${targetLon}`, {
            signal: controller.signal
          });

          const data = await response.json();
          console.log('📬 Satellite data packet received:', data);

          if (data.status === 'success') {
            setTimelineData(data.timeline);
            const years = Object.keys(data.timeline);
            if (years.length > 0 && !years.map(String).includes(selectedYear.toString())) {
              setSelectedYear(parseInt(years[years.length - 1]));
            }
          } else {
            console.error("❌ Mission Control reported an error:", data.detail);
          }
        } catch (err) {
          if (err.name === 'AbortError') {
            console.log('⚡ Superseded request aborted');
          } else {
            console.error("🚀 Uplink failure:", err);
          }
        } finally {
          setIsHistoryLoading(false);
        }
      };

      fetchTimeline();
    } else {
      setIsHistoryLoading(false);
    }

    return () => controller.abort();
  }, [isTimelineOpen, isHistoricalMode, searchedLocation, mapCenter, drawAreaCenter]);

  const getHistoricalBounds = () => {
    const lat = searchedLocation?.lat || mapCenter[0];
    const lon = searchedLocation?.lon || mapCenter[1];
    const offset = 0.018;
    return [[lat - offset / 2.2, lon - offset], [lat + offset / 2.2, lon + offset]];
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Form Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    console.log("🚀 Initializing Surveillance...", formData);

    if (!user) {
      console.warn("User not logged in");
      alert("⚠️ Authentication Required\n\nPlease log in to access satellite supervision features.");
      return;
    }

    setIsSubmitting(true);

    try {
      const locationName = searchedLocation?.name || searchQuery || `Lat: ${mapCenter[0].toFixed(2)}, Lon: ${mapCenter[1].toFixed(2)}`;

      const payload = {
        target: formData.target,
        location_name: locationName,
        lat: searchedLocation?.lat || mapCenter[0],
        lon: searchedLocation?.lon || mapCenter[1],
        from_date: formData.fromDate,
        to_date: formData.toDate,
        hours: formData.hours,
        email: user.email
      };

      console.log("Sending Payload:", payload);

      const response = await fetch(`${API_URL}/monitor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log("Response:", data);

      if (response.ok) {
        if (data.status === 'historical_report') {
          // 1. Generate PDF immediately for the past dates
          const historicalResult = {
            ...data.analysis,
            timestamp: new Date().toISOString(),
          };

          // Use the existing exportToPDF function
          await exportToPDF(historicalResult);

          // Save to persistent history
          if (onSaveAlert) {
            onSaveAlert({
              target: formData.target,
              location_name: locationName,
              from_date: formData.fromDate,
              toDate: formData.toDate,
              hours: formData.hours,
              job_id: data.analysis?.job_id || 'HIST-' + Math.random().toString(36).substr(2, 5),
              status: 'Completed (Retrospective)'
            });
          }

          alert(`✅ Retrospective Analysis Complete!\n\nAn intelligence report for ${locationName} has been generated and sent to ${user.email}.\n\nThe PDF is also downloading to your device now.`);
          setIsAlertOpen(false);
        } else {
          // 2. Show the "Armed" popup for future dates
          setSurveillanceData({
            taskId: data.task_id,
            location: locationName,
            target: formData.target,
            email: user.email
          });

          // Save to persistent history
          if (onSaveAlert) {
            onSaveAlert({
              target: formData.target,
              location_name: locationName,
              from_date: formData.fromDate,
              toDate: formData.toDate,
              hours: formData.hours,
              job_id: data.task_id
            });
          }

          setShowSurveillancePopup(true);
          setIsAlertOpen(false);

          // Simulated delay notification for the chosen hour window
          setTimeout(() => {
            console.log(`[SIMULATION] Sending alert notification to ${user.email} after ${formData.hours}h window.`);
          }, 3000);
        }
        // Reset form
        setFormData(prev => ({ ...prev, target: '', fromDate: '', toDate: '' }));
      } else {
        alert("❌ Initialization Failed: " + (data.detail || "Server rejected request"));
      }

    } catch (err) {
      console.error("Alert registration failed:", err);
      alert("❌ Connectivity Error: Unable to reach mission control server.\nCheck your network connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative h-screen w-full bg-[#050505] overflow-hidden pt-20">
      {/* Background Gradients/Glows matching landing page */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/15 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none z-[1]" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none z-[1]" />

      <div
        className="absolute inset-0 z-0 transition-all duration-1000 ease-in-out"
        style={{ perspective: is3DMode ? '2500px' : 'none' }}
      >
        <MapContainer
          center={mapCenter}
          zoom={5}
          maxZoom={20}
          style={{
            height: "100%",
            width: "100%",
            transform: is3DMode ? 'rotateX(60deg) translateY(-100px) scale(1.5)' : 'none',
            transformOrigin: 'bottom center',
            transition: 'all 1.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          ref={mapRef}
          zoomControl={false}
          className="map-3d-container"
        >
          <ZoomHandler />
          {/* Base Layer Logic */}
          {!is3DMode ? (
            <TileLayer
              attribution="&copy; Google"
              url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
              subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
              opacity={1}
              maxZoom={20}
              className={
                isHistoricalMode && selectedYear < 2010
                  ? "sepia-filter"
                  : isHistoricalMode && selectedYear < 2018
                    ? "contrast-filter"
                    : ""
              }
            />
          ) : (
            <TileLayer
              attribution="&copy; Google Earth"
              url="https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
              subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
              maxZoom={20}
            />
          )}
          <Pane name="historical-imagery" style={{ zIndex: 450 }}>
            {isHistoricalMode && timelineData && timelineData[String(selectedYear)] && (() => {
              console.log(`🖼️ Rendering GEE Tile Layer for ${selectedYear}`);
              return (
                <TileLayer
                  key={`historical-tile-${selectedYear}`}
                  url={timelineData[String(selectedYear)].tile_url}
                  attribution="&copy; Google Earth Engine"
                  opacity={1}
                  maxZoom={20}
                />
              );
            })()}
          </Pane>
          {searchedLocation && (
            <Marker position={[searchedLocation.lat, searchedLocation.lon]} />
          )}
          {userLocation && (
            <Circle
              center={userLocation}
              radius={10}
              pathOptions={{
                color: '#3b82f6',
                weight: 3,
                fillColor: '#3b82f6',
                fillOpacity: 0.5
              }}
            />
          )}
          <DrawingHandler
            isDrawing={isDrawing}
            drawPoints={drawPoints}
            setDrawPoints={setDrawPoints}
          />
          {/* Apply visual clipping to historical layer based on drawn points */}
          <ClipPathHandler points={drawPoints} paneName="historical-imagery" />
        </MapContainer>
      </div>

      {/* Surveillance Armed Popup (Future Dates) */}
      {showSurveillancePopup && (
        <div className="absolute inset-0 z-[600] flex items-center justify-center p-8 bg-black/80 backdrop-blur-md animate-in fade-in zoom-in duration-300">
          <div className="relative w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-[40px] p-10 text-center space-y-8 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9)] overflow-hidden">
            <div className="absolute inset-0 bg-blue-500/5 pulse-subtle pointer-events-none" />

            <div className="relative flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-2xl animate-pulse rounded-full" />
                <div className="relative w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-lg transform rotate-12">
                  <ShieldCheck className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>

            <div className="space-y-3 relative">
              <h3 className="text-3xl font-bold tracking-tighter">Surveillance Armed</h3>
              <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Orbital Node {surveillanceData?.taskId.substring(0, 6)} Secured</p>
            </div>

            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl text-left space-y-4">
              <div className="flex items-center gap-3">
                <Target className="w-4 h-4 text-red-500" />
                <span className="text-xs font-bold text-white/70">Tracking {surveillanceData?.target}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-white/70 line-clamp-1">{surveillanceData?.location}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-green-400" />
                <span className="text-xs font-bold text-white/70">{surveillanceData?.email}</span>
              </div>
            </div>

            <p className="text-sm text-white/40 leading-relaxed italic">
              "The system is now monitoring this sector 24/7. You will receive an immediate uplink notification if any divergence is detected."
            </p>

            <button
              onClick={() => setShowSurveillancePopup(false)}
              className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
              Acknowledge & Sync
            </button>
          </div>
        </div>
      )}

      {/* Map Content Loading Overlay */}
      {isHistoryLoading && (
        <div className="absolute inset-0 z-[400] bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center space-y-4 transition-all duration-500">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-3xl animate-pulse rounded-full" />
            <div className="relative bg-[#1a1a1a] p-8 rounded-[40px] border border-white/10 shadow-2xl flex flex-col items-center space-y-6">
              <div className="relative">
                <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
                <Orbit className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-blue-400 opacity-50" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-white tracking-widest uppercase italic">Initializing Orbital Feed</h3>
                <p className="text-blue-400/60 text-[10px] font-black uppercase tracking-[3px]">Accessing Earth Engine Archives...</p>
              </div>
              <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 animate-[loading_2s_ease-in-out_infinite]" style={{ width: '40%' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Google Earth Style Top Search Bar */}
      <div className="absolute top-24 left-8 z-50 flex items-start gap-4">
        <div className="relative group w-[320px]">
          <div className="bg-black/10 backdrop-blur-md border border-white/10 rounded-full flex items-center p-1 shadow-2xl focus-within:bg-black/15 transition-all duration-300">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={cn(
                "p-2.5 rounded-full transition-colors ml-1",
                isMenuOpen ? "text-blue-400 bg-white/10" : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              <MoreVertical className="w-3 h-3 transition-transform group-hover:scale-110" />
            </button>

            <form onSubmit={handleSearch} className="flex-1 flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search targeted location"
                className="flex-1 bg-transparent border-none outline-none text-[14px] text-white py-1.5 pl-3 placeholder:text-white/30"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSuggestions([]);
                    setSearchedLocation(null);
                    setSearchBounds(null);
                  }}
                  className="p-2 hover:bg-white/5 rounded-full mr-1"
                >
                  <X className="w-3.5 h-3.5 text-white/40 hover:text-white" />
                </button>
              )}
              <div className="w-px h-6 bg-white/10 mx-1" />
              <button
                type="submit"
                className="p-2.5 hover:bg-white/10 rounded-full group/search mr-1 transition-all"
              >
                {isSearching ? (
                  <Loader2 className="w-3.5 h-3.5 text-white/70 animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5 text-white/40 group-hover/search:text-white group-hover/search:scale-110 transition-all" />
                )}
              </button>
            </form>
          </div>

          {/* Suggestions Dropdown - Google Style */}
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-[60] animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="py-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => selectSuggestion(suggestion)}
                    className="w-full text-left px-4 py-2.5 hover:bg-white/10 transition-all flex items-center gap-3 group"
                  >
                    <MapPin className="w-3.5 h-3.5 text-white/30 group-hover:text-blue-400 transition-colors" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-white/90 truncate">{suggestion.display_name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tools Dropdown - Vertical Layout - Left Aligned */}
          {isMenuOpen && (
            <div className="absolute top-full left-0 mt-2 w-12 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl py-2 flex flex-col items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <button onClick={() => {
                if (!isHistoricalMode && !drawAreaCenter) {
                  setShowRegionRequiredPopup(true);
                  return;
                }
                setIsHistoricalMode(!isHistoricalMode);
              }} className={cn("p-2 rounded-full transition-all", isHistoricalMode ? "bg-blue-500 text-white shadow-lg scale-110" : "text-white/40 hover:text-white hover:bg-white/10")} title="Historical Imagery">
                <HistoryIcon className="w-3.5 h-3.5" />
              </button>
              <div className="w-6 h-px bg-white/5" />

              <button
                onClick={() => setIsDrawing(!isDrawing)}
                className={cn(
                  "p-2 rounded-full transition-all",
                  isDrawing ? "bg-orange-500 text-white shadow-lg scale-110" : "text-white/40 hover:text-white hover:bg-white/10"
                )}
                title="Draw Area (Pencil)"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>

              {isDrawing && drawPoints.length > 0 && (
                <button
                  onClick={finishDrawing}
                  className="p-2 bg-green-500/80 text-white rounded-full hover:bg-green-500 transition-all shadow-lg scale-110"
                  title="Finish Drawing Area"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                </button>
              )}

              {(drawPoints.length > 0 || isDrawing) && (
                <button
                  onClick={clearDrawing}
                  className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all"
                  title="Clear Drawing"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              <div className="w-6 h-px bg-white/5" />

              <button
                onClick={() => setIs3DMode(!is3DMode)}
                className={cn(
                  "p-2 rounded-full transition-all duration-500",
                  is3DMode
                    ? "bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.5)] scale-110"
                    : "text-white/40 hover:text-white hover:bg-white/10"
                )}
                title="Toggle 3D Observation Mode"
              >
                <Layers className="w-3.5 h-3.5" />
              </button>
              <div className="w-6 h-px bg-white/5" />
              <button className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all" title="Measure Distance">
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Top Right Alert Button */}
      <div className="absolute top-24 right-8 z-50 flex flex-col gap-3">
        <button
          onClick={() => setIsAlertOpen(!isAlertOpen)}
          className={cn(
            "p-4 rounded-2xl border transition-all duration-500 flex items-center justify-center shadow-2xl backdrop-blur-xl",
            isAlertOpen
              ? "bg-red-500 border-red-400 text-white scale-110 shadow-red-500/20"
              : "bg-white/10 border-white/10 text-white hover:bg-white/20"
          )}
        >
          <Bell className={cn("w-5 h-5", isAlertOpen && "animate-bounce")} />
        </button>

        {/* Timeline Access Button (Floating History Toggle) */}
        <button
          onClick={() => {
            if (!isHistoricalMode && !drawAreaCenter) {
              setShowRegionRequiredPopup(true);
              return;
            }
            // Toggle historical mode for current location
            setIsHistoricalMode(!isHistoricalMode);
            if (!isHistoricalMode) {
              // When activating, ensure we're viewing the searched location
              if (searchedLocation && mapRef.current) {
                mapRef.current.flyTo([searchedLocation.lat, searchedLocation.lon], 14, { duration: 1.5 });
              }
            } else {
              // When deactivating, stop autoplay
              setIsAutoplay(false);
            }
          }}
          className={cn(
            "p-4 rounded-2xl border transition-all duration-500 shadow-2xl backdrop-blur-xl group relative overflow-hidden",
            isHistoricalMode
              ? "bg-blue-500 border-blue-400 text-white scale-110"
              : "bg-black/60 border-white/10 text-white hover:bg-white/5"
          )}
          title={isHistoricalMode ? "Exit Timeline Mode" : "View Historical Imagery"}
        >
          <Clock className={cn("w-6 h-6", isHistoricalMode && "animate-pulse")} />
        </button>
      </div>

      {/* Google Earth Style Timeline Bar */}
      {
        isHistoricalMode && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-8">
            <div className="bg-black/80 backdrop-blur-2xl border border-white/20 rounded-full p-2 flex items-center gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-t-white/30">
              <div className="flex items-center gap-2 pl-4 pr-2 border-r border-white/10">
                <HistoryIcon className="w-4 h-4 text-blue-400" />
                <span className="text-[10px] font-black uppercase tracking-[2px] text-white/90 whitespace-nowrap">Historical Imagery</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 border-r border-white/10">
                <button
                  onClick={() => setIsAutoplay(!isAutoplay)}
                  className={cn(
                    "p-2 rounded-full transition-all",
                    isAutoplay ? "bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]" : "text-white/40 hover:text-white hover:bg-white/5"
                  )}
                  title={isAutoplay ? "Pause Autoplay" : "Auto-Play Timeline"}
                >
                  {isAutoplay ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                </button>
                <button
                  onClick={() => setSelectedYear(prev => Math.max(2000, prev - 1))}
                  className="p-1.5 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors"
                  disabled={isAutoplay}
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
              <div className="min-w-[120px] text-center">
                <span className="text-blue-400 font-black text-sm tracking-tighter">OCT 12, {selectedYear}</span>
              </div>
              <button
                onClick={() => setSelectedYear(prev => Math.min(new Date().getFullYear(), prev + 1))}
                className="p-1.5 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 relative h-10 flex items-center px-4">
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
                className="absolute inset-x-4 w-[calc(100%-32px)] opacity-0 cursor-pointer z-10 h-10"
              />
              <div className="absolute inset-x-4 flex justify-between pointer-events-none">
                {[2000, 2005, 2010, 2015, 2020, 2024].map(y => (
                  <div key={y} className="flex flex-col items-center">
                    <div className={cn("w-1 h-1 rounded-full mb-6", selectedYear >= y ? "bg-blue-400" : "bg-white/20")} />
                    <span className="text-[8px] font-bold text-white/20 uppercase tracking-tighter">{y}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setIsHistoricalMode(false);
                setIsAutoplay(false);
              }}
              className="p-3 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      }

      {/* Historical Metadata Overlay */}
      {
        isHistoricalMode && timelineData && timelineData[selectedYear] && timelineData[selectedYear].metadata && (
          <div className="absolute top-36 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-black/60 backdrop-blur-xl border border-white/10 px-6 py-2 rounded-full flex items-center gap-4 shadow-2xl">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/90">
                  {timelineData[selectedYear].metadata.sensor}
                </span>
              </div>
              <div className="w-px h-3 bg-white/20" />
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">
                Resolution: {timelineData[selectedYear].metadata.resolution}
              </span>
              <div className="w-px h-3 bg-white/20" />
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">
                {timelineData[selectedYear].metadata.provider}
              </span>
            </div>
          </div>
        )
      }

      {/* Right Side Alert Card */}
      <div
        className={cn(
          "absolute top-44 right-8 z-50 w-96 bg-[#0f0f0f]/95 backdrop-blur-2xl border border-white/15 rounded-[32px] p-8 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] transition-all duration-700 ease-out",
          isAlertOpen ? "translate-x-0 opacity-100" : "translate-x-[120%] opacity-0"
        )}
      >
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold tracking-tighter">Issue Alert</h3>
              <p className="text-[10px] font-black uppercase tracking-[2px] text-red-500">Mission Parameters</p>
            </div>
            <button
              onClick={() => setIsAlertOpen(false)}
              className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-white/40" />
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-2">Detection Target</label>
              <div className="relative">
                <ScanLine className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/50" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Deforestation, Vessels"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-blue-500/50 transition-all text-sm"
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-2">From Date</label>
                <input
                  type="date"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 outline-none focus:border-blue-500/50 transition-all text-sm [color-scheme:dark]"
                  value={formData.fromDate}
                  onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-2">To Date</label>
                <input
                  type="date"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 outline-none focus:border-blue-500/50 transition-all text-sm [color-scheme:dark]"
                  value={formData.toDate}
                  onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-2 pt-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Monitoring Window</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsHourPickerOpen(!isHourPickerOpen)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  <Clock className="w-3 h-3 text-blue-400" />
                  {formData.hours} {formData.hours === 1 ? 'hr' : 'hrs'}
                  <ChevronDown className={cn("w-3 h-3 text-white/40 transition-transform", isHourPickerOpen && "rotate-180")} />
                </button>

                {isHourPickerOpen && (
                  <div className="absolute right-0 top-full mt-2 w-32 bg-[#121212]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-1 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-2 gap-1 p-1">
                      {[8, 9, 10, 11, 12, 13, 14, 15, 16].map((hr) => (
                        <button
                          key={hr}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, hours: hr });
                            setIsHourPickerOpen(false);
                          }}
                          className={cn(
                            "py-2 rounded-lg text-[10px] font-bold transition-all",
                            formData.hours === hr
                              ? "bg-blue-600 text-white"
                              : "text-white/40 hover:text-white hover:bg-white/5"
                          )}
                        >
                          {hr}h
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <p className="text-[9px] text-white/20 ml-2 italic">Intelligence report will be dispatched to your email after {formData.hours} hours of observation.</p>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase tracking-[2px] text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  Initializing Uplink...
                </>
              ) : (
                <>
                  Initialize Surveillance
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>


        </div>
      </div>

      {/* Map Attribution/Status Overlay */}
      <div className="absolute bottom-8 left-8 z-50 flex items-center gap-4">
        <div className="px-5 py-2.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-full flex items-center gap-3 shadow-xl">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Satellite Stream: Online</span>
        </div>
        <div className="px-5 py-2.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-full flex items-center gap-3 shadow-xl">
          <MapPin className="w-3 h-3 text-blue-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/80">
            {mapCenter[0].toFixed(4)}, {mapCenter[1].toFixed(4)}
          </span>
        </div>
      </div>

      {/* Timeline Popup Modal */}
      {
        isTimelineOpen && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center p-8 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-6xl max-h-[90vh] bg-[#0a0a0a] border border-white/20 rounded-[40px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9)] overflow-hidden">
              {/* Close Button */}
              <button
                onClick={() => setIsTimelineOpen(false)}
                className="absolute top-6 right-6 z-10 p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all group"
              >
                <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              </button>

              {/* Header */}
              <div className="p-8 pb-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-4xl font-bold tracking-tighter mb-2">5-Year Satellite Analysis</h2>
                    <p className="text-sm text-white/50">
                      Historical changes detected in <span className="text-blue-400 font-bold">{searchedLocation?.name || searchQuery || 'selected location'}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-400">{timelineData ? Object.keys(timelineData).length : 0}</div>
                      <div className="text-[9px] text-white/40 uppercase tracking-wider font-bold">Total Snapshots</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content - Scrollable */}
              <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-8 space-y-6 custom-scrollbar">
                {/* Timeline Events with Satellite Images */}
                {isHistoryLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                    <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Accessing Orbital Archives...</p>
                  </div>
                ) : timelineData ? (
                  Object.entries(timelineData).reverse().map(([year, data], idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all group">
                      <div className="flex gap-6">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-16 h-16 rounded-full border-4 border-[#0a0a0a] flex flex-col items-center justify-center font-bold bg-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.4)]">
                            <div className="text-xl">{year}</div>
                          </div>
                          {idx < Object.keys(timelineData).length - 1 && <div className="w-0.5 h-20 bg-gradient-to-b from-white/20 to-transparent" />}
                        </div>

                        <div className="flex-1 space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-2xl font-bold">Historical Snapshot</h3>
                              <p className="text-sm text-white/50 mt-1">
                                Captured via {data.metadata?.sensor || 'Satellite'} ({data.metadata?.resolution || 'H-Res'})
                              </p>
                            </div>
                            <div className="text-[9px] font-black uppercase tracking-[2px] px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                              Verified Stream
                            </div>
                          </div>

                          <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black/40 group/img">
                            <img
                              src={data.url || data}
                              alt={`Satellite ${year}`}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                              <span className="text-xs font-bold text-white uppercase tracking-widest">MISSION CAPTURE: {year}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center">
                    <p className="text-white/20 uppercase tracking-widest font-black">No imagery available for this sector.</p>
                  </div>
                )}

                {/* Summary Statistics */}
                <div className="grid grid-cols-4 gap-4 pt-6 border-t border-white/10">
                  <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-2xl p-5 text-center">
                    <div className="text-3xl font-bold text-blue-400">22</div>
                    <div className="text-[10px] text-white/50 uppercase tracking-wider font-bold mt-2">Total Changes</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-2xl p-5 text-center">
                    <div className="text-3xl font-bold text-purple-400">6</div>
                    <div className="text-[10px] text-white/50 uppercase tracking-wider font-bold mt-2">Events</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-2xl p-5 text-center">
                    <div className="text-3xl font-bold text-green-400">5yr</div>
                    <div className="text-[10px] text-white/50 uppercase tracking-wider font-bold mt-2">Timespan</div>
                  </div>
                  <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 rounded-2xl p-5 text-center">
                    <div className="text-3xl font-bold text-red-400">15</div>
                    <div className="text-[10px] text-white/50 uppercase tracking-wider font-bold mt-2">High Severity</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }
      {/* Region Required Popup */}
      {showRegionRequiredPopup && (
        <div className="absolute inset-0 z-[600] flex items-center justify-center p-8 bg-black/80 backdrop-blur-md animate-in fade-in zoom-in duration-300">
          <div className="relative w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-[40px] p-10 text-center space-y-8 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9)] overflow-hidden">
            <div className="absolute inset-0 bg-orange-500/5 pulse-subtle pointer-events-none" />

            <div className="relative flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-orange-500/20 blur-2xl animate-pulse rounded-full" />
                <div className="relative w-20 h-20 bg-orange-600 rounded-3xl flex items-center justify-center shadow-lg transform -rotate-6">
                  <ScanLine className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>

            <div className="space-y-3 relative">
              <h3 className="text-3xl font-bold tracking-tighter">Region Undefined</h3>
              <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Target Acquisition Failed</p>
            </div>

            <p className="text-sm text-white/50 leading-relaxed font-medium">
              Please use the <span className="text-white font-bold">Draw Tool</span> to define a specific target zone before accessing the historical timeline archives.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowRegionRequiredPopup(false)}
                className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold uppercase tracking-widest text-xs transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowRegionRequiredPopup(false);
                  setIsDrawing(true);
                }}
                className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                Activate Draw
              </button>
            </div>
          </div>
        </div>
      )}
    </div >
  );
};

const TrackSection = () => {
  const [mapCenter, setMapCenter] = useState([20, 0]);
  const [isLiveEnabled, setIsLiveEnabled] = useState(true);
  const [activeFilter, setActiveFilter] = useState('LEO');
  const [showAnalysisPopup, setShowAnalysisPopup] = useState(false);
  const [analysisParams, setAnalysisParams] = useState({
    region: '',
    satellite: 'Sentinel-2',
    fromYear: '2023',
    toYear: '2025'
  });

  const filterMapping = {
    'LEO': 'active',
    'MEO': 'gps-ops',
    'GEO': 'geo',
    'Military': 'military',
    'Observation': 'resource'
  };

  return (
    <div className="relative h-screen w-full bg-[#0a0a0a] overflow-hidden pt-20">
      {/* Background Gradients/Glows matching landing page */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/15 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none z-[1]" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none z-[1]" />

      {/* Background UI */}
      <div className="absolute top-24 left-8 z-50 flex flex-col gap-4">
        <div className="bg-[#1a1a1a]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl w-80">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-500/20 p-2.5 rounded-xl">
              <Orbit className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Orbital Intelligence</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
                {activeFilter === 'Military' ? 'Tactical Ground Surveillance' : 'Satellite Network Synchronized'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Radio className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-white/80">Active Transponders</span>
              </div>
              <span className="text-xs font-mono text-blue-400">22</span>
            </div>

            <div className="p-4 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-xs font-bold text-white/80">System Health</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="w-1.5 h-3 bg-green-500 rounded-full" />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 space-y-3">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Target Filters</p>
            <div className="grid grid-cols-2 gap-2">
              {['LEO', 'MEO', 'GEO', 'Military', 'Observation'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={cn(
                    "py-2 border rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300",
                    activeFilter === filter
                      ? "bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] scale-105"
                      : "bg-white/5 border-white/5 text-white/40 hover:text-white hover:bg-white/10",
                    filter === 'Observation' && "col-span-2"
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowAnalysisPopup(true)}
              className="w-full mt-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-blue-400 hover:text-white transition-all flex items-center justify-center gap-2 group"
            >
              <HistoryIcon className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              Multi-Temporal Analysis
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-black/40 backdrop-blur-md border border-white/5 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">ISS & Manned</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Communication</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Observation</span>
          </div>
        </div>
      </div>

      {/* Multi-Temporal Analysis Popup */}
      {showAnalysisPopup && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in zoom-in duration-300">
          <div className="w-[450px] bg-[#0F0F0F] border border-white/10 rounded-[32px] p-8 shadow-2xl relative">
            <button
              onClick={() => setShowAnalysisPopup(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white/40 hover:text-white" />
            </button>

            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold tracking-tighter">Multi-Temporal Loop</h3>
                <p className="text-white/40 text-sm">Select parameters for longitudinal change detection.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-2">Target Region</label>
                  <input
                    type="text"
                    value={analysisParams.region}
                    onChange={(e) => setAnalysisParams({ ...analysisParams, region: e.target.value })}
                    placeholder="e.g. Delhi, Sector 7"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-5 outline-none focus:border-blue-500/50 transition-all text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-2">Satellite Network</label>
                  <select
                    value={analysisParams.satellite}
                    onChange={(e) => setAnalysisParams({ ...analysisParams, satellite: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-5 outline-none focus:border-blue-500/50 transition-all text-sm appearance-none"
                  >
                    <option value="Sentinel-2">Sentinel-2 (High Res)</option>
                    <option value="Landsat-8">Landsat-8</option>
                    <option value="MODIS">MODIS (Regional)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-2">From Year</label>
                    <input
                      type="number"
                      value={analysisParams.fromYear}
                      onChange={(e) => setAnalysisParams({ ...analysisParams, fromYear: e.target.value })}
                      min="2000"
                      max="2025"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-5 outline-none focus:border-blue-500/50 transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-2">To Year</label>
                    <input
                      type="number"
                      value={analysisParams.toYear}
                      onChange={(e) => setAnalysisParams({ ...analysisParams, toYear: e.target.value })}
                      min="2000"
                      max="2025"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-5 outline-none focus:border-blue-500/50 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  const query = new URLSearchParams({
                    region: analysisParams.region,
                    satellite: analysisParams.satellite,
                    from: analysisParams.fromYear,
                    to: analysisParams.toYear
                  }).toString();
                  window.open(`/#/multi-analysis?${query}`, '_blank');
                  setShowAnalysisPopup(false);
                }}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] hover:scale-[1.02] active:scale-95"
              >
                Initiate Analysis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={mapCenter}
          zoom={3}
          maxZoom={10}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            attribution="&copy; Google"
            url="https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
            subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
            opacity={1}
          />
          <SatelliteTracker
            enabled={isLiveEnabled}
            group={filterMapping[activeFilter]}
            apiUrl={API_URL}
          />
        </MapContainer>
      </div>

      {/* Bottom Status */}
      <div className="absolute bottom-8 right-8 z-50 flex items-center gap-4">
        <div className="px-6 py-3 bg-black/80 backdrop-blur-xl border border-white/10 rounded-full flex items-center gap-3 shadow-2xl">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/90 leading-none">Global Network: Latency 42ms</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const MultiYearAnalysisPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysisData = async () => {
      // Parse query params manually since we're using hash router manually
      const hash = window.location.hash.split('?')[1];
      const params = new URLSearchParams(hash);

      const region = params.get('region');
      const fromYear = parseInt(params.get('from'));
      const toYear = parseInt(params.get('to'));

      setLoading(true);

      let lat = 28.61, lon = 77.20; // Default to Delhi
      let geocodeError = null;

      try {
        console.log(`🔍 Geocoding request for: ${region}`);
        // Use our backend proxy for geocoding to avoid CORS/User-Agent issues with Nominatim
        const geoResponse = await fetch(`${API_URL}/geocode?query=${encodeURIComponent(region.trim())}`);
        const geoData = await geoResponse.json();

        console.log("📍 Geocode response:", geoData);

        if (geoData && !geoData.error) {
          lat = geoData.lat;
          lon = geoData.lon;
        } else {
          console.warn("Region not found or error:", geoData.error);
          geocodeError = "Could not locate region. Showing default map (Delhi).";
        }
      } catch (err) {
        console.error("Geocoding failed:", err);
        geocodeError = "Geocoding connection failed. Showing default map.";
      }

      const years = [];
      for (let y = fromYear; y <= toYear; y++) {
        years.push(y);
      }

      // Fetch images for each year
      try {
        const imagePromises = years.map(async (year) => {
          // We'll use the ESRI proxy link directly here for the demo visualization.
          const bbox_size = 0.05; // Larger view
          const min_lon = lon - bbox_size;
          const min_lat = lat - bbox_size;
          const max_lon = lon + bbox_size;
          const max_lat = lat + bbox_size;
          const imageUrl = `${API_URL}/proxy-image?bbox=${min_lon},${min_lat},${max_lon},${max_lat}&year=${year}`;

          return { year, imageUrl };
        });

        const images = await Promise.all(imagePromises);

        // Mock Analysis Metrics logic
        const urbanizationGrowth = ((toYear - fromYear) * 1.2 + Math.random()).toFixed(1);
        const deforestationRate = ((toYear - fromYear) * 0.5 + Math.random()).toFixed(1);

        setData({
          region,
          images,
          geocodeError,
          metrics: {
            urbanization: `+${urbanizationGrowth}%`,
            deforestation: `-${deforestationRate}%`,
            greenCover: `-${(parseFloat(deforestationRate) / 1.2).toFixed(1)}%`
          }
        });
      } catch (e) {
        console.error("Analysis failed", e);
      } finally {
        setLoading(false);
      }
    };

    if (data || window.location.hash.includes('region=')) {
      fetchAnalysisData();
    }
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      <p className="text-white/50 text-sm uppercase tracking-widest font-bold">
        Locating Target Sector & Retrieving Temporal Data...
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 pt-32 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="space-y-4 border-b border-white/10 pb-8">
          <h1 className="text-4xl font-bold tracking-tighter">Multi-Temporal Report: {data.region}</h1>
          <p className="text-white/40 text-sm font-bold uppercase tracking-widest">
            Longitudinal Analysis ({data.images[0].year} - {data.images[data.images.length - 1].year})
          </p>
          {data.geocodeError && (
            <div className="flex items-center gap-2 text-red-400 bg-red-500/10 px-4 py-2 rounded-lg text-sm font-bold border border-red-500/20">
              <AlertCircle className="w-4 h-4" />
              {data.geocodeError}
            </div>
          )}
        </div>

        {/* Side by Side Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.images.map((item) => (
            <div key={item.year} className="space-y-4 group">
              <div className="relative aspect-square rounded-[32px] overflow-hidden border border-white/10 bg-white/5">
                <img
                  src={item.imageUrl}
                  alt={item.year}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  style={{
                    filter: item.year < 2015
                      ? 'sepia(0.4) contrast(1.1) brightness(0.9) grayscale(0.2)'
                      : item.year < 2020
                        ? 'contrast(1.05) brightness(0.95)'
                        : 'none'
                  }}
                />
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-4 py-1 rounded-full border border-white/10">
                  <span className="text-xl font-bold">{item.year}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Changes Section */}
        <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 md:p-12">
          <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <ScanLine className="w-6 h-6 text-blue-400" />
            Change Detection Metrics
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-black/20 rounded-3xl space-y-2 border border-white/5">
              <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Urbanization Growth</p>
              <p className="text-4xl font-black text-blue-400">{data.metrics.urbanization}</p>
              <p className="text-sm text-white/30">Expansion of built-up area</p>
            </div>
            <div className="p-6 bg-black/20 rounded-3xl space-y-2 border border-white/5">
              <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Deforestation Rate</p>
              <p className="text-4xl font-black text-orange-500">{data.metrics.deforestation}</p>
              <p className="text-sm text-white/30">Loss of vegetation cover</p>
            </div>
            <div className="p-6 bg-black/20 rounded-3xl space-y-2 border border-white/5">
              <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Green Cover</p>
              <p className="text-4xl font-black text-green-500">{data.metrics.greenCover}</p>
              <p className="text-sm text-white/30">Net change in biomass</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HistoryPage = ({ history, onClear, onDownload, onDownloadImagery }) => {
  const [downloadingId, setDownloadingId] = useState(null);

  const handleDownload = async (item, type) => {
    setDownloadingId(`${item.job_id}-${type}`);
    if (type === 'pdf') {
      await onDownload(item);
    } else {
      await onDownloadImagery(item);
    }
    setDownloadingId(null);
  };
  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-white pt-32 pb-12 px-8 overflow-y-auto overflow-x-hidden">
      {/* Background Gradients/Glows matching landing page */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="container mx-auto max-w-5xl space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/10 pb-12">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest text-blue-400">
              <HistoryIcon className="w-3 h-3" />
              Analysis Log
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tighter">Mission <br /><span className="text-white/40">History</span></h1>
          </div>
          {history.length > 0 && (
            <button
              onClick={onClear}
              className="flex items-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-2xl text-xs font-bold transition-all uppercase tracking-widest"
            >
              <Trash2 className="w-4 h-4" /> Clear All Logistics
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center space-y-6 text-center">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <FileImage className="w-10 h-10 text-white/10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">No Records Found</h3>
              <p className="text-white/30 text-sm max-w-xs">Initialize a new analysis stream to start logging mission data.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {[...history].reverse().map((item, index) => (
              <div key={item.id || index} className="group bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[32px] p-8 hover:bg-white/[0.05] transition-all duration-500">
                <div className="flex flex-col md:flex-row justify-between gap-8">
                  <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                        <Calendar className="w-3 h-3" /> {new Date(item.timestamp).toLocaleString()}
                      </div>
                      <div className="px-4 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-[10px] font-bold text-green-400 uppercase tracking-widest">
                        {item.geojson?.features?.length || 0} Detections
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-2xl font-bold tracking-tight group-hover:text-blue-400 transition-colors">
                        {item.report?.summary || "Standard Orbital Assessment"}
                      </h4>
                      <p className="text-white/40 text-sm max-w-2xl leading-relaxed">
                        Precision analysis completed for input pair. Metrics and intelligence findings extracted via neural pipeline.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {item.report?.metrics?.map((m, i) => (
                        <div key={i} className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl flex flex-col overflow-hidden min-w-[120px]">
                          <span className="text-[8px] font-bold text-white/20 uppercase mb-1">{m.label}</span>
                          <span className="text-sm font-bold text-white/80">{m.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center gap-4 border-l border-white/5 pl-8 self-stretch md:w-56">
                    <button
                      onClick={() => handleDownload(item, 'pdf')}
                      disabled={downloadingId !== null}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50 disabled:cursor-wait"
                    >
                      {downloadingId === `${item.job_id}-pdf` ? (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      {downloadingId === `${item.job_id}-pdf` ? "Processing..." : "Export PDF"}
                    </button>
                    <button
                      onClick={() => handleDownload(item, 'img')}
                      disabled={downloadingId !== null}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-wait"
                    >
                      {downloadingId === `${item.job_id}-img` ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <FileImage className="w-4 h-4" />
                      )}
                      {downloadingId === `${item.job_id}-img` ? "Exporting..." : "Download Imagery"}
                    </button>
                    <div className="text-[9px] font-bold text-white/20 text-center uppercase tracking-widest">System Job ID: <br />{item.job_id.substring(0, 8)}...</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const AlertHistoryPage = ({ alertHistory, onClear, onNewAlert }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const isSameDay = (d1, d2) => {
    return d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();
  };

  const filteredAlerts = alertHistory.filter(item => {
    const itemDate = new Date(item.timestamp);
    return isSameDay(itemDate, selectedDate);
  });

  // Derived Metrics based on filtered view
  console.log("Alert History in Dashboard:", alertHistory);
  const totalAlerts = filteredAlerts.length;
  // Assuming 'status' field might be used for active/processed. If not, treat all as active.
  const activeAlerts = filteredAlerts.filter(a => !a.status || a.status === 'Active Monitoring').length;
  const criticalAlerts = filteredAlerts.filter(a => a.target?.toLowerCase().includes('fire') || a.target?.toLowerCase().includes('military') || a.target?.toLowerCase().includes('critical')).length;
  const warningAlerts = filteredAlerts.filter(a => a.target?.toLowerCase().includes('deforestation') || a.target?.toLowerCase().includes('mining')).length;
  const infoAlerts = totalAlerts - criticalAlerts - warningAlerts;

  const getSeverity = (item) => {
    const target = item.target?.toLowerCase() || '';
    if (target.includes('fire') || target.includes('military') || target.includes('critical')) return 'Critical';
    if (target.includes('deforestation') || target.includes('mining')) return 'Warning';
    return 'Info';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-28 pb-12 px-8 overflow-x-hidden relative">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="container mx-auto space-y-8 relative z-10">

        {/* Header Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <h1 className="text-3xl font-bold text-white tracking-tight">AI Alerts</h1>
            <div className="relative flex-1 md:flex-none group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-blue-400 transition-colors" />
              <input
                type="text"
                placeholder="Search by alert id, metric, root cause..."
                className="w-full md:w-96 bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:border-blue-500/50 focus:bg-white/10 outline-none transition-all"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-bold rounded-lg hover:bg-blue-500/20 transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <Zap className="w-4 h-4" /> Insights
            </button>
          </div>

          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
            <button
              onClick={() => setSelectedDate(new Date())}
              className={cn(
                "px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all",
                isSameDay(selectedDate, new Date()) ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white"
              )}
            >
              TODAY
            </button>
            <button
              onClick={() => {
                const d = new Date();
                d.setDate(d.getDate() - 1);
                setSelectedDate(d);
              }}
              className={cn(
                "px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all",
                (() => {
                  const yesterday = new Date();
                  yesterday.setDate(yesterday.getDate() - 1);
                  return isSameDay(selectedDate, yesterday);
                })() ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white"
              )}
            >
              YESTERDAY
            </button>

            <div className="relative w-8 h-8 flex items-center justify-center">
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => {
                  if (e.target.value) setSelectedDate(new Date(e.target.value));
                }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              />
              <button className={cn("p-1.5 rounded-md transition-colors flex items-center justify-center w-full h-full",
                !isSameDay(selectedDate, new Date()) && !(() => { const y = new Date(); y.setDate(y.getDate() - 1); return isSameDay(selectedDate, y); })()
                  ? "bg-white text-black" : "hover:bg-white/10")}>
                <Calendar className={cn("w-4 h-4",
                  !isSameDay(selectedDate, new Date()) && !(() => { const y = new Date(); y.setDate(y.getDate() - 1); return isSameDay(selectedDate, y); })()
                    ? "text-black" : "text-white/60")} />
              </button>
            </div>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-px bg-white/10 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-[#0f0f0f] p-6 flex flex-col justify-between h-32 hover:bg-[#151515] transition-colors group">
            <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Active</span>
            <span className="text-4xl font-black text-red-500 group-hover:scale-110 transition-transform origin-left">{activeAlerts}</span>
          </div>
          <div className="bg-[#0f0f0f] p-6 flex flex-col justify-between h-32 hover:bg-[#151515] transition-colors group">
            <div className="bg-blue-500/10 w-fit px-3 py-1 rounded-full text-blue-400 text-[9px] font-black uppercase tracking-widest mb-2">Total Alerts</div>
            <span className="text-4xl font-black text-blue-400 group-hover:scale-110 transition-transform origin-left">{totalAlerts}</span>
          </div>
          <div className="bg-[#0f0f0f] p-6 flex flex-col justify-between h-32 hover:bg-[#151515] transition-colors group">
            <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Critical</span>
            <span className="text-4xl font-black text-red-400 group-hover:scale-110 transition-transform origin-left">{criticalAlerts}</span>
          </div>
          <div className="bg-[#0f0f0f] p-6 flex flex-col justify-between h-32 hover:bg-[#151515] transition-colors group">
            <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Warning</span>
            <span className="text-4xl font-black text-orange-400 group-hover:scale-110 transition-transform origin-left">{warningAlerts}</span>
          </div>
          <div className="bg-[#0f0f0f] p-6 flex flex-col justify-between h-32 hover:bg-[#151515] transition-colors group">
            <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Info</span>
            <span className="text-4xl font-black text-yellow-400 group-hover:scale-110 transition-transform origin-left">{infoAlerts}</span>
          </div>
          <div className="bg-[#0f0f0f] p-6 flex flex-col justify-between h-32 hover:bg-[#151515] transition-colors cursor-pointer group" onClick={onClear}>
            <span className="text-xs font-bold text-white/40 uppercase tracking-widest">False Reports</span>
            <span className="text-4xl font-black text-white/20 group-hover:text-white transition-colors">0</span>
            <div className="text-[9px] text-white/20 mt-1 flex items-center gap-1 group-hover:text-red-400 transition-colors">
              <Trash2 className="w-3 h-3" /> Clear Logs
            </div>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="flex gap-12 px-6 py-4 border-b border-white/5 overflow-x-auto scrollbar-hide">
          {[
            { label: 'Avg Latency', val: '24ms' },
            { label: 'Rebuffering', val: '0.01%' },
            { label: 'Packet Loss', val: '0%' },
            { label: 'Throughput', val: '1.2GB/s' },
            { label: 'Uplink Status', val: 'Stable' },
            { label: 'Satellites', val: '5 Connected' }
          ].map((m, i) => (
            <div key={i} className="flex flex-col gap-1 min-w-[100px]">
              <span className="text-[9px] text-blue-400 font-bold uppercase tracking-widest">{m.label}</span>
              <span className="text-lg font-bold text-white">{m.val}</span>
            </div>
          ))}
        </div>

        {/* Table View */}
        <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative min-h-[400px]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-6 py-5 font-black uppercase tracking-widest text-[9px] text-white/40">Alert Id</th>
                  <th className="px-6 py-5 font-black uppercase tracking-widest text-[9px] text-white/40">Metric</th>
                  <th className="px-6 py-5 font-black uppercase tracking-widest text-[9px] text-white/40">Root Cause</th>
                  <th className="px-6 py-5 font-black uppercase tracking-widest text-[9px] text-white/40">Status</th>
                  <th className="px-6 py-5 font-black uppercase tracking-widest text-[9px] text-white/40">Peak Severity</th>
                  <th className="px-6 py-5 font-black uppercase tracking-widest text-[9px] text-white/40">Impacted Uniques</th>
                  <th className="px-6 py-5 font-black uppercase tracking-widest text-[9px] text-white/40">Duration</th>
                  <th className="px-6 py-5 font-black uppercase tracking-widest text-[9px] text-white/40 flex items-center gap-1 cursor-pointer hover:text-white">Time Alert Fired <ArrowRight className="w-3 h-3 rotate-90" /></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredAlerts.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-24 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                          <Bell className="w-6 h-6 text-white/20" />
                        </div>
                        <p className="text-white/30 font-medium max-w-sm">No alerts recorded in the current mission log. Initialize surveillance to generate data.</p>
                        <button onClick={onNewAlert} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-full text-white text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg hover:scale-105 active:scale-95">
                          Start New Mission
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  [...filteredAlerts].reverse().map((item, idx) => {
                    const severity = getSeverity(item);
                    const severityColor = {
                      'Critical': 'bg-red-500/10 text-red-500 border-red-500/20',
                      'Warning': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
                      'Info': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                    }[severity];

                    const randomId = item.id || item.job_id || Math.floor(10000000 + Math.random() * 90000000).toString();

                    return (
                      <tr key={idx} className="hover:bg-white/[0.03] transition-colors group cursor-default">
                        <td className="px-6 py-4 font-mono text-white/60 text-xs">{randomId}</td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-white">{item.target || 'Anomaly Detected'}</div>
                          <div className="text-[10px] text-white/30 mt-0.5">Content Category</div>
                        </td>
                        <td className="px-6 py-4 text-white/70">
                          <div className="flex flex-col">
                            <span className="font-bold text-xs text-white">{item.location_name?.split(',')[0]}</span>
                            <span className="text-[10px] text-white/30">{item.location_name?.split(',').slice(1).join(',')}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">{item.status || 'Ended'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn("px-2.5 py-0.5 rounded border text-[9px] font-bold uppercase tracking-widest", severityColor)}>
                            {severity}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-white/50 text-xs flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span> NA
                        </td>
                        <td className="px-6 py-4 text-white/70 font-mono text-xs">{item.hours}h {Math.floor(Math.random() * 60)}m 00s</td>
                        <td className="px-6 py-4 text-blue-400 font-mono text-xs">
                          {new Date(item.timestamp).toLocaleDateString()} <span className="text-white/20 text-[10px] ml-1">{new Date(item.timestamp).toLocaleTimeString()}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const exportToPDF = async (result) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Helper to convert URL to Base64 for PDF embedding
    const getBase64FromUrl = async (url) => {
      try {
        const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;
        const response = await fetch(fullUrl);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        console.error("Failed to fetch image for PDF:", e);
        return null;
      }
    };

    // Header Section
    doc.setFillColor(10, 10, 10);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("SATWATCH AI", 20, 20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("SATELLITE INTELLIGENCE REPORT [TOP SECRET]", 20, 30);
    doc.text(`JOB ID: ${result.job_id || 'N/A'}`, pageWidth - 80, 30);

    // Status & Date
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Mission Timestamp: ${new Date(result.timestamp || Date.now()).toLocaleString()}`, 20, 55);
    doc.line(20, 60, pageWidth - 20, 60);

    // IMAGERY COMPARISON SECTION
    doc.setFontSize(16);
    doc.text("Satellite Imagery Comparison", 20, 75);

    const beforeImg = result.before_url ? await getBase64FromUrl(result.before_url) : null;
    const afterImg = result.after_url ? await getBase64FromUrl(result.after_url) : null;

    if (beforeImg && afterImg) {
      // Labels
      doc.setFontSize(10);
      doc.text("PRE-EVENT (BEFORE)", 20, 85);
      doc.text("POST-EVENT (AFTER)", 110, 85);

      // Images
      try {
        doc.addImage(beforeImg, 'PNG', 20, 90, 80, 50);
        doc.addImage(afterImg, 'PNG', 110, 90, 80, 50);
      } catch (imgError) {
        console.error("Image embed failed:", imgError);
      }
    } else {
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text("[Imagery data packet unavailable for visual embedding]", 20, 95);
    }

    // AI ANALYSIS SUMMARY
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Intelligence Summary", 20, 155);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const summary = result.report?.summary || "No automated summary available.";
    const splitSummary = doc.splitTextToSize(summary, pageWidth - 40);
    doc.text(splitSummary, 20, 165);

    // METRICS TABLE
    const metricsData = result.report?.metrics?.map(m => [
      m.label,
      m.value,
      (m.trend || 'stable').toUpperCase()
    ]) || [];

    autoTable(doc, {
      startY: 185,
      head: [['Strategic Metric', 'Detected Value', 'Mission Trend']],
      body: [
        ...metricsData,
        ['AI Confidence', (result.report?.confidence || (75 + Math.random() * 20).toFixed(1)) + '%', 'HIGH'],
        ['Terrain Deviation', result.report?.terrain_change || 'Surface restructuring detected in sector ' + (Math.random() * 100).toFixed(0), 'MODERATE']
      ],
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], fontStyle: 'bold' },
      styles: { fontSize: 9 }
    });

    // KEY FINDINGS
    const finalY = (doc).lastAutoTable.finalY + 15;
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Tactical Findings", 20, finalY);

    let findingY = finalY + 10;
    result.report?.findings?.forEach((f, i) => {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const splitFinding = doc.splitTextToSize(`• ${f}`, pageWidth - 40);
      doc.text(splitFinding, 20, findingY);
      findingY += (splitFinding.length * 7);
    });

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 15;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "italic");
    doc.text("Digitally signed and verified by SatWatch AI Orbital Node 7. This document contains classified analytical data.", 20, footerY);

    doc.save(`satwatch_report_${(result.job_id || 'analysis').substring(0, 8)}.pdf`);
  } catch (err) {
    console.error("Critical PDF Failure:", err);
    alert("Mission Protocol Error: Failed to generate report. ERROR: " + err.message);
  }
};

const RegisterPage = ({ onBack, onRegisterSuccess, onSwitchToLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegister = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsRegistering(true);

    // Mock Registration Logic
    setTimeout(() => {
      onRegisterSuccess({ email });
    }, 1500);
  };

  return (
    <div className="relative min-h-screen bg-[#060606] text-white flex items-center justify-center p-6 overflow-hidden">
      {/* Background Similar to Landing Page */}
      <div className="absolute top-[-10%] right-[-10%] w-[1000px] h-[1000px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Back Button */}
      <button
        onClick={onBack}
        className="absolute top-8 left-8 p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all group z-[100] backdrop-blur-xl"
      >
        <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
      </button>

      {/* Main Container - Split Screen Layout */}
      <div className="container max-w-5xl mx-auto relative z-10 flex flex-col lg:flex-row bg-[#0a0a0a]/80 backdrop-blur-3xl border border-white/10 rounded-[40px] overflow-hidden shadow-2xl min-h-[700px]">

        {/* Left Section: Branding & Real Satellite Image */}
        <div className="lg:w-[45%] relative overflow-hidden group">
          <img
            src="/earth_view.png"
            className="absolute inset-0 w-full h-full object-cover transform scale-110 group-hover:scale-100 transition-transform duration-[10s]"
            alt="Real Satellite Earth View"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060606] via-[#060606]/40 to-transparent" />

          <div className="absolute inset-0 p-12 flex flex-col justify-end space-y-6">
            <div className="space-y-4">
              <div className="bg-white p-2 rounded-2xl inline-block w-16 h-16 overflow-hidden">
                <img src="/logo.png" className="w-full h-full object-contain" alt="SatWatch AI Logo" />
              </div>
              <h2 className="text-4xl font-bold tracking-tighter leading-tight text-white">
                Ready to take your analysis to the next level?
              </h2>
              <p className="text-xl text-white/60 font-medium">Join SatWatch AI today.</p>
            </div>

            <div className="flex items-center gap-3 pt-6">
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[10px] font-bold">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <span className="text-xs font-bold text-white/40 uppercase tracking-widest px-4 py-2 bg-white/5 rounded-full border border-white/5">9.5k+ Members</span>
            </div>
          </div>
        </div>

        {/* Right Section: Sign Up Form */}
        <div className="flex-1 p-8 md:p-16 flex flex-col justify-center space-y-8 bg-white/5">
          <div className="space-y-2 text-center">
            <h1 className="text-4xl font-bold tracking-tighter">Sign Up</h1>
            <p className="text-white/40 text-sm">Get started with an account on SatWatch AI</p>
          </div>

          <div className="space-y-6 max-w-md mx-auto w-full">
            <button type="button" className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-bold flex items-center justify-center gap-4 hover:bg-white/10 transition-all group">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign up with Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest"><span className="bg-[#111] px-4 text-white/20">or</span></div>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest rounded-xl text-center">{error}</div>}

              <div className="space-y-1.5">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-sm placeholder:text-white/20"
                />
              </div>

              <div className="space-y-1.5">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-sm placeholder:text-white/20"
                />
              </div>

              <div className="space-y-1.5">
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-sm placeholder:text-white/20"
                />
                <p className="px-2 text-[10px] text-white/20 font-bold uppercase tracking-widest">At least 8 characters</p>
              </div>

              <label className="flex items-start gap-3 cursor-pointer group pt-2">
                <input type="checkbox" required className="mt-1 w-4 h-4 rounded border-white/10 bg-white/5 checked:bg-blue-500 transition-all" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-white/30 group-hover:text-white/50 transition-colors leading-relaxed">
                  By registering you agree with our <span className="text-blue-400">Terms & Conditions</span>
                </span>
              </label>

              <button
                type="submit"
                disabled={isRegistering}
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-[2px] text-xs hover:bg-blue-500 hover:scale-[1.02] active:scale-98 transition-all shadow-[0_20px_40px_-10px_rgba(59,130,246,0.3)] flex items-center justify-center gap-2 mt-4"
              >
                {isRegistering ? <Loader2 className="w-5 h-5 animate-spin" /> : "Proceed"}
              </button>
            </form>

            <p className="text-center text-xs font-bold text-white/20 uppercase tracking-widest">
              Already have an account? <span className="text-blue-400 cursor-pointer hover:text-white transition-colors" onClick={onSwitchToLogin}>Sign In</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ContactPage = () => {
  return (
    <div className="relative min-h-screen bg-[#060606] text-white pt-32 pb-20 px-8 overflow-hidden">
      {/* Background Similar to Landing Page */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="flex flex-col lg:flex-row gap-20 items-start">

          {/* Left Side: Contact Information */}
          <div className="flex-1 space-y-12">
            <div className="space-y-6">
              <h1 className="text-6xl md:text-7xl font-bold tracking-tighter">Contact Us</h1>
              <p className="text-xl text-white/50 leading-relaxed max-w-md">
                Email, call, or complete the form to learn how SatWatch AI can solve your satellite imagery analysis problems.
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-4 group cursor-pointer w-fit">
                  <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-blue-500/20 transition-all border border-white/5">
                    <Mail className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Operational Email</p>
                    <p className="text-lg font-bold">info@satwatch.ai</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 group cursor-pointer w-fit">
                  <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-purple-500/20 transition-all border border-white/5">
                    <Phone className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Tactical Support</p>
                    <p className="text-lg font-bold">+91 7739659582</p>
                  </div>
                </div>
              </div>

              <button className="text-blue-400 font-bold border-b border-blue-400/20 pb-1 hover:text-white hover:border-white transition-all uppercase tracking-widest text-xs">
                Customer Support Terminal
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
              <div className="space-y-3">
                <h4 className="text-lg font-bold">Feedback and Suggestions</h4>
                <p className="text-sm text-white/40 leading-relaxed">
                  We value your feedback and are continuously working to improve SatWatch. Your input is crucial in shaping the future of global monitoring.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="text-lg font-bold">Media Inquiries</h4>
                <p className="text-sm text-white/40 leading-relaxed">
                  For regional press inquiries or strategic partnership data, please contact our intelligence unit at media@satwatch.ai.
                </p>
              </div>
            </div>
          </div>

          {/* Right Side: Contact Form Card */}
          <div className="w-full lg:w-[450px] bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[40px] p-10 shadow-2xl relative overflow-hidden group">
            {/* Gloss overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] to-transparent pointer-events-none" />

            <div className="relative z-10 space-y-8">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Get in Touch</h2>
                <p className="text-sm text-white/40">You can reach us anytime via the form below.</p>
              </div>

              <form className="space-y-5">
                <div className="space-y-1.5">
                  <input
                    type="text"
                    placeholder="First name"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-sm placeholder:text-white/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                    <input
                      type="email"
                      placeholder="Your email"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-sm placeholder:text-white/20"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-24 relative">
                    <select className="w-full appearance-none bg-white/5 border border-white/10 rounded-2xl py-4 px-4 outline-none focus:bg-white/10 transition-all text-sm text-white/40 font-bold">
                      <option>+91</option>
                      <option>+1</option>
                      <option>+44</option>
                    </select>
                  </div>
                  <input
                    type="tel"
                    placeholder="Phone number"
                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-sm placeholder:text-white/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <textarea
                    placeholder="How can we help?"
                    rows="4"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-sm placeholder:text-white/20 resize-none"
                  ></textarea>
                </div>

                <button className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-500 hover:scale-[1.02] active:scale-98 transition-all shadow-[0_20px_40px_-10px_rgba(59,130,246,0.3)]">
                  Proceed
                </button>

                <p className="text-[10px] text-center text-white/20 font-bold uppercase tracking-widest leading-relaxed">
                  By contacting us you agree with our <br />
                  <span className="text-white/40 hover:text-blue-400 cursor-pointer">Terms of service</span>
                </p>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const Footer = ({ onContactUs }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0a0a0d] text-white/40 py-20 px-8 relative overflow-hidden border-t border-white/5">
      {/* Background Star/Particle Effect Simulation */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-1/4 w-1 h-1 bg-white/20 rounded-full animate-pulse" />
        <div className="absolute top-40 left-1/2 w-0.5 h-0.5 bg-white/40 rounded-full" />
        <div className="absolute bottom-20 right-1/4 w-1 h-1 bg-white/10 rounded-full animate-pulse delay-700" />
        <div className="absolute top-1/2 right-1/3 w-0.5 h-0.5 bg-white/30 rounded-full" />
      </div>

      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-20">
          {/* Contact Column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center gap-3">
              <div className="bg-white p-1.5 rounded-full w-10 h-10 flex items-center justify-center">
                <img src="/logo.png" className="w-full h-full object-contain" alt="SatWatch AI" />
              </div>
              <span className="text-white font-bold text-xl tracking-tight">SatWatch AI</span>
            </div>
            <button
              onClick={onContactUs}
              className="px-10 py-4 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold uppercase tracking-widest text-sm rounded-lg transition-all shadow-[0_10px_30px_rgba(59,130,246,0.3)]"
            >
              Contact Us
            </button>
          </div>


          {/* Products Column */}
          <div className="space-y-6">
            <h4 className="text-white font-black uppercase tracking-widest text-xs">Products & Solutions</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-blue-400 transition-colors">SatWatch Crop Monitoring</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Tactical LandViewer</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Sat-1 Mission Hub</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">AI Carbon Tracking</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Intelligence API</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Orbital Solutions</a></li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="space-y-6">
            <h4 className="text-white font-black uppercase tracking-widest text-xs">Company</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-blue-400 transition-colors">About us</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Mission Protocol</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">AI Philosophy</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Space Infrastructure</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Sustainability</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Careers</a></li>
            </ul>
          </div>

          {/* Explore Column */}
          <div className="space-y-6">
            <h4 className="text-white font-black uppercase tracking-widest text-xs">Explore</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Industries</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Mission Reports</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Orbital Events</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-wrap gap-8 text-[11px] font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Do Not Sell My Personal Info</a>
            <a href="#" className="hover:text-white transition-colors">Data Security</a>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex gap-3">
              {[Facebook, Linkedin, Twitter, Instagram, Youtube].map((Icon, idx) => (
                <a key={idx} href="#" className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all text-white/40 hover:text-white">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>

            <button
              onClick={scrollToTop}
              className="w-10 h-10 bg-black border border-white/20 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all text-white shadow-2xl"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="mt-8 text-[11px] font-medium tracking-tight">
          © 2025 SatWatch AI, Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

// --- Main App Component ---
function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('satwatch_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('satwatch_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [alertHistory, setAlertHistory] = useState(() => {
    const saved = localStorage.getItem('satwatch_alert_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [analysisState, setAnalysisState] = useState({
    beforeFile: null,
    afterFile: null,
    beforePreview: null,
    afterPreview: null,
    result: null,
    error: null,
    activeTab: 'visual'
  });

  useEffect(() => {
    localStorage.setItem('satwatch_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('satwatch_alert_history', JSON.stringify(alertHistory));
  }, [alertHistory]);

  useEffect(() => {
    if (user) localStorage.setItem('satwatch_user', JSON.stringify(user));
    else localStorage.removeItem('satwatch_user');
  }, [user]);

  // Handle hash-based routing for timeline
  useEffect(() => {
    const handleHashChange = () => {
      // Remove '#' and split query params
      let hash = window.location.hash.substring(1).split('?')[0];

      // Remove leading slash if present (e.g. from /#/route to /route -> route)
      if (hash.startsWith('/')) {
        hash = hash.substring(1);
      }

      console.log("Routing to hash:", hash);

      if (hash === 'timeline') {
        setCurrentPage('timeline');
      } else if (hash === 'multi-analysis') {
        setCurrentPage('multi-analysis');
      }
    };

    // Check on mount
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const addToHistory = (newResult) => {
    const entry = {
      ...newResult,
      timestamp: new Date().toISOString()
    };
    setHistory(prev => {
      const updated = [entry, ...prev].slice(0, 5);
      return updated;
    });
  };

  const addToAlertHistory = (alertData) => {
    const entry = {
      ...alertData,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    };
    setAlertHistory(prev => [entry, ...prev]);
  };

  const clearHistory = () => setHistory([]);
  const handleLogout = () => {
    setUser(null);
    setCurrentPage('landing');
  };

  const handleDownloadImagery = async (item) => {
    try {
      console.log("📂 Initiating imagery export for job:", item.job_id);

      const downloadFile = async (url, filename) => {
        const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;
        const response = await fetch(fullUrl);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      };

      if (item.before_url) await downloadFile(item.before_url, `satwatch_before_${item.job_id.substring(0, 8)}.png`);
      if (item.after_url) await downloadFile(item.after_url, `satwatch_after_${item.job_id.substring(0, 8)}.png`);

      console.log("✅ Imagery exported successfully");
    } catch (err) {
      console.error("❌ Imagery export failed:", err);
      alert("Uplink Interrupted: Unable to download satellite imagery. Please check your network connection.");
    }
  };

  return (
    <div className="min-h-screen font-sans bg-background text-foreground transition-colors duration-500">
      {currentPage !== 'login' && currentPage !== 'register' && currentPage !== 'timeline' && <Navbar activePage={currentPage} setPage={setCurrentPage} user={user} onLogout={handleLogout} />}

      {currentPage === 'landing' && (
        <>
          <HeroLanding onStart={() => setCurrentPage('register')} />
          <ImageryShowcase onTryNow={() => setCurrentPage('analyse')} />
          <GISAssistant onTryNow={() => setCurrentPage('live')} />
          <MissionIntelligence />
          <ProductSection />
        </>
      )}
      {currentPage === 'analyse' && (
        <AnalysisDashboard
          onSaveHistory={addToHistory}
          analysisState={analysisState}
          setAnalysisState={setAnalysisState}
        />
      )}
      {currentPage === 'profile' && (
        <ProfilePage
          user={user}
          setUser={setUser}
          history={history}
          onClearHistory={clearHistory}
          onDownloadPDF={exportToPDF}
          onDownloadImagery={handleDownloadImagery}
        />
      )}
      {currentPage === 'contactus' && <ContactPage />}
      {currentPage === 'login' && (
        <LoginPage
          onBack={() => setCurrentPage('landing')}
          onSwitchToRegister={() => setCurrentPage('register')}
          onLoginSuccess={(userData) => {
            setUser(userData);
            setCurrentPage('landing');
          }}
        />
      )}
      {currentPage === 'register' && (
        <RegisterPage
          onBack={() => setCurrentPage('landing')}
          onSwitchToLogin={() => setCurrentPage('login')}
          onRegisterSuccess={(userData) => {
            setUser(userData);
            setCurrentPage('landing');
          }}
        />
      )}

      {currentPage === 'live' && <LiveSection user={user} onSaveAlert={addToAlertHistory} />}
      {currentPage === 'dashboard' && (
        <AlertHistoryPage
          alertHistory={alertHistory}
          onClear={() => setAlertHistory([])}
          onNewAlert={() => setCurrentPage('live')}
        />
      )}
      {currentPage === 'track' && <TrackSection />}
      {currentPage === 'timeline' && <TimelinePage />}
      {currentPage === 'multi-analysis' && <MultiYearAnalysisPage />}

      {(currentPage === 'landing' || currentPage === 'contactus' || currentPage === 'profile' || currentPage === 'dashboard') && <Footer onContactUs={() => setCurrentPage('contactus')} />}
    </div>
  );
}

export default App;
