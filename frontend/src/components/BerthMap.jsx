import React, { useEffect, useState } from "react";

export function BerthMap() {
  const [vessels, setVessels] = useState([]);

  useEffect(() => {
    const fetchData = () => {
      fetch("http://localhost:5000/api/vesselEvent")
        .then(res => res.json())
        .then(data => setVessels(data));
    };

    fetchData(); // initial fetch
    const interval = setInterval(fetchData, 20000); // every 20s
    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  const berthMap = {
    A: "Tanker",
    B: "Container",
    C: "Bulk",
    D: "RoRo"
  };

  const maxSize = 150;

  const vesselsByBerth = {};

  vessels.forEach(v => {
    if (!v.berth_id) return;
    if (!vesselsByBerth[v.berth_id]) vesselsByBerth[v.berth_id] = [];
    vesselsByBerth[v.berth_id].push(v.vessel_size);
  });

  return (
    <div className="rounded-xl border bg-white p-4 shadow-md">
      <h2 className="text-xl font-semibold mb-1">Luka Koper - Berth Map</h2>
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
          const isAvailable = total < maxSize;

          // Breakdown
          const countMap = {};
          vesselSizes.forEach(size => {
            countMap[size] = (countMap[size] || 0) + 1;
          });
          const breakdown = Object.entries(countMap)
            .map(([size, count]) => `${count} × ${size}m`)
            .join(" + ");

          const available = maxSize - total;
          const canFit = [150, 100, 75, 50].filter(size => size <= available);

          return (
            <div
              key={berthId}
              className={`w-64 p-4 rounded-lg border transition ${
                isAvailable
                  ? "border-green-500 bg-green-50"
                  : "border-blue-500 bg-blue-50"
              }`}
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
                disabled={!isAvailable}
                className={`mt-2 w-full py-1 rounded-md text-sm font-medium transition ${
                  isAvailable
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-gray-300 text-gray-700 cursor-not-allowed"
                }`}
              >
                {isAvailable ? "Available for Assignment" : "Occupied"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
