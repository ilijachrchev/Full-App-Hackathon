import React, { useEffect, useState } from 'react'
import { PortUtilizationCard } from "@/components/PortUtilizationCard.jsx"
import { BerthMap } from "@/components/BerthMap.jsx"
import { VesselList } from "@/components/VesselList.jsx"
import { OperationEvents } from "@/components/OperationEvents.jsx"
import { useNavigate } from "react-router-dom"

function Mainpage() {
  const navigate = useNavigate()
  const handleClick = () => navigate("/digitaltwin")

  const [vessels, setVessels] = useState([])

  // fetch vessels from backend
  useEffect(() => {
    const fetchData = () => {
      fetch("http://localhost:5000/api/vesselEvent")
        .then((res) => res.json())
        .then((data) => setVessels(data))
    }

    fetchData()
    const interval = setInterval(fetchData, 20000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6 bg-blue-900">
        <h1 className="text-xl font-semibold text-white">Ship Management Dashboard</h1>
        <nav className="ml-auto flex gap-4">
          <button className="text-sm font-medium text-white p-2">Dashboard</button>
          <button className="text-sm font-medium text-white p-2">Vessels</button>
          <button className="text-sm font-medium text-white p-2" onClick={handleClick}>Digital Twin</button>
          <button className="text-sm font-medium text-white p-2">Log in</button>
        </nav>
      </header>

      <main className="flex-1 p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <PortUtilizationCard vessels={vessels} />
          <div className="grid gap-6 md:col-span-2">
            <BerthMap vessels={vessels} /> {/* 👈 PASS VESSELS HERE */}
          </div>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <VesselList /> {/* Optional: if static, otherwise pass setVessels or similar */}
          <OperationEvents />
        </div>
      </main>
    </div>
  )
}

export default Mainpage
