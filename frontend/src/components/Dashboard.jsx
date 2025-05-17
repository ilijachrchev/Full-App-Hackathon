import React, { useEffect, useState } from "react";

export default function Dashboard() {
  const [vessels, setVessels] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    fetch("http://localhost:5000/api/vesselEvent")
      .then((res) => {
        if (!res.ok) throw new Error("API not responding");
        return res.json();
      })
      .then((data) => {
        setVessels(data);
        setStatus("connected");
      })
      .catch((err) => {
        console.error("Connection error:", err);
        setStatus("error");
      });
  }, []);

  return (
  <div className="p-4">
    <h1 className="text-xl font-bold mb-4">Dashboard</h1>

    {status === "loading" && <p>🔄 Connecting to backend...</p>}
    {status === "error" && <p className="text-red-500">❌ Could not connect to backend.</p>}

    {status === "connected" && (
      <>
        {/* --- Port Utilization Section --- */}
        <div className="mb-8 border p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Port Utilization</h2>

          {(() => {
            const berthMap = {
              A: "Tanker",
              B: "Container",
              C: "Bulk",
              D: "RoRo",
            };

            const totalBerths = Object.keys(berthMap).length;

            // Assume all vessels with a berth_id are "occupying"
            const occupiedBerths = new Set(
              vessels
                .filter(v => v.berth_id && v.berth_id.trim() !== "")
                .map(v => v.berth_id)
            );

            const occupied = occupiedBerths.size;
            const available = totalBerths - occupied;

            // Temporary logic — since we don’t have a full date
            const scheduledToday = vessels.length;

            const utilization = ((occupied / totalBerths) * 100).toFixed(0);

            return (
              <>
                <div className="w-full bg-gray-200 h-3 rounded-full mb-3">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${utilization}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="bg-white p-2 rounded border">Total Berths: {totalBerths}</div>
                  <div className="bg-white p-2 rounded border">Occupied: {occupied}</div>
                  <div className="bg-white p-2 rounded border">Available: {available}</div>
                  <div className="bg-white p-2 rounded border">Scheduled Today: {scheduledToday}</div>
                </div>
              </>
            );
          })()}
        </div>

        {/* --- Vessel List --- */}
        <div>
          <h2 className="font-semibold mb-2">Vessels</h2>
          <ul className="space-y-1">
            {vessels.map((v) => (
              <li key={v.id} className="p-2 border rounded">
                {v.vessel_type} — {v.vessel_size}m — ETA: {v.eta_hour} — Berth: {v.berth_id}
              </li>
            ))}
          </ul>
        </div>
      </>
    )}
  </div>
);
}
