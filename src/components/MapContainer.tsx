import React, { useState, useEffect, useRef } from "react";
import { Navigation, ShieldCheck, MapPin, Play, RefreshCw, Compass, Copy, Check, Settings, AlertTriangle, Eye, HelpCircle } from "lucide-react";
import { LatLng } from "../types";
import { soundEffects } from "./SoundManager";
import { GoogleMap, useJsApiLoader, DirectionsService, DirectionsRenderer, MarkerF } from "@react-google-maps/api";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapContainerProps {
  farmerLocation: LatLng;
  machineLocation: LatLng;
  distanceKm: number;
  etaMinutes: number;
  machineName: string;
  vehicleNumber: string;
  onSimulateStep?: () => void;
  showSimulationBtn?: boolean;
  gpsLoading?: boolean;
  gpsError?: string | null;
}

export default function MapContainer({
  farmerLocation,
  machineLocation,
  distanceKm,
  etaMinutes,
  machineName,
  vehicleNumber,
  onSimulateStep,
  showSimulationBtn = false,
  gpsLoading = false,
  gpsError = null
}: MapContainerProps) {
  const [copied, setCopied] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  // Read Google Maps API Key from localStorage or environment variables
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem("danya_google_maps_api_key") || import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
  });
  const [tempKey, setTempKey] = useState(apiKey);

  const [useGoogleMaps, setUseGoogleMaps] = useState<boolean>(() => {
    return !!(localStorage.getItem("danya_google_maps_api_key") || import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
  });

  // Safe coordinates validation
  const isCoordsValid = (loc?: LatLng) => {
    if (!loc) return false;
    const lat = Number(loc.lat);
    const lng = Number(loc.lng);
    return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
  };

  const hasValidLocations = isCoordsValid(farmerLocation) && isCoordsValid(machineLocation);

  // Haversine geodesic distance calculator as safety fallback
  const calculateGeodesicDistance = (loc1: LatLng, loc2: LatLng) => {
    if (!isCoordsValid(loc1) || !isCoordsValid(loc2)) return 0;
    const R = 6371; // Earth's radius in km
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLng = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; 
    return d > 0.02 ? Number(d.toFixed(2)) : 0;
  };

  const computedDistance = hasValidLocations ? calculateGeodesicDistance(farmerLocation, machineLocation) : 0;
  const liveDistance = computedDistance > 0 ? computedDistance : (distanceKm > 0 ? distanceKm : 0);
  const liveEta = computedDistance > 0 ? Math.round(computedDistance * 7) : (distanceKm > 0 ? etaMinutes : 0);

  // Universal driving direction URL
  const googleMapsUrl = hasValidLocations
    ? `https://www.google.com/maps/dir/?api=1&origin=${machineLocation.lat},${machineLocation.lng}&destination=${farmerLocation.lat},${farmerLocation.lng}&travelmode=driving`
    : "";

  const handleOpenGoogleMaps = () => {
    if (!hasValidLocations) {
      soundEffects.playClick();
      alert("⚠️ GPS error: Cannot open Google Maps navigation. Valid Farmer or Machine location is missing!");
      return;
    }
    soundEffects.playClick();
    window.open(googleMapsUrl, "_blank", "noopener,noreferrer");
  };

  // ----------------- DUAL ENGINE IMPLEMENTATION -----------------

  // 1. Google Maps JS Loader
  const { isLoaded, loadError } = useJsApiLoader({
    id: "danya-google-map-script",
    googleMapsApiKey: apiKey
  });

  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

  useEffect(() => {
    if (useGoogleMaps && isLoaded && apiKey && hasValidLocations) {
      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin: new google.maps.LatLng(machineLocation.lat, machineLocation.lng),
          destination: new google.maps.LatLng(farmerLocation.lat, farmerLocation.lng),
          travelMode: google.maps.TravelMode.DRIVING
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            setDirections(result);
          } else {
            console.error(`Directions request failed due to: ${status}`);
          }
        }
      );
    }
  }, [useGoogleMaps, isLoaded, farmerLocation.lat, farmerLocation.lng, machineLocation.lat, machineLocation.lng, apiKey, hasValidLocations]);

  // 2. Leaflet Map Fallback Ref Hook
  const leafletContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!useGoogleMaps && leafletContainerRef.current && hasValidLocations) {
      // Clear previous map instance if it exists
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }

      // Initialize Leaflet
      const map = L.map(leafletContainerRef.current, {
        zoomControl: true,
        attributionControl: false
      }).setView([farmerLocation.lat, farmerLocation.lng], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19
      }).addTo(map);

      leafletMapRef.current = map;

      // Custom animated premium marker icons (HTML divIcons)
      const farmerIcon = L.divIcon({
        html: `<div class="relative flex items-center justify-center">
                 <div class="absolute w-8 h-8 bg-red-500/30 rounded-full animate-ping"></div>
                 <div class="w-7 h-7 bg-red-600 rounded-full border-2 border-white shadow flex items-center justify-center text-white">📍</div>
               </div>`,
        className: "",
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const machineIcon = L.divIcon({
        html: `<div class="relative flex items-center justify-center">
                 <div class="absolute w-9 h-9 bg-emerald-500/30 rounded-full animate-pulse"></div>
                 <div class="w-8 h-8 bg-emerald-600 rounded-lg border-2 border-white shadow flex items-center justify-center text-base">🚜</div>
               </div>`,
        className: "",
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      // Add pins
      L.marker([farmerLocation.lat, farmerLocation.lng], { icon: farmerIcon })
        .addTo(map)
        .bindPopup("<b>Basanna's Farm</b><br>(Target Field)");

      L.marker([machineLocation.lat, machineLocation.lng], { icon: machineIcon })
        .addTo(map)
        .bindPopup(`<b>${machineName}</b><br>${vehicleNumber}`);

      // Add polyline connection route
      L.polyline(
        [
          [machineLocation.lat, machineLocation.lng],
          [farmerLocation.lat, farmerLocation.lng]
        ],
        {
          color: "#059669",
          weight: 4,
          dashArray: "6, 6"
        }
      ).addTo(map);

      // Scale indicator
      L.control.scale({ imperial: false, position: "bottomleft" }).addTo(map);

      // Fit bounds to show both pins
      const bounds = L.latLngBounds([
        [farmerLocation.lat, farmerLocation.lng],
        [machineLocation.lat, machineLocation.lng]
      ]);
      map.fitBounds(bounds, { padding: [40, 40] });
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [useGoogleMaps, farmerLocation.lat, farmerLocation.lng, machineLocation.lat, machineLocation.lng, hasValidLocations]);

  // Save Custom Key settings
  const handleSaveApiKey = () => {
    soundEffects.playSuccess();
    if (tempKey.trim() === "") {
      localStorage.removeItem("danya_google_maps_api_key");
      setApiKey("");
      setUseGoogleMaps(false);
      alert("Google Maps API Key cleared. Switched to OpenStreetMap interactive engine.");
    } else {
      localStorage.setItem("danya_google_maps_api_key", tempKey.trim());
      setApiKey(tempKey.trim());
      setUseGoogleMaps(true);
      alert("Google Maps API Key saved! Loading real Google Maps engine.");
    }
    setShowConfig(false);
  };

  // ----------------- RENDER LOADING / ERRORS -----------------
  if (gpsLoading) {
    return (
      <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center p-8 text-center h-[340px] space-y-4 shadow-sm animate-pulse">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <div>
          <h4 className="text-xs font-black uppercase text-emerald-600 tracking-wider">Getting GPS location...</h4>
          <p className="text-[10px] text-zinc-500 mt-1">Interrogating satellites for high accuracy coordinates.</p>
        </div>
      </div>
    );
  }

  if (gpsError) {
    return (
      <div className="bg-rose-50 dark:bg-rose-950/10 border border-rose-250 dark:border-rose-900/35 rounded-2xl flex flex-col items-center justify-center p-8 text-center h-[340px] space-y-4 shadow-sm">
        <AlertTriangle className="h-12 w-12 text-rose-600 animate-bounce" />
        <div>
          <h4 className="text-sm font-black text-rose-800 dark:text-rose-400 uppercase tracking-widest">
            {gpsError === "Location permission denied" ? "Location Permission Denied" : "Unable to Fetch Location"}
          </h4>
          <p className="text-[11px] text-rose-600 dark:text-rose-350 max-w-sm mt-1.5 leading-relaxed font-semibold">
            {gpsError === "Location permission denied"
              ? "GPS access blocked. Please allow location permissions in your browser or phone configuration to see interactive layouts."
              : "Satellites signal timed out. Please verify device GPS is physically switched online."}
          </p>
        </div>
        {showSimulationBtn && onSimulateStep && (
          <button
            type="button"
            onClick={onSimulateStep}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow"
          >
            Use कर्नाटक State Agrarian Fallback
          </button>
        )}
      </div>
    );
  }

  if (!hasValidLocations) {
    return (
      <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center p-8 text-center h-[340px] space-y-3 shadow-xs">
        <MapPin className="h-10 w-10 text-zinc-400" />
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-zinc-500">Invalid Coordinates (0,0)</h4>
          <p className="text-[10.5px] text-zinc-400 max-w-xs mt-1 leading-relaxed">
            Latitude or longitude is missing or uncalibrated. Switch on GPS Live Satellites above to capture real driving locations!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="interactive-gps-map" className="relative bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-md flex flex-col h-[380px] transition-all">
      
      {/* Map Header */}
      <div className="p-3 bg-white/95 dark:bg-zinc-800/95 backdrop-blur-md flex items-center justify-between border-b border-zinc-100 dark:border-zinc-700 z-10">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
            <Compass className="h-3.5 w-3.5 animate-spin-slow" />
            Interactive Satellite Path
          </h4>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
            {useGoogleMaps ? "Google Maps JS Engine" : "Leaflet OpenStreetMap Engine"} &bull; {liveDistance} km
          </p>
        </div>
        
        <div className="flex items-center gap-1.5 z-20">
          {showSimulationBtn && liveDistance > 0 && (
            <button 
              type="button"
              onClick={() => {
                soundEffects.playClick();
                if (onSimulateStep) onSimulateStep();
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-[10px] font-bold transition-all hover:scale-105 active:scale-95 shadow-sm uppercase tracking-wider"
            >
              <Play className="h-2.5 w-2.5 fill-current" />
              Simulate Commute
            </button>
          )}

          {/* RETHEME / API GEAR PANEL */}
          <button
            type="button"
            onClick={() => {
              soundEffects.playClick();
              setShowConfig(!showConfig);
            }}
            className={`p-1.5 rounded-lg border transition ${
              showConfig 
                ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 text-emerald-700" 
                : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-250 text-zinc-500"
            }`}
            title="Configure Map API Engine"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Slide-Down API Key Configuration Panel */}
      {showConfig && (
        <div className="absolute top-[52px] inset-x-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-4 z-40 shadow-lg animate-slide-in space-y-3">
          <div className="space-y-1">
            <label className="block text-[10px] font-black uppercase text-zinc-400">Google Maps JavaScript API Key</label>
            <p className="text-[9px] text-zinc-500 leading-normal">
              Enter your developer key to unlock premium routing. Leaves blank to safely fallback to OpenStreetMap.
            </p>
          </div>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="AIzaSy..."
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              className="flex-1 bg-zinc-50 dark:bg-zinc-950 border dark:border-zinc-850 px-3 py-2 rounded-xl text-xs font-mono text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={handleSaveApiKey}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-sm"
            >
              Apply Key
            </button>
          </div>
        </div>
      )}

      {/* MAP VIEWER CANVAS AREA */}
      <div className="flex-1 relative overflow-hidden bg-zinc-50 dark:bg-zinc-950 min-h-[220px]">
        {useGoogleMaps && isLoaded ? (
          // ---------------- ENGINE A: REAL GOOGLE MAPS ----------------
          <GoogleMap
            mapContainerClassName="w-full h-full"
            center={new google.maps.LatLng(farmerLocation.lat, farmerLocation.lng)}
            zoom={13}
            options={{
              disableDefaultUI: false,
              zoomControl: true,
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: false
            }}
          >
            {directions ? (
              <DirectionsRenderer
                directions={directions}
                options={{
                  polylineOptions: {
                    strokeColor: "#059669",
                    strokeWeight: 5
                  }
                }}
              />
            ) : (
              <>
                <MarkerF
                  position={{ lat: farmerLocation.lat, lng: farmerLocation.lng }}
                  title="Farmer Location"
                  label="📍"
                />
                <MarkerF
                  position={{ lat: machineLocation.lat, lng: machineLocation.lng }}
                  title={machineName}
                  label="🚜"
                />
              </>
            )}
          </GoogleMap>
        ) : (
          // ---------------- ENGINE B: INTERACTIVE LEAFLET ----------------
          <div ref={leafletContainerRef} className="w-full h-full z-0 leaflet-map-container" />
        )}

        {/* Floating Quick Action Overlay */}
        <div className="absolute bottom-3 right-3 bg-zinc-950/85 backdrop-blur-xs text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-90 transition z-30 shadow-md flex items-center gap-1 cursor-pointer hover:bg-zinc-900 border border-zinc-800"
             onClick={handleOpenGoogleMaps}>
          🗺️ Live Directions
        </div>
      </div>

      {/* Info Strip Footer */}
      <div className="p-3 bg-zinc-50 dark:bg-zinc-850/50 border-t border-zinc-150 dark:border-zinc-700 flex align-center justify-between text-xs items-center">
        <div className="flex gap-4">
          <div>
            <span className="block text-[8px] uppercase text-zinc-400 dark:text-zinc-500 font-bold tracking-wider">Distance Estimate</span>
            <span className="font-extrabold text-zinc-800 dark:text-zinc-200">{liveDistance} KiloMeters</span>
          </div>
          <div className="pl-4 border-l border-zinc-250 dark:border-zinc-750">
            <span className="block text-[8px] uppercase text-zinc-400 dark:text-zinc-500 font-bold tracking-wider">Estimated Time (ETA)</span>
            <span className="font-extrabold text-amber-600 dark:text-[#FFC107]">{liveEta} Minutes</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Universal navigate driving link */}
          <button
            type="button"
            onClick={handleOpenGoogleMaps}
            className="flex items-center gap-1 bg-zinc-950 text-white hover:bg-zinc-900 dark:bg-emerald-600 dark:hover:bg-emerald-700 font-extrabold text-[10px] px-3.5 py-2 rounded-lg transition uppercase tracking-wider shadow-sm select-none border border-zinc-850"
            title="Launch professional Google Maps satellite pathing"
          >
            <Compass className="h-3.5 w-3.5 animate-pulse" />
            Navigate / ಲೈವ್ ರೂಟ್
          </button>

          {/* Copy URL clipboard button */}
          <button
            type="button"
            onClick={async () => {
              soundEffects.playClick();
              try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                  await navigator.clipboard.writeText(googleMapsUrl);
                } else {
                  const ta = document.createElement("textarea");
                  ta.value = googleMapsUrl;
                  document.body.appendChild(ta);
                  ta.select();
                  document.execCommand("copy");
                  document.body.removeChild(ta);
                }
                setCopied(true);
                setTimeout(() => setCopied(false), 2500);
              } catch (err) {
                console.error("Clipboard copy failed", err);
              }
            }}
            className="flex items-center gap-1 bg-zinc-200 hover:bg-zinc-250 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 font-bold text-[10px] px-3 py-2 rounded-lg transition uppercase tracking-wider border border-zinc-300/40"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-zinc-500" />
                Copy Route
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
