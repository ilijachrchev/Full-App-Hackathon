import React, { useEffect, useState } from "react";
import { VesselInputForm } from "./VesselInputForm";
import { BerthMap } from "./BerthMap";

export default function Dashboard() {
  const [vessels, setVessels] = useState([]);
  const [status, setStatus] = useState("loading");

  const fetchVessels = () => {
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
  };

  useEffect(() => {
    fetchVessels();
  }, []);

  const handleVesselSubmit = (data) => {
    fetch("http://localhost:5000/api/vesselEvent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to submit vessel");
        return res.json();
      })
      .then(() => {
        alert("✅ Vessel submitted successfully!");
        fetchVessels();
      })
      .catch((err) => {
        console.error(err);
        alert("❌ Error submitting vessel.");
      });
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Dashboard</h1>

      {/* Form Section */}
      <div className="mb-8 border p-4 rounded-lg shadow bg-white">
        <h2 className="text-lg font-semibold mb-2">Add New Vessel</h2>
        <VesselInputForm onSubmit={handleVesselSubmit} />
      </div>

      {/* Process Queue Button */}
      {status === "connected" && (
        <button
          onClick={() => {
            fetch("http://localhost:5000/api/vesselEvent/assign", { method: "POST" })
              .then((res) => res.text())
              .then((msg) => {
                alert(msg);
                fetchVessels();
              });
          }}
          className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          🚀 Process Waiting Queue
        </button>
      )}

      {/* Status Messages */}
      {status === "loading" && <p>🔄 Connecting to backend...</p>}
      {status === "error" && <p className="text-red-500">❌ Could not connect to backend.</p>}

      {status === "connected" && (
        <>
          <div className="mb-8 border p-4 rounded-lg shadow bg-white">
            <BerthMap vessels={vessels} />
          </div>

          {/* --- Port Utilization Section --- */}
          <div className="mb-8 border p-4 rounded-lg shadow bg-white">
            <h2 className="text-lg font-semibold mb-2">Port Utilization</h2>

            {(() => {
              const berthMap = {
                A: "Tanker",
                B: "Container",
                C: "Bulk",
                D: "RoRo",
              };

              const totalBerths = Object.keys(berthMap).length;

              const occupiedBerths = new Set(
                vessels.filter((v) => v.berth_id && v.berth_id.trim() !== "").map((v) => v.berth_id)
              );

              const occupied = occupiedBerths.size;
              const available = totalBerths - occupied;
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

          {/* --- Docked and Waiting Vessels --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Docked */}
            <div>
              <h2 className="text-lg font-semibold mb-2">🟢 Docked Vessels</h2>
              <ul className="space-y-2">
                {vessels
                  .filter((v) => v.Status === "Arrived")
                  .map((v) => (
                    <li key={v.id} className="p-3 bg-green-50 border border-green-400 rounded">
                      {v.vessel_type}
                      {v.vessel_type === "Container" && v.container_subtype
                        ? ` (${v.container_subtype})`
                        : ""}
                      — {v.vessel_size}m — ETA: {v.eta_hour} — Berth: {v.berth_id}
                    </li>
                  ))}
              </ul>
            </div>

            {/* Waiting */}
            <div>
              <h2 className="text-lg font-semibold mb-2">⏳ Waiting Vessels</h2>
              <ul className="space-y-2">
                {vessels
                  .filter((v) => v.Status === "Waiting")
                  .map((v) => (
                    <li key={v.id} className="p-3 bg-yellow-50 border border-yellow-400 rounded">
                      {v.vessel_type}
                      {v.vessel_type === "Container" && v.container_subtype
                        ? ` (${v.container_subtype})`
                        : ""}
                      — {v.vessel_size}m — ETA: {v.eta_hour}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
