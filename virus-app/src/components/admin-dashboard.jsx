import { useState } from 'react'
import { UserPlus, LogOut, DoorOpen, DoorClosed, BadgeCheck, Users } from 'lucide-react'
import { useFacility } from '@/lib/store'

function AdmitForm() {
  const { rooms, admitPatient } = useFacility()
  const freeRooms = rooms.filter((r) => !r.occupied)
  const [form, setForm] = useState({ name: '', age: '', condition: '', room: '' })

  const submit = (e) => {
    e.preventDefault()
    if (!form.name || !form.age || !form.condition || !form.room) return
    admitPatient(form)
    setForm({ name: '', age: '', condition: '', room: '' })
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const field =
    'w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring'

  return (
    <form onSubmit={submit} className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
        <UserPlus className="h-4 w-4 text-primary" /> Admit Patient
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <input className={field} placeholder="Full name" value={form.name} onChange={set('name')} aria-label="Patient name" />
        <input className={field} type="number" placeholder="Age" value={form.age} onChange={set('age')} aria-label="Age" />
        <input
          className={`${field} sm:col-span-2`}
          placeholder="Condition / diagnosis"
          value={form.condition}
          onChange={set('condition')}
          aria-label="Condition"
        />
        <select className={`${field} sm:col-span-2`} value={form.room} onChange={set('room')} aria-label="Assign room">
          <option value="">Assign room…</option>
          {freeRooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.id} — {r.ward}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={freeRooms.length === 0}
        className="mt-3 w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {freeRooms.length === 0 ? 'No rooms available' : 'Admit patient'}
      </button>
    </form>
  )
}

function RoomGrid() {
  const { rooms } = useFacility()
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-3 font-semibold text-foreground">Room Availability</h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {rooms.map((r) => (
          <div
            key={r.id}
            className={`flex flex-col items-start gap-1 rounded-md border p-2 text-left text-sm transition-colors ${
              r.occupied
                ? 'border-destructive/30 bg-destructive/5'
                : 'border-chart-2/30 bg-chart-2/5'
            }`}
          >
            <span className="flex items-center gap-1 font-medium text-foreground">
              {r.occupied ? (
                <DoorClosed className="h-4 w-4 text-destructive" />
              ) : (
                <DoorOpen className="h-4 w-4 text-chart-2" />
              )}
              {r.id}
            </span>
            <span className="text-xs text-muted-foreground">{r.ward}</span>
            <span className={`text-xs font-medium ${r.occupied ? 'text-destructive' : 'text-chart-2'}`}>
              {r.occupied ? 'Occupied' : 'Available'}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Rooms are automatically updated when patients are admitted or discharged.</p>
    </div>
  )
}

function DischargePanel() {
  const { patients, dischargePatient } = useFacility()
  const admitted = patients.filter((p) => p.status === 'admitted')

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
        <LogOut className="h-4 w-4 text-primary" /> Discharge Patient
      </h3>
      {admitted.length === 0 ? (
        <p className="text-sm text-muted-foreground">No admitted patients.</p>
      ) : (
        <ul className="space-y-2">
          {admitted.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-2 rounded-md border border-border p-2">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {p.name}{' '}
                  {p.dischargeApproved && (
                    <span className="inline-flex items-center gap-1 text-xs text-chart-2">
                      <BadgeCheck className="h-3 w-3" /> approved
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">{p.id} · Room {p.room}</p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => dischargePatient(p.id, 'recovered')}
                  disabled={!p.dischargeApproved}
                  className="rounded-md bg-chart-2 px-2 py-1 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-40"
                >
                  Recovered
                </button>
                <button
                  onClick={() => dischargePatient(p.id, 'deceased')}
                  disabled={!p.dischargeApproved}
                  className="rounded-md bg-destructive px-2 py-1 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-40"
                >
                  Deceased
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-xs text-muted-foreground">Discharge requires doctor approval first.</p>
    </div>
  )
}

function PatientList() {
  const { patients } = useFacility()
  const admitted = patients.filter((p) => p.status === 'admitted')
  const discharged = patients.filter((p) => p.status === 'discharged')

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
        <Users className="h-4 w-4 text-primary" /> All Patients ({patients.length})
      </h3>
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Admitted ({admitted.length})</p>
        {admitted.length === 0 ? (
          <p className="text-sm text-muted-foreground pb-2">No admitted patients.</p>
        ) : (
          <ul className="space-y-1 pb-3">
            {admitted.map((p) => (
              <li key={p.id} className="flex items-center justify-between rounded-md bg-muted/40 px-2 py-1 text-sm">
                <span className="text-foreground">{p.name}</span>
                <span className="text-xs text-muted-foreground">{p.id} · Room {p.room}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Discharged ({discharged.length})</p>
        {discharged.length === 0 ? (
          <p className="text-sm text-muted-foreground">No discharged patients.</p>
        ) : (
          <ul className="space-y-1">
            {discharged.map((p) => (
              <li key={p.id} className="flex items-center justify-between rounded-md bg-muted/40 px-2 py-1 text-sm">
                <span className="text-foreground">{p.name}</span>
                <span className={`text-xs font-medium ${p.outcome === 'recovered' ? 'text-chart-2' : 'text-destructive'}`}>
                  {p.outcome}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export function AdminDashboard() {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-foreground">Manage Admissions & Discharge</h2>
        <p className="text-sm text-muted-foreground">Admit patients, process discharges, and view room availability.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <AdmitForm />
        <DischargePanel />
        <div className="lg:col-span-2">
          <RoomGrid />
        </div>
        <div className="lg:col-span-2">
          <PatientList />
        </div>
      </div>
    </section>
  )
}
