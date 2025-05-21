import React, { useState, useMemo, useEffect } from "react";
import { Info, X } from "lucide-react";

export function BerthMap({ vessels = [], simTime, onDepart }) {
  const maxSize = 150;
  const berthMap = { A: "Tanker", B: "Container", C: "Bulk", D: "RoRo" };

  // Group vessels by berth
  const vesselsByBerth = useMemo(
    () =>
      vessels.reduce((acc, v) => {
        if (!v.berth_id) return acc;
        (acc[v.berth_id] ||= []).push(v);
        return acc;
      }, {}),
    [vessels]
  );

  // Unload duration (hrs)
  const unloadDuration = (size) => {
    switch (size) {
      case 50:
        return 1;
      case 75:
        return 1.5;
      case 100:
        return 2;
      case 150:
        return 3;
      default:
        return 1;
    }
  };

  // Time helpers
  const parseTime = (str) => new Date(`1970-01-01T${str}`);
  const formatTime = (dt) =>
    dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Build a map of vesselID -> departureTimestamp (ms)
  const departures = useMemo(() => {
    const map = {};
    vessels.forEach((v) => {
      const tstr = v.eta_hour || v.eta;
      if (!tstr) return;
      const etaMs = parseTime(tstr).getTime();
      map[v.id] = etaMs + unloadDuration(v.vessel_size) * 3600 * 1000;
    });
    return map;
  }, [vessels]);

  // Track which vessels we've already fired depart for
  const [done, setDone] = useState(new Set());

  // Watch simTime and fire onDepart exactly once per vessel
  useEffect(() => {
    Object.entries(departures).forEach(([id, depMs]) => {
      if (simTime >= depMs && !done.has(id)) {
        console.warn(
          `🚢 Departing vessel ${id} at simulated time ${new Date(
            simTime
          ).toLocaleTimeString()}`
        );
        onDepart(Number(id));
        setDone((s) => new Set(s).add(id)); 
      }
    });
  }, [simTime, departures, onDepart, done]);

  const [activeBerth, setActiveBerth] = useState(null);

  return (
    <>
      <div className="rounded-xl border bg-white p-4 shadow-md">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-semibold">Luka Koper - Berth Map</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Current berth allocation and availability
        </p>
        <div className="flex flex-wrap gap-4">
          {Object.entries(berthMap).map(([berthId, type]) => {
            const assigned = vesselsByBerth[berthId] || [];
            const used = assigned.reduce((sum, v) => sum + v.vessel_size, 0);
            const available = Math.max(0, maxSize - used);
            const statusColor =
              used === 0
                ? "border-green-500 bg-green-50"
                : used < maxSize
                ? "border-yellow-500 bg-yellow-50"
                : "border-red-500 bg-red-50";

            return (
              <div
                key={berthId}
                className={`relative w-64 p-4 rounded-lg border ${statusColor}`}
              >
                <button
                  className="absolute top-2 right-2 p-1 hover:bg-gray-200 rounded"
                  onClick={() => setActiveBerth(berthId)}
                  aria-label={`Details for Berth ${berthId}`}
                >
                  <Info className="h-5 w-5 text-gray-600" />
                </button>

                <h3 className="text-md font-semibold mb-1">Berth {berthId}</h3>
                <p className="text-sm text-muted-foreground mb-1">
                  Type: {type}
                </p>
                <p className="text-sm mb-1">Max: {maxSize}m</p>
                <p className="text-sm mb-1">Used: {used}m</p>
                <p className="text-sm mb-1">Available: {available}m</p>

                <button
                  disabled={used >= maxSize}
                  className={`mt-3 w-full py-1 rounded-md text-sm font-medium transition ${
                    used >= maxSize
                      ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                      : "bg-green-500 text-white hover:bg-green-600"
                  }`}
                >
                  {used >= maxSize ? "Occupied" : "Available for Assignment"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {activeBerth && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 max-h-[80vh] overflow-y-auto p-6 relative">
            <button
              className="absolute top-3 right-3 p-1 hover:bg-gray-200 rounded"
              onClick={() => setActiveBerth(null)}
              aria-label="Close"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
            <h3 className="text-lg font-semibold mb-4">
              Berth {activeBerth} Details
            </h3>
            <ul className="space-y-4">
              {(vesselsByBerth[activeBerth] || []).map((v) => {
                const etaDate = parseTime(v.eta_hour || v.eta);
                const depDate = new Date(
                  etaDate.getTime() + unloadDuration(v.vessel_size) * 3600 * 1000
                );
                return (
                  <li key={v.id} className="border-b pb-2">
                    <div className="flex justify-between">
                      <strong>{v.name}</strong>
                      <span className="text-sm text-gray-500">
                        Dep: {formatTime(depDate)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      ID: {v.id} • Type: {v.vessel_type} • Size:{" "}
                      {v.vessel_size}m
                    </p>
                    <p className="text-xs text-gray-600">
                      ETA: {formatTime(etaDate)}
                    </p>
                  </li>
                );
              })}
              {!(vesselsByBerth[activeBerth] || []).length && (
                <li>No vessels berthed.</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
