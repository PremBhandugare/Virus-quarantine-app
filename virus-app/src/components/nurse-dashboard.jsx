import { useState } from 'react'
import { Thermometer, Check, CircleAlert, Inbox } from 'lucide-react'
import { useFacility } from '@/lib/store'

function NurseCard({ patient }) {
  const { addTemperature, markChecked, today } = useFacility()
  const [temp, setTemp] = useState('')
  const todayReading = patient.temperatures.find((t) => t.date === today)
  const latest = patient.temperatures[patient.temperatures.length - 1]

  const submit = (e) => {
    e.preventDefault()
    const v = parseFloat(temp)
    if (Number.isNaN(v) || v < 30 || v > 45) return
    addTemperature(patient.id, v)
    setTemp('')
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-foreground">{patient.name}</p>
          <p className="text-xs text-muted-foreground">
            {patient.id} · Room {patient.room} · {patient.condition}
          </p>
        </div>
        {patient.checkedToday ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-chart-2/15 px-2 py-1 text-xs font-medium text-chart-2">
            <Check className="h-3 w-3" /> Checked
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">
            <CircleAlert className="h-3 w-3" /> Pending
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2 text-sm">
        <Thermometer className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Latest:</span>
        <span className={`font-semibold ${latest && latest.value >= 38 ? 'text-destructive' : 'text-foreground'}`}>
          {latest ? `${latest.value}°C` : '—'}
        </span>
        {todayReading && <span className="text-xs text-muted-foreground">(today recorded)</span>}
      </div>

      <form onSubmit={submit} className="mt-3 flex items-center gap-2">
        <input
          type="number"
          step="0.1"
          value={temp}
          onChange={(e) => setTemp(e.target.value)}
          placeholder="Today's temp °C"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          aria-label={`Today's temperature for ${patient.name}`}
        />
        <button
          type="submit"
          className="shrink-0 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Add
        </button>
      </form>

      {!patient.checkedToday && (
        <button
          onClick={() => markChecked(patient.id)}
          className="mt-2 w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/70"
        >
          Mark patient checked
        </button>
      )}
    </div>
  )
}

export function NurseDashboard() {
  const { patients } = useFacility()
  const admitted = patients.filter((p) => p.status === 'admitted')
  const pending = admitted.filter((p) => !p.checkedToday).length

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Record Temperature</h2>
          <p className="text-sm text-muted-foreground">Log today&apos;s readings and mark each patient checked.</p>
        </div>
        <span className="rounded-md bg-muted px-3 py-1 text-sm text-muted-foreground">
          {pending} pending of {admitted.length}
        </span>
      </div>
      {admitted.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card p-12 text-center">
          <Inbox className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-lg font-medium text-foreground">No patients admitted</p>
          <p className="text-sm text-muted-foreground mt-1">Patients admitted by Admin will appear here for temperature recording.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {admitted.map((p) => (
            <NurseCard key={p.id} patient={p} />
          ))}
        </div>
      )}
    </section>
  )
}
