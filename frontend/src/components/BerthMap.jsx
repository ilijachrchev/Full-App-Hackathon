import React from "react";

export function BerthMap({ vessels = [] }) {
  console.log("BerthMap received vessels:", vessels); // Debug line

  const berthMap = {
    A: "Tanker",
    B: "Container",
    C: "Bulk",
    D: "RoRo"
  };

  const maxSize = 150;

  // Group only ARRIVED vessels by berth
  const vesselsByBerth = {};

  vessels.forEach(v => {
      if (!v.berth_id) return;
      if (!vesselsByBerth[v.berth_id]) vesselsByBerth[v.berth_id] = [];
      vesselsByBerth[v.berth_id].push(v.vessel_size);
    });

  return (
    <div className="rounded-xl border bg-white p-4 shadow-md">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xl font-semibold">Luka Koper - Berth Map</h2>
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span>
            <span>Partially Filled</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
            <span>Occupied</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Current berth allocation and availability
      </p>

      <div className="bg-blue-600 text-white text-sm rounded-md px-3 py-1 w-fit mb-4">
        Harbor Entrance — Water Depth: 25m
      </div>

      <div className="flex flex-wrap gap-4">
        {Object.entries(berthMap).map(([berthId, type]) => {
          const vesselSizes = vesselsByBerth[berthId] || [];
          const total = vesselSizes.reduce((sum, s) => sum + s, 0);
          const available = Math.max(0, maxSize - total);
          const canFit = [150, 100, 75, 50].filter(size => size <= available);

          let colorClass = "border-green-500 bg-green-50";
          if (total > 0 && total < maxSize) colorClass = "border-yellow-500 bg-yellow-50";
          if (total === maxSize) colorClass = "border-red-500 bg-red-50";

          const countMap = {};
          vesselSizes.forEach(size => {
            countMap[size] = (countMap[size] || 0) + 1;
          });

          const breakdown = Object.entries(countMap)
            .map(([size, count]) => `${count} × ${size}m`)
            .join(" + ");

          return (
            <div
              key={berthId}
              className={`w-64 p-4 rounded-lg border transition-colors duration-300 ${colorClass}`}
            >
              <h3 className="text-md font-semibold mb-1">Berth {berthId}</h3>
              <p className="text-sm text-muted-foreground mb-1">
                Vessel Type: {type}
              </p>
              <p className="text-sm mb-1">Max Size: {maxSize}m</p>
              <p className="text-sm mb-1">Used: {total}m</p>
              <p className="text-sm mb-1">Available: {available}m</p>
              {breakdown && (
                <p className="text-sm text-gray-600 mb-1">{breakdown}</p>
              )}
              <p className="text-sm mb-2">
                Can Fit: {canFit.length > 0 ? canFit.join("m, ") + "m" : "None"}
              </p>

              <button
                disabled={total === maxSize}
                className={`mt-2 w-full py-1 rounded-md text-sm font-medium transition ${
                  total === maxSize
                    ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
              >
                {total === maxSize ? "Occupied" : "Available for Assignment"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
