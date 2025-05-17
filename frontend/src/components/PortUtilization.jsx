import React, { useEffect, useState } from "react";

export default function PortUtilization() {
  const [data, setData] = useState({
    total: 0,
    occupied: 0,
    available: 0,
    scheduledToday: 0,
  });

  useEffect(() => {
    fetch("http://localhost:5000/api/vesselEvent")
      .then((res) => res.json())
      .then((vessels) => {
        const totalBerths = 4; // adjust if dynamic later
        const today = new Date().toISOString().split("T")[0];

        const occupied = vessels.filter(v => v.status === "Berthing" || v.status === "Berthed").length;
        const scheduledToday = vessels.filter(v => v.eta_hour && v.eta_hour.startsWith(today)).length;
        const available = totalBerths - occupied;

        setData({
          total: totalBerths,
          occupied,
          available,
          scheduledToday
        });
      });
  }, []);

  const utilization = (data.occupied / data.total) * 100;

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-lg font-bold mb-2">Port Utilization</h2>
      <p className="mb-2">Berth Utilization</p>
      <div className="w-full h-3 bg-gray-200 rounded-full mb-4">
        <div
          className="h-full bg-blue-600 rounded-full"
          style={{ width: `${utilization}%` }}
        ></div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>Total Berths: {data.total}</div>
        <div>Occupied: {data.occupied}</div>
        <div>Available: {data.available}</div>
        <div>Scheduled Today: {data.scheduledToday}</div>
      </div>
    </div>
  );
}
