import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  Lock,
  ChevronRight,
  MapPin,
  Navigation,
  Loader2,
  Car,
  Calendar,
  Clock,
  Sparkles,
} from "lucide-react";
import { PACKAGES, TIME_SLOTS } from "../constants";
import {
  BookingDetails,
  VehicleType,
  SelectedVehicleForBooking,
} from "../types";
import { useAuth } from "../context/AuthContext";
import MultiVehicleSelector from "./MultiVehicleSelector";

const GOOGLE_MAPS_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || "";

const loadGoogleMapsScript = (callback: () => void) => {
  if (!GOOGLE_MAPS_KEY) return;
  if ((window as any).google?.maps?.places) {
    callback();
    return;
  }
  const existingScript = document.getElementById("google-maps-sdk");
  if (existingScript) {
    // Check if loaded, or listen
    if ((window as any).google?.maps?.places) {
      callback();
    } else {
      existingScript.addEventListener("load", callback);
    }
    return;
  }
  const script = document.createElement("script");
  script.id = "google-maps-sdk";
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places`;
  script.async = true;
  script.onload = () => {
    callback();
  };
  document.body.appendChild(script);
};

const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  if (GOOGLE_MAPS_KEY) {
    return new Promise((resolve) => {
      loadGoogleMapsScript(() => {
        try {
          const google = (window as any).google;
          if (!google || !google.maps || !google.maps.Geocoder) {
            fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
            )
              .then((res) => res.json())
              .then((data) => resolve(data?.display_name || `${lat}, ${lng}`))
              .catch(() => resolve(`${lat}, ${lng}`));
            return;
          }
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode(
            { location: { lat, lng } },
            (results: any, status: any) => {
              if (status === "OK" && results && results[0]) {
                resolve(results[0].formatted_address);
              } else {
                fetch(
                  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
                )
                  .then((res) => res.json())
                  .then((data) =>
                    resolve(data?.display_name || `${lat}, ${lng}`),
                  )
                  .catch(() => resolve(`${lat}, ${lng}`));
              }
            },
          );
        } catch (e) {
          console.error("Error with Google reverse geocoding", e);
          fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
          )
            .then((res) => res.json())
            .then((data) => resolve(data?.display_name || `${lat}, ${lng}`))
            .catch(() => resolve(`${lat}, ${lng}`));
        }
      });
    });
  } else {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      );
      if (res.ok) {
        const data = await res.json();
        return data?.display_name || `${lat}, ${lng}`;
      }
    } catch (err) {
      console.error(err);
    }
    return `${lat}, ${lng}`;
  }
};

interface BookingFormProps {
  initialVehicle?: VehicleType;
  initialPackageId?: string;
  onSubmit: (details: BookingDetails) => void;
  onRequireAuth?: () => void;
}

export default function BookingForm({
  initialVehicle,
  initialPackageId,
  onSubmit,
  onRequireAuth,
}: BookingFormProps) {
  const { user, userProfile, loginWithGoogle } = useAuth();
  const [details, setDetails] = useState<BookingDetails>({
    name: "",
    phone: "+91 ",
    email: "",
    address: "",
    date: "",
    timeSlot: "",
    vehicleType: initialVehicle || "hatchback",
    packageId: initialPackageId || "",
    notes: "",
    vehicles: [],
  });

  const [showMapPicker, setShowMapPicker] = useState(false);
  const [locating, setLocating] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectInProgressRef = useRef(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (
      !details.address ||
      details.address.length < 3 ||
      selectInProgressRef.current
    ) {
      setSuggestions([]);
      setIsDropdownOpen(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setSearching(true);
      if (GOOGLE_MAPS_KEY) {
        // High-accuracy Google Maps Autocomplete
        loadGoogleMapsScript(() => {
          try {
            const google = (window as any).google;
            if (!google?.maps?.places) {
              setSearching(false);
              return;
            }
            const autocompleteService =
              new google.maps.places.AutocompleteService();
            const sessionToken =
              new google.maps.places.AutocompleteSessionToken();

            // Country-wide accurate suggestions without restricting only to Telangana
            autocompleteService.getPlacePredictions(
              {
                input: details.address,
                componentRestrictions: { country: "in" },
                sessionToken: sessionToken,
              },
              (predictions: any, status: any) => {
                if (status === "OK" && predictions) {
                  const formattedSuggestions = predictions.map((p: any) => ({
                    display_name: p.description,
                    isGooglePlace: true,
                    place_id: p.place_id,
                    address: {
                      road: p.structured_formatting?.main_text || "",
                      suburb: p.structured_formatting?.secondary_text || "",
                      city: "India",
                    },
                  }));
                  setSuggestions(formattedSuggestions);
                  setIsDropdownOpen(true);
                } else {
                  setSuggestions([]);
                  setIsDropdownOpen(false);
                }
                setSearching(false);
              },
            );
          } catch (e) {
            console.error("Failed to get Google Autocomplete", e);
            setSearching(false);
          }
        });
      } else {
        // High-accuracy OpenStreetMap (Nominatim) search across India
        try {
          const queryText = details.address;
          const query = encodeURIComponent(queryText);
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5&addressdetails=1&countrycodes=in`,
          );
          if (res.ok) {
            const data = await res.json();
            setSuggestions(data || []);
            setIsDropdownOpen(data && data.length > 0);
          }
        } catch (err) {
          console.error("Error fetching address suggestions:", err);
        } finally {
          setSearching(false);
        }
      }
    }, 600);

    return () => clearTimeout(delayDebounce);
  }, [details.address]);

  const handleSelectSuggestion = (suggestion: any) => {
    selectInProgressRef.current = true;

    if (suggestion.isGooglePlace) {
      loadGoogleMapsScript(() => {
        try {
          const google = (window as any).google;
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode(
            { placeId: suggestion.place_id },
            (results: any, status: any) => {
              if (status === "OK" && results && results[0]) {
                const loc = results[0].geometry.location;
                const lat = loc.lat();
                const lng = loc.lng();

                setDetails((prev) => ({
                  ...prev,
                  address:
                    results[0].formatted_address || suggestion.display_name,
                  latitude: lat,
                  longitude: lng,
                }));

                setSuggestions([]);
                setIsDropdownOpen(false);
                setShowMapPicker(true);

                // Centering the map on chosen coordinates and placing the marker
                loadLeafletAndCentremap(lat, lng);
              }
            },
          );
        } catch (e) {
          console.error(e);
        }
      });
    } else {
      const lat = parseFloat(suggestion.lat);
      const lon = parseFloat(suggestion.lon);

      setDetails((prev) => ({
        ...prev,
        address: suggestion.display_name,
        latitude: lat,
        longitude: lon,
      }));

      setSuggestions([]);
      setIsDropdownOpen(false);
      setShowMapPicker(true);

      // Centering the map on chosen coordinates and placing the marker
      loadLeafletAndCentremap(lat, lon);
    }

    setTimeout(() => {
      selectInProgressRef.current = false;
    }, 300);
  };

  const pickerMapContainerRef = useRef<HTMLDivElement>(null);
  const pickerMapRef = useRef<any>(null);
  const pickerMarkerRef = useRef<any>(null);

  // Clean map on unmount
  useEffect(() => {
    return () => {
      if (pickerMapRef.current) {
        pickerMapRef.current.remove();
        pickerMapRef.current = null;
      }
    };
  }, []);

  // Clean map if toggled off
  useEffect(() => {
    if (!showMapPicker && pickerMapRef.current) {
      pickerMapRef.current.remove();
      pickerMapRef.current = null;
      pickerMarkerRef.current = null;
    }
  }, [showMapPicker]);

  const handleGetLiveLocation = () => {
    setLocating(true);
    setMapError(null);
    setShowMapPicker(true);

    if (!navigator.geolocation) {
      setMapError("Geolocation is not supported by your browser.");
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setDetails((prev) => ({ ...prev, latitude, longitude }));

        // Load Leaftlet dynamic and center map
        loadLeafletAndCentremap(latitude, longitude);

        // Fetch reverse geocode address via Google Maps or fallback
        try {
          const address = await reverseGeocode(latitude, longitude);
          setDetails((prev) => ({ ...prev, address }));
        } catch (err) {
          console.error("Error reverse geocoding:", err);
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        let msg = "Failed to retrieve your location.";
        if (error.code === error.PERMISSION_DENIED) {
          msg =
            "Please grant location permission in your device/browser settings.";
        }
        setMapError(msg);
        setLocating(false);
        // Fallback to center Hyderabad city centre
        loadLeafletAndCentremap(17.385, 78.4867);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const loadLeafletAndCentremap = (lat: number, lng: number) => {
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
      script.onload = () => {
        setLeafletLoaded(true);
        initPickerMap(lat, lng);
      };
      document.body.appendChild(script);
    } else {
      setLeafletLoaded(true);
      initPickerMap(lat, lng);
    }
  };

  const initPickerMap = (lat: number, lng: number) => {
    setTimeout(() => {
      const L = (window as any).L;
      if (!L || !pickerMapContainerRef.current) return;

      if (pickerMapRef.current) {
        pickerMapRef.current.setView([lat, lng], 16);
        if (pickerMarkerRef.current) {
          pickerMarkerRef.current.setLatLng([lat, lng]);
        } else {
          addMarkerToMap(L, lat, lng);
        }
        return;
      }

      pickerMapRef.current = L.map(pickerMapContainerRef.current, {
        zoomControl: true,
        attributionControl: false,
      }).setView([lat, lng], 16);

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 20,
        },
      ).addTo(pickerMapRef.current);

      addMarkerToMap(L, lat, lng);

      pickerMapRef.current.on("click", async (e: any) => {
        const { lat: clickLat, lng: clickLng } = e.latlng;
        setDetails((prev) => ({
          ...prev,
          latitude: clickLat,
          longitude: clickLng,
        }));
        if (pickerMarkerRef.current) {
          pickerMarkerRef.current.setLatLng([clickLat, clickLng]);
        }

        try {
          const address = await reverseGeocode(clickLat, clickLng);
          setDetails((prev) => ({ ...prev, address }));
        } catch (err) {
          console.error(err);
        }
      });
    }, 100);
  };

  const addMarkerToMap = (L: any, lat: number, lng: number) => {
    const customIcon = L.divIcon({
      className: "custom-pin-icon",
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px;">
          <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background-color: rgba(16, 185, 129, 0.2); border: 2px solid rgb(16, 185, 129); animation: ping 1.5s infinite; opacity: 0.6;"></div>
          <div style="position: relative; width: 14px; height: 14px; border-radius: 50%; background-color: rgb(16, 185, 129); border: 2px solid white; box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);"></div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    pickerMarkerRef.current = L.marker([lat, lng], {
      icon: customIcon,
      draggable: true,
    }).addTo(pickerMapRef.current);

    pickerMarkerRef.current.on("dragend", async (e: any) => {
      const position = e.target.getLatLng();
      const dragLat = position.lat;
      const dragLng = position.lng;
      setDetails((prev) => ({
        ...prev,
        latitude: dragLat,
        longitude: dragLng,
      }));

      try {
        const address = await reverseGeocode(dragLat, dragLng);
        setDetails((prev) => ({ ...prev, address }));
      } catch (err) {
        console.error(err);
      }
    });
  };

  useEffect(() => {
    if (initialVehicle)
      setDetails((prev) => ({ ...prev, vehicleType: initialVehicle }));
    if (initialPackageId)
      setDetails((prev) => ({ ...prev, packageId: initialPackageId }));
  }, [initialVehicle, initialPackageId]);

  useEffect(() => {
    if (user || userProfile) {
      setDetails((prev) => ({
        ...prev,
        name: userProfile?.fullName || user?.displayName || prev.name,
        email: userProfile?.email || user?.email || prev.email,
        phone: userProfile?.phone || user?.phoneNumber || prev.phone,
        address: userProfile?.address || prev.address,
      }));
    }
  }, [user, userProfile]);

  const selectedPkg = PACKAGES.find((p) => p.id === details.packageId);
  const originalPrice =
    details.vehicles && details.vehicles.length > 0
      ? details.vehicles.reduce((sum, v) => sum + v.price, 0)
      : selectedPkg
        ? selectedPkg.price[details.vehicleType || "hatchback"]
        : 0;

  const isSocietyOffer = details.vehicles && details.vehicles.length >= 3;
  const originalDiscountedPrice = isSocietyOffer
    ? Math.round(originalPrice * 0.8)
    : originalPrice;
  const cgst = Math.round(originalDiscountedPrice * 0.09);
  const sgst = Math.round(originalDiscountedPrice * 0.09);
  const totalPrice = originalDiscountedPrice + cgst + sgst;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !details.name ||
      !details.phone ||
      !details.address ||
      !details.date ||
      !details.timeSlot ||
      !details.packageId
    ) {
      alert("Please fill in all required fields.");
      return;
    }
    if (!details.vehicles || details.vehicles.length === 0) {
      alert("Please add at least one vehicle.");
      return;
    }
    onSubmit({ ...details, userId: user?.uid });
  };

  return (
    <section
      id="booking"
      className="relative px-6 md:px-16 py-24 bg-black border-t border-white/5 overflow-hidden"
    >
      {/* Background soft glow */}
      <div className="absolute hidden md:block top-1/4 -right-1/4 w-[800px] h-[800px] bg-zinc-500/10 opacity-10 rounded-full pointer-events-none" />
      <div className="absolute hidden md:block bottom-0 -left-1/4 w-[600px] h-[600px] bg-purple-500/10 opacity-10 rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center text-center mb-16">
        <div className="text-xs uppercase tracking-[0.3em] font-black text-white mb-4 drop-shadow-sm">
          Reserve Your Slot
        </div>
        <h2 className="text-[34px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-400 tracking-tight mb-4 pb-1">
          BOOK YOUR WASH
        </h2>
        <p className="text-neutral-100 max-w-md text-sm md:text-xs font-medium">
          Fill in your details and we'll arrive at your doorstep exactly when
          you need us.
        </p>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
        <form
          onSubmit={handleFormSubmit}
          className="lg:col-span-3 bg-neutral-900/95 border border-white/10 p-6 md:p-10 space-y-8 rounded-3xl shadow-2xl shadow-black/50"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-neutral-300 font-bold block">
                Full Name
              </label>
              <input
                required
                type="text"
                name="name"
                value={details.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full bg-white/5 border border-white/10 px-4 py-3 text-xs focus:border-white outline-none transition-colors rounded-lg text-white"
                style={{ backgroundColor: "#000000" }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-neutral-300 font-bold block">
                Phone Number
              </label>
              <input
                required
                type="tel"
                name="phone"
                value={details.phone}
                onChange={handleChange}
                placeholder="+91 XXXXX XXXXX"
                className="w-full bg-white/5 border border-white/10 px-4 py-3 text-xs focus:border-white outline-none transition-colors rounded-lg text-white"
                style={{ backgroundColor: "#000000" }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-neutral-300 font-bold block">
              Email Address (optional)
            </label>
            <input
              type="email"
              name="email"
              value={details.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className="w-full bg-white/5 border border-white/10 px-4 py-3 text-xs focus:border-white outline-none transition-colors rounded-lg text-white"
              style={{ backgroundColor: "#040404" }}
            />
          </div>

          <div className="space-y-4">
            <div className="relative" ref={dropdownRef}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
                <div>
                  <label className="text-xs uppercase tracking-widest text-neutral-300 font-bold block">
                    Service Address
                  </label>
                  {GOOGLE_MAPS_KEY && (
                    <div className="text-[11px] uppercase font-black tracking-widest text-white mt-1 flex items-center gap-1">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-zinc-500"></span>
                      </span>
                      Google Maps High-Accuracy
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGetLiveLocation}
                    className="flex items-center gap-1.5 text-xs text-white hover:text-neutral-300 font-black uppercase tracking-wider bg-zinc-500/10 hover:bg-zinc-500/25 px-3 py-1.5 rounded-lg border border-white/5 transition-all cursor-pointer shrink-0"
                  >
                    {locating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Locating...
                      </>
                    ) : (
                      <>
                        <Navigation className="w-3.5 h-3.5 animate-pulse" />
                        Detect Live Location
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="relative">
                <input
                  required
                  type="text"
                  name="address"
                  value={details.address}
                  onChange={(e) => {
                    handleChange(e);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => {
                    if (suggestions.length > 0) {
                      setIsDropdownOpen(true);
                    }
                  }}
                  placeholder="Type service address (with auto-complete) or pinpoint on map..."
                  className="w-full bg-black/40 border border-white/10 pl-4 pr-10 py-3.5 text-xs focus:border-neutral-500/50 focus:ring-1 focus:ring-zinc-500/50 outline-none transition-all rounded-xl text-white placeholder-neutral-600"
                  style={{ backgroundColor: "#050505" }}
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                  {searching ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <MapPin className="w-4 h-4 text-neutral-300" />
                  )}
                </div>

                {isDropdownOpen && suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 z-[1100] mt-1.5 bg-neutral-900 border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-y-auto divide-y divide-white/5">
                    {suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectSuggestion(suggestion)}
                        className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors flex items-start gap-2.5 group cursor-pointer"
                      >
                        <MapPin className="w-4 h-4 text-white shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-neutral-100 truncate">
                            {suggestion.address?.road ||
                              suggestion.address?.suburb ||
                              suggestion.address?.city ||
                              "Search Result"}
                          </div>
                          <div className="text-xs text-neutral-100 font-medium truncate mt-0.5">
                            {suggestion.display_name}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {showMapPicker && (
              <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5 p-4 space-y-3">
                <div className="flex justify-between items-center mr-1">
                  <div className="text-xs uppercase font-black text-white tracking-wider flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-500"></span>
                    </span>
                    Drag Pin or Click Map To Adjust Destination Location
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMapPicker(false)}
                    className="text-neutral-100 hover:text-white text-xs font-bold cursor-pointer"
                  >
                    Hide Map
                  </button>
                </div>

                <div
                  ref={pickerMapContainerRef}
                  className="w-full h-48 sm:h-56 rounded-lg bg-black/40 border border-white/5 overflow-hidden"
                  id="picker-map"
                />

                {details.latitude && details.longitude && (
                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-100 bg-black/20 px-3 py-2 rounded-lg">
                    <span className="text-neutral-300">
                      GPS Coords:{" "}
                      <span className="text-neutral-300">
                        {details.latitude.toFixed(6)},{" "}
                        {details.longitude.toFixed(6)}
                      </span>
                    </span>
                    <span className="text-white uppercase font-bold text-[11px] tracking-wide">
                      Coordinates Locked
                    </span>
                  </div>
                )}
                {mapError && (
                  <div className="text-xs text-red-400 font-medium">
                    {mapError}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-neutral-300 font-bold block">
                Preferred Date
              </label>
              <input
                required
                type="date"
                name="date"
                value={details.date}
                min={new Date().toISOString().split("T")[0]}
                onChange={handleChange}
                className="w-full bg-black/40 border border-white/10 px-4 py-3.5 text-xs focus:border-neutral-500/50 focus:ring-1 focus:ring-zinc-500/50 outline-none transition-all rounded-xl text-white [color-scheme:dark]"
                style={{ borderColor: "#c2bbbb" }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-neutral-300 font-bold block">
                Time Slot
              </label>
              <select
                required
                name="timeSlot"
                value={details.timeSlot}
                onChange={handleChange}
                className="w-full bg-white/10 border border-white/20 px-4 py-3.5 text-xs font-medium focus:border-neutral-500/50 focus:ring-1 focus:ring-zinc-500/50 outline-none transition-all appearance-none rounded-xl text-white shadow-sm"
                style={{ backgroundColor: "#000000" }}
              >
                <option value="" className="bg-black">
                  Select a slot
                </option>
                {TIME_SLOTS.map((s) => (
                  <option key={s} value={s} className="bg-black">
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4 md:col-span-2">
              <label className="text-xs uppercase tracking-widest text-neutral-300 font-bold block mb-2">
                Package
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {PACKAGES.map((p) => {
                  const isMonthly = p.id === "monthly";
                  const isSelected = details.packageId === p.id;
                  return (
                    <label
                      key={p.id}
                      className={`relative cursor-pointer flex flex-col p-5 rounded-2xl border transition-all duration-300 ${
                        isSelected
                          ? isMonthly
                            ? "bg-zinc-600/10 border-zinc-500 shadow-[0_0_20px_rgba(255,255,255,0.2)] scale-[1.02]"
                            : "bg-white/10 border-white text-white scale-[1.02]"
                          : "bg-black/40 border-white/10 hover:border-white/30 hover:bg-white/5"
                      } ${isMonthly && !isSelected ? "mt-3 sm:mt-0" : ""}`}
                      style={{ backgroundColor: "#000000" }}
                    >
                      <input
                        type="radio"
                        name="packageId"
                        value={p.id}
                        required
                        checked={isSelected}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      {isMonthly && (
                        <motion.div
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{
                            repeat: Infinity,
                            duration: 2.5,
                            ease: "easeInOut",
                          }}
                          className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full border border-white/60 bg-gradient-to-r from-black via-zinc-800 to-black animate-slow-shine shadow-[0_0_20px_rgba(255,255,255,0.15)] whitespace-nowrap flex items-center gap-1.5"
                          style={{
                            width: "277.33299999999997px",
                            height: "27.2778px",
                            marginTop: "1px",
                            paddingTop: "5px",
                            paddingLeft: "15px",
                            borderColor: "#484c4c",
                            borderWidth: "2.888889px",
                          }}
                        >
                          <Sparkles className="w-3 h-3 text-white animate-pulse" />
                          <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.3em] text-white">
                            Dritzz Black Membership
                          </span>
                          <Sparkles className="w-3 h-3 text-white animate-pulse" />
                        </motion.div>
                      )}
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`font-bold uppercase tracking-[0.15em] text-[14px] ${isSelected ? "text-white" : "text-neutral-300"}`}
                        >
                          {p.name}
                        </span>
                        {isSelected && (
                          <div
                            className={`w-2.5 h-2.5 rounded-full ${isMonthly ? "bg-zinc-400 shadow-[0_0_12px_rgba(255,255,255,0.8)]" : "bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]"}`}
                          />
                        )}
                      </div>
                      <span className="text-[11px] uppercase tracking-wider text-neutral-100 font-medium leading-relaxed">
                        {p.tagline}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="md:col-span-2 mt-4">
              <MultiVehicleSelector
                defaultPackageId={details.packageId}
                selectedVehicles={details.vehicles}
                onChange={(vehicles) => setDetails({ ...details, vehicles })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-neutral-300 font-bold block">
              Special Instructions
            </label>
            <textarea
              name="notes"
              value={details.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Any specific areas to focus on..."
              className="w-full bg-black/40 border border-white/10 px-4 py-3.5 text-xs focus:border-neutral-500/50 focus:ring-1 focus:ring-zinc-500/50 outline-none transition-all resize-none rounded-xl text-white placeholder-neutral-600"
            />
          </div>
        </form>

        <div className="lg:col-span-2 space-y-6 lg:sticky lg:top-32">
          <div className="relative overflow-hidden bg-neutral-900/95 border border-white/10 text-white p-8 md:p-10 rounded-3xl shadow-2xl shadow-black/50">
            {/* Subtle glow inside card */}
            <div className="absolute hidden md:block top-0 right-0 w-64 h-64 bg-zinc-500/5 opacity-10 rounded-full pointer-events-none" />

            <h3 className="relative font-bold text-xs tracking-widest uppercase mb-8 pb-4 border-b border-white/10 text-neutral-300">
              Order Summary
            </h3>

            <div className="relative space-y-4 mb-8">
              {details.vehicles && details.vehicles.length > 0 ? (
                <div className="space-y-3">
                  {details.vehicles.map((v, idx) => (
                    <div
                      key={idx}
                      className="bg-[#111827]/80 rounded-2xl p-4 flex items-center justify-between shadow-inner shadow-white/5 border border-white/5"
                      style={{ backgroundColor: "#000000" }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 shrink-0 rounded-full bg-zinc-500/10 border border-white/5 flex items-center justify-center">
                          <Car className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white font-bold">
                            {v.brand || "Custom Vehicle"} {v.model || ""}
                          </span>
                          <span className="text-xs text-neutral-100 capitalize">
                            ({v.type})
                          </span>
                          {v.vehicleNumber && (
                            <span className="text-[11px] text-neutral-300 font-mono mt-0.5">
                              {v.vehicleNumber}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-lg font-bold text-white shrink-0 ml-4">
                        ₹{v.price}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className="bg-[#111827]/80 rounded-2xl p-4 flex items-center justify-between shadow-inner shadow-white/5 border border-white/5"
                  style={{ backgroundColor: "#000000" }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-zinc-500/10 border border-white/5 flex items-center justify-center">
                      <Car className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white font-bold">
                        Custom Vehicle
                      </span>
                      <span className="text-xs text-neutral-100 capitalize">
                        ({details.vehicleType})
                      </span>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-white shrink-0 ml-4">
                    ₹
                    {selectedPkg
                      ? selectedPkg.price[details.vehicleType || "hatchback"]
                      : 0}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-4 py-3 border-b border-white/5">
                <Calendar className="w-5 h-5 text-white shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-[0.2em] text-neutral-300 font-bold mb-1">
                    Date
                  </span>
                  <span className="text-white font-bold">
                    {details.date
                      ? new Date(details.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })
                      : "—"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 py-3 border-b border-white/5">
                <Clock className="w-5 h-5 text-white shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-[0.2em] text-neutral-300 font-bold mb-1">
                    Slot
                  </span>
                  <span className="text-white font-bold">
                    {details.timeSlot || "—"}
                  </span>
                </div>
              </div>

              <div className="pt-4">
                <span className="text-xs uppercase tracking-[0.2em] text-white font-bold mb-4 block">
                  Price Breakdown
                </span>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs border-b border-white/5 pb-3">
                    <span className="text-neutral-100 font-medium tracking-wide">
                      Service Amount
                    </span>
                    <span className="font-bold text-white text-xs">
                      ₹{originalDiscountedPrice}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-b border-white/5 pb-3">
                    <span className="text-neutral-100 font-medium tracking-wide">
                      CGST (9%)
                    </span>
                    <span className="font-bold text-white text-xs">
                      ₹{cgst}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-b border-white/5 pb-3">
                    <span className="text-neutral-100 font-medium tracking-wide">
                      SGST (9%)
                    </span>
                    <span className="font-bold text-white text-xs">
                      ₹{sgst}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-white/5 pt-6">
                <label className="text-xs uppercase tracking-widest text-neutral-300 font-bold block mb-3">
                  Apply Promo Code
                </label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="ENTER DISCOUNT CODE"
                      className="w-full bg-black/40 border border-white/10 px-4 py-3.5 text-xs focus:border-neutral-500/50 focus:ring-1 focus:ring-zinc-500/50 outline-none transition-all rounded-xl text-white font-mono uppercase placeholder-neutral-600"
                    />
                  </div>
                  <button
                    type="button"
                    className="px-5 py-3.5 bg-zinc-600/10 hover:bg-zinc-600/20 text-white border border-white/10 text-[11px] font-black uppercase tracking-widest rounded-xl transition-colors shrink-0"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>

            <div className="hidden md:flex relative overflow-hidden bg-[#0a0a0a] rounded-2xl p-6 md:p-8 justify-between items-end mb-10 border border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.03)] transition-all duration-300">
              <div className="absolute hidden md:block top-0 right-0 w-48 h-48 bg-zinc-500/10 opacity-10 rounded-full pointer-events-none" />
              <div className="absolute hidden md:block bottom-0 left-0 w-32 h-32 bg-zinc-400/5 opacity-10 rounded-full pointer-events-none" />
              <div className="flex flex-col gap-1.5 relative z-10">
                <span className="font-bold text-xs uppercase tracking-widest text-white drop-shadow-sm">
                  Total Amount
                </span>
                <span className="text-xs uppercase tracking-[0.1em] text-neutral-100">
                  Incl. of GST
                </span>
                {isSocietyOffer && (
                  <span className="text-[11px] text-white font-black uppercase tracking-widest bg-zinc-500/30 px-2 py-0.5 rounded border border-zinc-400/30 mt-2 inline-block w-fit shadow-sm shadow-zinc-500/20">
                    20% OFF APPLIED
                  </span>
                )}
              </div>
              <div className="flex flex-col items-end relative z-10">
                <span className="text-5xl font-black text-white tracking-tighter drop-shadow-lg">
                  ₹{totalPrice}
                </span>
                {isSocietyOffer && (
                  <span className="text-xs text-neutral-300/60 line-through decoration-zinc-500/40 mt-1 font-medium">
                    ₹{Math.round(originalPrice * 1.18)}
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                if (!user && onRequireAuth) {
                  onRequireAuth();
                } else if (!user) {
                  loginWithGoogle();
                } else {
                  handleFormSubmit(e);
                }
              }}
              className="hidden md:flex w-full relative btn-primary group overflow-hidden"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
              {user ? (
                <>
                  Confirm Booking{" "}
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              ) : (
                <>
                  Sign In to Book{" "}
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="hidden md:flex relative mt-6 items-center justify-center gap-2 text-neutral-300 text-xs uppercase tracking-widest font-bold">
              <Lock className="w-3 h-3 text-neutral-100" /> 100% Secure &
              Encrypted
            </div>

            {/* Mobile Sticky Booking Bar */}
            <div className="md:hidden sticky bottom-0 left-0 right-0 bg-[#0A0A0C]/95 backdrop-blur-xl border-t border-white/10 p-4 pb-4 z-[90] flex items-center justify-between gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] -mx-6 px-6 mt-8">
              <div className="flex flex-col min-w-[100px]">
                <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">
                  Total Amount
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-white tracking-tighter">
                    ₹{totalPrice}
                  </span>
                  {isSocietyOffer && (
                    <span className="text-[9px] text-white font-black uppercase tracking-widest bg-zinc-500/30 px-1 py-0.5 rounded border border-zinc-400/30">
                      20% OFF
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  if (!user && onRequireAuth) {
                    onRequireAuth();
                  } else if (!user) {
                    loginWithGoogle();
                  } else {
                    handleFormSubmit(e);
                  }
                }}
                className="flex-1 bg-white hover:bg-neutral-200 text-black font-black uppercase tracking-widest text-[11px] py-3.5 rounded-xl shadow-lg border border-white flex items-center justify-center gap-1 transition-colors"
                style={{
                  backgroundColor: "#ffffff",
                  borderColor: "#ffffff",
                  color: "#000000",
                }}
              >
                {user ? "Confirm" : "Sign In"}{" "}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
