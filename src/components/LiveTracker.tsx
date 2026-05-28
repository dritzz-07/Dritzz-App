import React, { useEffect, useRef, useState } from "react";
import {
  MapPin,
  Navigation,
  Compass,
  Shield,
  User,
  Star,
  Clock,
  Info,
} from "lucide-react";

interface LiveTrackerProps {
  bookingId: string;
  refId: string;
  address: string;
  status: string;
  onClose: () => void;
  latitude?: number;
  longitude?: number;
}

export default function LiveTracker({
  bookingId,
  refId,
  address,
  status,
  onClose,
  latitude,
  longitude,
}: LiveTrackerProps) {
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const washerMarkerRef = useRef<any>(null);
  const routePolylineRef = useRef<any>(null);

  // Status-based tracker step
  // pending -> Preparing
  // confirmed -> En Route
  // completed -> Arrived/Washing/Finished
  // cancelled -> Recall
  const getSubStatus = (statusStr: string) => {
    switch (statusStr.toLowerCase()) {
      case "cancelled":
        return {
          title: "Cancelled",
          desc: "This booking has been cancelled.",
          eta: "-- mins",
          washerState: "recalled",
          step: 0,
        };
      case "completed":
        return {
          title: "Job Completed",
          desc: "Your vehicle has been successfully washed & sanitised.",
          eta: "Completed",
          washerState: "finished",
          step: 4,
        };
      case "confirmed":
        return {
          title: "En Route",
          desc: "Dritzz expert is driving towards your location.",
          eta: "12 mins",
          washerState: "moving",
          step: 2,
        };
      default: // pending
        return {
          title: "Preparing Dispatch",
          desc: "Assigning nearest service crew & prepping tools.",
          eta: "25 mins",
          washerState: "preparing",
          step: 1,
        };
    }
  };

  const tracker = getSubStatus(status);

  // Dynamic geocoding/coordinates synthesis based on address and refId
  const getCoordinates = (addr: string, ref: string): [number, number] => {
    const addrLower = addr.toLowerCase();
    let base: [number, number] = [18.5204, 73.8567]; // Default Pune, India

    if (
      addrLower.includes("delhi") ||
      addrLower.includes("noida") ||
      addrLower.includes("gurgaon")
    ) {
      base = [28.6139, 77.209];
    } else if (
      addrLower.includes("mumbai") ||
      addrLower.includes("thane") ||
      addrLower.includes("navi")
    ) {
      base = [19.076, 72.8777];
    } else if (
      addrLower.includes("bangalore") ||
      addrLower.includes("bengaluru")
    ) {
      base = [12.9716, 77.5946];
    } else if (addrLower.includes("chennai")) {
      base = [13.0827, 80.2707];
    } else if (addrLower.includes("kolkata")) {
      base = [22.5726, 88.3639];
    } else if (addrLower.includes("hyderabad")) {
      base = [17.385, 78.4867];
    } else {
      // Deterministic offset based on reference ID to place it uniquely
      let hash = 0;
      for (let i = 0; i < ref.length; i++) {
        hash = ref.charCodeAt(i) + ((hash << 5) - hash);
      }
      const latOffset = ((Math.abs(hash) % 150) - 75) / 2000;
      const lngOffset = ((Math.abs(hash >> 3) % 150) - 75) / 2000;
      base = [18.5204 + latOffset, 73.8567 + lngOffset];
    }
    return base;
  };

  const customerCoords =
    latitude && longitude
      ? ([latitude, longitude] as [number, number])
      : getCoordinates(address, refId);

  // Load Leaflet resources dynamically
  useEffect(() => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    if (!(window as any).L) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.onload = () => setLeafletLoaded(true);
      document.body.appendChild(script);
    } else {
      setLeafletLoaded(true);
    }
  }, []);

  // Initialize and animate Map
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    // Destroy existing map if it exists
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Create Leaflet Map with beautiful CartoDB Dark Matter tiles
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView(customerCoords, 14);

    mapRef.current = map;

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        maxZoom: 19,
      },
    ).addTo(map);

    // Beautiful Custom Icons
    const customerIcon = L.divIcon({
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-10 h-10 bg-zinc-500/20 rounded-full animate-ping"></div>
          <div class="w-7 h-7 bg-zinc-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.6)] border-2 border-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="text-white"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
        </div>
      `,
      className: "",
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    const washerIcon = L.divIcon({
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-12 h-12 bg-white/15 rounded-full animate-pulse"></div>
          <div class="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.7)] border-2 border-black">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="text-black"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1 .4-1 1v7c0 .6.4 1 1 1h1"/><circle cx="18.5" cy="17" r="2.5"/><circle cx="7.5" cy="17" r="2.5"/><path d="M13 17H9"/></svg>
          </div>
        </div>
      `,
      className: "",
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });

    // Customer Target Marker
    L.marker(customerCoords, { icon: customerIcon })
      .addTo(map)
      .bindPopup(
        `<div class="text-xs font-bold text-neutral-800">Your Car Location</div>`,
      )
      .openPopup();

    // Setup simulated vehicle location based on status
    if (tracker.washerState === "recalled") {
      // Show recalled far away
      const washerStart: [number, number] = [
        customerCoords[0] + 0.015,
        customerCoords[1] + 0.012,
      ];
      washerMarkerRef.current = L.marker(washerStart, {
        icon: washerIcon,
      }).addTo(map);
      routePolylineRef.current = L.polyline([washerStart, customerCoords], {
        color: "#ef4444",
        weight: 3,
        dashArray: "5, 8",
        opacity: 0.5,
      }).addTo(map);
    } else if (tracker.washerState === "finished") {
      // Washer is at customer's house
      washerMarkerRef.current = L.marker(customerCoords, {
        icon: washerIcon,
      }).addTo(map);
    } else if (tracker.washerState === "preparing") {
      // Preparing inside workshop
      const washerStart: [number, number] = [
        customerCoords[0] - 0.012,
        customerCoords[1] - 0.015,
      ];
      washerMarkerRef.current = L.marker(washerStart, {
        icon: washerIcon,
      }).addTo(map);
      routePolylineRef.current = L.polyline([washerStart, customerCoords], {
        color: "#ffffff",
        weight: 3,
        dashArray: "4, 8",
        opacity: 0.4,
      }).addTo(map);
    } else {
      // Animated Transit
      const startCoord: [number, number] = [
        customerCoords[0] - 0.016,
        customerCoords[1] - 0.011,
      ];
      washerMarkerRef.current = L.marker(startCoord, {
        icon: washerIcon,
      }).addTo(map);

      // Create neon-cyan path line
      const routePoints: [number, number][] = [
        startCoord,
        [startCoord[0] + 0.004, startCoord[1] + 0.003],
        [startCoord[0] + 0.007, startCoord[1] + 0.006],
        [startCoord[0] + 0.011, startCoord[1] + 0.007],
        [startCoord[0] + 0.014, startCoord[1] + 0.009],
        customerCoords,
      ];

      routePolylineRef.current = L.polyline(routePoints, {
        color: "#06b6d4", // Cyan neon
        weight: 4,
        opacity: 0.8,
      }).addTo(map);

      // Animate movement loop
      let stepIdx = 0;
      const animateRoute = () => {
        if (!washerMarkerRef.current || !mapRef.current) return;

        const p1 = routePoints[stepIdx];
        const p2 = routePoints[(stepIdx + 1) % routePoints.length];

        let interpCount = 0;
        const totalInterpSteps = 45;

        const moveInterval = setInterval(() => {
          if (!washerMarkerRef.current) {
            clearInterval(moveInterval);
            return;
          }

          const ratio = interpCount / totalInterpSteps;
          const currentLat = p1[0] + (p2[0] - p1[0]) * ratio;
          const currentLng = p1[1] + (p2[1] - p1[1]) * ratio;

          washerMarkerRef.current.setLatLng([currentLat, currentLng]);
          interpCount++;

          if (interpCount > totalInterpSteps) {
            clearInterval(moveInterval);
            stepIdx = (stepIdx + 1) % (routePoints.length - 1);
            // Wait 1.5 seconds and trigger next leg
            setTimeout(animateRoute, 1500);
          }
        }, 30);
      };

      animateRoute();
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [leafletLoaded, status]);

  return (
    <div className="bg-neutral-950 border border-white/10 rounded-2xl overflow-hidden mt-4 shadow-xl">
      {/* Header Info */}
      <div className="bg-neutral-900 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 bg-zinc-500 rounded-full animate-ping shrink-0" />
          <div>
            <h4 className="text-xs font-black text-white tracking-wide uppercase">
              Live Wash Tracker
            </h4>
            <p className="text-neutral-300 font-mono text-xs">
              Reference: {refId}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-neutral-300 hover:text-white text-xs font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 transition-colors self-start sm:self-auto"
        >
          Minimise Map
        </button>
      </div>

      {/* Map Stage Container */}
      <div className="relative w-full h-[260px] bg-neutral-900 overflow-hidden">
        <div
          ref={mapContainerRef}
          className="w-full h-full"
          style={{ minHeight: "260px" }}
        />

        {/* Dynamic Map HUD Overlays */}
        <div className="absolute top-3 left-3 z-[10] bg-black/75  px-3 py-2 rounded-xl border border-white/10 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-white" />
          <div className="text-left font-mono">
            <div className="text-[11px] text-neutral-300 font-bold uppercase leading-none">
              ETA
            </div>
            <div className="text-xs font-black text-white leading-tight">
              {tracker.eta}
            </div>
          </div>
        </div>

        <div className="absolute bottom-3 right-3 z-[10] bg-black/75  px-3 py-2 rounded-xl border border-white/10 flex items-center gap-2">
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <div className="text-left font-mono text-[11px] text-neutral-100">
            {tracker.washerState === "moving"
              ? "WASHER EN ROUTE"
              : tracker.washerState === "finished"
                ? "SERVICES COMPLETE"
                : "GPS LOCKED"}
          </div>
        </div>
      </div>

      {/* Driver Detail & Progress Stepper */}
      <div className="p-5 space-y-5 bg-neutral-900 border-t border-white/5">
        {/* Stepper progress */}
        <div className="relative flex justify-between items-center px-2">
          {/* Progress bar line */}
          <div className="absolute left-6 right-6 top-[15px] h-0.5 bg-white/10 z-0">
            <div
              className="h-full bg-zinc-500 transition-all duration-1000"
              style={{ width: `${(tracker.step / 4) * 100}%` }}
            />
          </div>

          {/* Step circles */}
          {["Booked", "Dispatched", "En Route", "Washing", "Finished"].map(
            (name, idx) => {
              const isCompleted = tracker.step >= idx;
              const isActive = tracker.step === idx;
              const isCancelled = status.toLowerCase() === "cancelled";
              return (
                <div
                  key={name}
                  className="relative z-10 flex flex-col items-center"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-md transition-colors duration-300
                  ${
                    isCancelled
                      ? "bg-red-500/10 border-red-500 text-red-500"
                      : isCompleted
                        ? "bg-zinc-500/10 border-zinc-500 text-white border-2"
                        : "bg-neutral-800 border-neutral-700 text-neutral-300 border border-dashed"
                  }
                  ${isActive ? "scale-110 shadow-[0_0_12px_rgba(16,185,129,0.3)] ring-4 ring-zinc-500/15" : ""}`}
                  >
                    {isCancelled ? "✕" : isCompleted ? "✓" : idx + 1}
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-neutral-300 mt-2">
                    {name}
                  </span>
                </div>
              );
            },
          )}
        </div>

        {/* Crew assignment info */}
        <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 border border-white/15 rounded-xl flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xs uppercase font-black tracking-widest text-neutral-300">
                Service Pro
              </div>
              <div className="text-xs font-bold text-white">
                Amar & Vinay (Dritzz Crew)
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-xs text-neutral-100 font-bold">
                  4.9 · Verified Wash Experts
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:items-end justify-center">
            <div className="text-xs uppercase font-black tracking-widest text-neutral-300">
              Service Location
            </div>
            <div className="text-xs text-neutral-300 font-medium truncate max-w-[200px] mt-0.5">
              {address}
            </div>
          </div>
        </div>

        <div className="text-center sm:text-left text-xs text-neutral-300 leading-relaxed flex items-center justify-center sm:justify-start gap-2">
          <Info className="w-4 h-4 text-neutral-600 shrink-0" />
          <span>{tracker.desc} For support call +91 7075504625.</span>
        </div>
      </div>
    </div>
  );
}
