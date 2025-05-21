// src/components/mainpage/Mainpage.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'

import PortUtilizationCard from '@/components/PortUtilizationCard'
import BerthMap           from '@/components/BerthMap'
import VesselList         from '@/components/VesselList'
import OperationEvents    from '@/components/OperationEvents'

export default function Mainpage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-blue-900 px-6">
        <h1 className="text-xl font-semibold text-white">Ship Management Dashboard</h1>
        <nav className="ml-auto flex gap-4">
          <button className="text-sm font-medium text-white p-2">Dashboard</button>
          <button className="text-sm font-medium text-white p-2">Vessels</button>
          <button
            className="text-sm font-medium text-white p-2"
            onClick={() => navigate('/digitaltwin')}
          >
            Digital Twin
          </button>
          <button className="text-sm font-medium text-white p-2">Log in</button>
        </nav>
      </header>

      <main className="flex-1 p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <PortUtilizationCard />
          <div className="grid gap-6 md:col-span-2">
            <BerthMap />
          </div>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <VesselList />
          <OperationEvents />
        </div>
      </main>
    </div>
  )
}
