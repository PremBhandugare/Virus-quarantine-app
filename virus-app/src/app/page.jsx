import { useState } from 'react'
import { Activity, Stethoscope, ClipboardList, ClipboardCheck, BarChart3 } from 'lucide-react'
import { FacilityProvider } from '@/lib/store'
import { NurseDashboard } from '@/components/nurse-dashboard'
import { DoctorDashboard } from '@/components/doctor-dashboard'
import { AdminDashboard } from '@/components/admin-dashboard'
import { HeadDoctorDashboard } from '@/components/head-doctor-dashboard'

const ROLES = [
  { key: 'nurse', label: 'Nurse', icon: ClipboardCheck, name: 'Riya Patel', desc: 'Record temperatures' },
  { key: 'doctor', label: 'Doctor', icon: Stethoscope, name: 'Dr. Mehta', desc: 'Review & treat patients' },
  { key: 'admin', label: 'Admin', icon: ClipboardList, name: 'A. Khan', desc: 'Admissions & rooms' },
  { key: 'head', label: 'Head Doctor', icon: BarChart3, name: 'Dr. Reyes', desc: 'Analytics dashboard' },
]

export default function Page() {
  const [role, setRole] = useState('nurse')
  const active = ROLES.find((r) => r.key === role)

  return (
    <FacilityProvider>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-semibold leading-tight text-foreground">MediCare Quarantine Facility</h1>
                <p className="text-sm text-muted-foreground">Patient monitoring & management</p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Signed in as <span className="font-medium text-foreground">{active.name}</span>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-4 py-6">
          <nav className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="Select role">
            {ROLES.map((r) => {
              const Icon = r.icon
              const isActive = r.key === role
              return (
                <button
                  key={r.key}
                  onClick={() => setRole(r.key)}
                  aria-pressed={isActive}
                  className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                    isActive
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card hover:border-primary/40'
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
                      isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-foreground">{r.label}</span>
                    <span className="block text-xs text-muted-foreground">{r.desc}</span>
                  </span>
                </button>
              )
            })}
          </nav>

          <main className="mt-6">
            {role === 'nurse' && <NurseDashboard />}
            {role === 'doctor' && <DoctorDashboard />}
            {role === 'admin' && <AdminDashboard />}
            {role === 'head' && <HeadDoctorDashboard />}
          </main>
        </div>
      </div>
    </FacilityProvider>
  )
}
