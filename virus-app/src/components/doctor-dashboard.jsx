import { useState } from 'react'
import { TrendingDown, TrendingUp, FileText, BadgeCheck, Inbox } from 'lucide-react'
import { useFacility } from '@/lib/store'
import { TemperatureChart } from '@/components/temperature-chart'

function trend(temps) {
  if (temps.length < 2) return { dir: 'flat', diff: 0 }
  const diff = temps[temps.length - 1].value - temps[0].value
  return { dir: diff < -0.1 ? 'down' : diff > 0.1 ? 'up' : 'flat', diff }
}

function DoctorCard({ patient }) {
  const { addTreatment, approveDischarge } = useFacility()
  const [note, setNote] = useState('')
  const t = trend(patient.temperatures)

  const submit = (e) => {
    e.preventDefault()
    if (!note.trim()) return
    addTreatment(patient.id, note.trim())
    setNote('')
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-foreground">{patient.name}</p>
          <p className="text-xs text-muted-foreground">
            {patient.id} · {patient.age}y · Room {patient.room} · {patient.condition}
          </p>
        </div>
        {t.dir === 'down' ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-chart-2/15 px-2 py-1 text-xs font-medium text-chart-2">
            <TrendingDown className="h-3 w-3" /> Improving
          </span>
        ) : t.dir === 'up' ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">
            <TrendingUp className="h-3 w-3" /> Worsening
          </span>
        ) : (
          <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">Stable</span>
        )}
      </div>

      <div className="mt-3 rounded-md border border-border bg-background p-2">
        <p className="mb-1 text-xs font-medium text-muted-foreground">Temperature trend</p>
        <TemperatureChart data={patient.temperatures} />
      </div>

      <div className="mt-3">
        <p className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <FileText className="h-3 w-3" /> Treatment history
        </p>
        {patient.treatments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No treatments recorded.</p>
        ) : (
          <ul className="space-y-1">
            {patient.treatments.map((tr, i) => (
              <li key={i} className="rounded-md bg-muted/60 px-2 py-1 text-sm text-foreground">
                <span className="text-xs text-muted-foreground">{tr.date} · {tr.doctor}</span>
                <br />
                {tr.note}
              </li>
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={submit} className="mt-3 flex flex-col gap-2">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Provide treatment / notes..."
          className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          aria-label={`Treatment note for ${patient.name}`}
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Save treatment
          </button>
          <button
            type="button"
            onClick={() => approveDischarge(patient.id)}
            disabled={patient.dischargeApproved}
            className={`flex flex-1 items-center justify-center gap-1 rounded-md px-3 py-2 text-sm font-medium ${
              patient.dischargeApproved
                ? 'cursor-default bg-chart-2/15 text-chart-2'
                : 'border border-border bg-secondary text-secondary-foreground hover:bg-secondary/70'
            }`}
          >
            <BadgeCheck className="h-4 w-4" />
            {patient.dischargeApproved ? 'Discharge approved' : 'Approve discharge'}
          </button>
        </div>
      </form>
    </div>
  )
}

export function DoctorDashboard() {
  const { patients } = useFacility()
  const admitted = patients.filter((p) => p.status === 'admitted')

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-foreground">Review Patient History</h2>
        <p className="text-sm text-muted-foreground">
          View temperature trends, provide treatment, and approve discharges.
        </p>
      </div>
      {admitted.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card p-12 text-center">
          <Inbox className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-lg font-medium text-foreground">No patients to review</p>
          <p className="text-sm text-muted-foreground mt-1">Patients admitted by Admin will appear here for review and treatment.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {admitted.map((p) => (
            <DoctorCard key={p.id} patient={p} />
          ))}
        </div>
      )}
    </section>
  )
}
