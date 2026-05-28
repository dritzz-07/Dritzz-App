import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import {
  SavedVehicle,
  SelectedVehicleForBooking,
  VehicleType,
  Package,
} from "../types";
import { Car, Plus, X } from "lucide-react";
import { PACKAGES } from "../constants";

interface Props {
  selectedVehicles: SelectedVehicleForBooking[];
  onChange: (vehicles: SelectedVehicleForBooking[]) => void;
  defaultPackageId: string;
}

export default function MultiVehicleSelector({
  selectedVehicles,
  onChange,
  defaultPackageId,
}: Props) {
  const { user } = useAuth();
  const [savedVehicles, setSavedVehicles] = useState<SavedVehicle[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      setLoading(true);
      getDocs(
        query(collection(db, "vehicles"), where("userId", "==", user.uid)),
      )
        .then((snap) => {
          const v = snap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as SavedVehicle[];
          setSavedVehicles(v);
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  // Sync prices if default package changes
  useEffect(() => {
    if (selectedVehicles.length > 0) {
      const pkg =
        PACKAGES.find((p) => p.id === defaultPackageId) || PACKAGES[0];
      const updated = selectedVehicles.map((v) => ({
        ...v,
        packageId: defaultPackageId,
        price: pkg.price[v.type] || 0,
      }));
      // Check if price/package changed
      if (
        updated.some(
          (v, i) =>
            v.price !== selectedVehicles[i].price ||
            v.packageId !== selectedVehicles[i].packageId,
        )
      ) {
        onChange(updated);
      }
    }
  }, [defaultPackageId, selectedVehicles, onChange]);

  const toggleVehicle = (v: SavedVehicle) => {
    const existing = selectedVehicles.find((sv) => sv.vehicleId === v.id);
    if (existing) {
      onChange(selectedVehicles.filter((sv) => sv.vehicleId !== v.id));
    } else {
      const pkg =
        PACKAGES.find((p) => p.id === defaultPackageId) || PACKAGES[0];
      const sv: SelectedVehicleForBooking = {
        vehicleId: v.id,
        type: v.type,
        brand: v.brand,
        model: v.model,
        vehicleNumber: v.vehicleNumber,
        color: v.color,
        date: "",
        timeSlot: "",
        packageId: defaultPackageId,
        price: pkg.price[v.type] || 0,
      };
      onChange([...selectedVehicles, sv]);
    }
  };

  const addCustomVehicle = (type: VehicleType) => {
    const pkg = PACKAGES.find((p) => p.id === defaultPackageId) || PACKAGES[0];
    const sv: SelectedVehicleForBooking = {
      type,
      date: "",
      timeSlot: "",
      packageId: defaultPackageId,
      price: pkg.price[type] || 0,
    };
    onChange([...selectedVehicles, sv]);
  };

  const removeCustom = (index: number) => {
    const newV = [...selectedVehicles];
    newV.splice(index, 1);
    onChange(newV);
  };

  if (!defaultPackageId) {
    return (
      <div
        className="p-8 bg-white/5 border border-white/10 rounded-xl text-center"
        style={{ backgroundColor: "#000000" }}
      >
        <Car className="w-8 h-8 text-white/20 mx-auto mb-3" />
        <p className="text-xs font-bold text-white/60 uppercase tracking-widest">
          Select a package to add vehicles
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4" style={{ backgroundColor: "#000000" }}>
      {savedVehicles.length > 0 && (
        <div>
          <label className="block text-xs uppercase text-neutral-300 mb-3 font-bold">
            Select Saved Vehicles
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {savedVehicles.map((v) => {
              const isSelected = selectedVehicles.some(
                (sv) => sv.vehicleId === v.id,
              );
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => toggleVehicle(v)}
                  className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "bg-zinc-500/10 border-neutral-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                      : "bg-black/50 border-white/10 hover:border-white/30"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${isSelected ? "bg-zinc-500/20 text-white" : "bg-white/5 text-white/80"}`}
                  >
                    <Car className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-xs font-bold">
                      {v.brand} {v.model}
                    </div>
                    <div className="text-neutral-100 text-xs font-mono">
                      {v.vehicleNumber} •{" "}
                      <span className="uppercase">{v.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-white/70 font-mono text-xs">
                      ₹
                      {
                        (
                          PACKAGES.find((p) => p.id === defaultPackageId) ||
                          PACKAGES[0]
                        ).price[v.type as VehicleType]
                      }
                    </span>
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center ${isSelected ? "bg-zinc-500 border-zinc-500" : "border-white/20"}`}
                    >
                      {isSelected && (
                        <svg
                          className="w-3 h-3 text-black"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-white/10 mt-6">
        <label className="block text-xs uppercase text-neutral-300 mb-3 font-bold">
          {selectedVehicles.length > 0
            ? "Add Another Vehicle"
            : savedVehicles.length > 0
              ? "Or Add A Vehicle"
              : "Add Vehicle"}
        </label>
        <div className="flex flex-wrap gap-2">
          {(["hatchback", "sedan", "suv", "muv"] as VehicleType[]).map((t) => {
            const pkg =
              PACKAGES.find((p) => p.id === defaultPackageId) || PACKAGES[0];
            const price = pkg.price[t];
            return (
              <button
                type="button"
                key={`add-${t}`}
                onClick={() => addCustomVehicle(t)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs text-white uppercase font-bold flex items-center gap-2 transition-all"
              >
                <Plus className="w-3 h-3" /> Add {t}{" "}
                <span className="text-white/80 font-mono ml-1">₹{price}</span>
              </button>
            );
          })}
        </div>
        {selectedVehicles.length > 0 && (
          <p className="text-xs text-white/80 font-bold mt-3 font-mono">
            You can add multiple vehicles to this booking.
          </p>
        )}
      </div>

      {/* Show newly added custom (non-saved) vehicles */}
      {selectedVehicles.filter((v) => !v.vehicleId).length > 0 && (
        <div className="mt-4 space-y-3">
          {selectedVehicles.map((v, i) => {
            if (v.vehicleId) return null;
            return (
              <div
                key={i}
                className="flex flex-col gap-3 p-4 bg-black/40 border border-white/10 rounded-xl relative overflow-hidden group"
              >
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-500/20 flex items-center justify-center">
                      <Car className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white text-xs uppercase font-bold tracking-widest">
                      {v.type}{" "}
                      <span className="text-neutral-300 font-medium lowercase">
                        ({PACKAGES.find((p) => p.id === defaultPackageId)?.name}
                        )
                      </span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCustom(i)}
                    className="text-red-400 p-2 hover:bg-red-500/20 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10">
                  <input
                    type="text"
                    placeholder="Vehicle Name (e.g. Swift, Creta)"
                    value={v.brand || ""}
                    onChange={(e) => {
                      const newV = [...selectedVehicles];
                      newV[i] = { ...newV[i], brand: e.target.value };
                      onChange(newV);
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-neutral-500/50 focus:ring-1 focus:ring-zinc-500/50 transition-all placeholder-neutral-500"
                  />
                  <input
                    type="text"
                    placeholder="Vehicle No. (e.g. TS09XX1234)"
                    value={v.vehicleNumber || ""}
                    onChange={(e) => {
                      const newV = [...selectedVehicles];
                      newV[i] = {
                        ...newV[i],
                        vehicleNumber: e.target.value.toUpperCase(),
                      };
                      onChange(newV);
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white uppercase focus:outline-none focus:border-neutral-500/50 focus:ring-1 focus:ring-zinc-500/50 transition-all placeholder-neutral-500"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedVehicles.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <span className="text-xs text-neutral-100 font-bold uppercase tracking-widest">
            {selectedVehicles.length} vehicle
            {selectedVehicles.length > 1 ? "s" : ""} selected
          </span>
        </div>
      )}
    </div>
  );
}
