import { HeartPulse, Skull, BedDouble, Users } from 'lucide-react'
import { useFacility } from '@/lib/store'

function StatCard({ icon: Icon, label, value, sub, tone }) {
  const tones = {
    good: 'text-chart-2',
    bad: 'text-destructive',
    neutral: 'text-primary',
  }
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className={`h-5 w-5 ${tones[tone]}`} />
      </div>
      <p className={`mt-2 text-3xl font-semibold ${tones[tone]}`}>{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  )
}

function Bar({ label, value, total, color }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-foreground">{label}</span>
        <span className="text-muted-foreground">
          {value} ({pct}%)
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

export function HeadDoctorDashboard() {
  const { patients, rooms } = useFacility()

  const discharged = patients.filter((p) => p.status === 'discharged' && p.outcome)
  const recovered = discharged.filter((p) => p.outcome === 'recovered').length
  const deceased = discharged.filter((p) => p.outcome === 'deceased').length
  const totalOutcomes = discharged.length
  const admitted = patients.filter((p) => p.status === 'admitted').length

  const mortalityRate = totalOutcomes ? Math.round((deceased / totalOutcomes) * 100) : 0
  const successRate = totalOutcomes ? Math.round((recovered / totalOutcomes) * 100) : 0

  const occupiedRooms = rooms.filter((r) => r.occupied).length
  const occupancyRate = rooms.length ? Math.round((occupiedRooms / rooms.length) * 100) : 0

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-foreground">Analytics Dashboard</h2>
        <p className="text-sm text-muted-foreground">Facility-wide mortality, success, and occupancy statistics.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={HeartPulse}
          label="Success rate"
          value={`${successRate}%`}
          sub={`${recovered} recovered of ${totalOutcomes} outcomes`}
          tone="good"
        />
        <StatCard
          icon={Skull}
          label="Mortality rate"
          value={`${mortalityRate}%`}
          sub={`${deceased} deceased of ${totalOutcomes} outcomes`}
          tone="bad"
        />
        <StatCard
          icon={BedDouble}
          label="Occupancy"
          value={`${occupancyRate}%`}
          sub={`${occupiedRooms} of ${rooms.length} rooms in use`}
          tone="neutral"
        />
        <StatCard
          icon={Users}
          label="Current patients"
          value={admitted}
          sub="Currently admitted"
          tone="neutral"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-4 font-semibold text-foreground">Patient outcomes</h3>
          <div className="flex flex-col gap-4">
            <Bar label="Recovered" value={recovered} total={totalOutcomes} color="var(--color-chart-2)" />
            <Bar label="Deceased" value={deceased} total={totalOutcomes} color="var(--color-destructive)" />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-4 font-semibold text-foreground">Ward occupancy</h3>
          <div className="flex flex-col gap-4">
            {Array.from(new Set(rooms.map((r) => r.ward))).map((ward) => {
              const wardRooms = rooms.filter((r) => r.ward === ward)
              const occ = wardRooms.filter((r) => r.occupied).length
              return (
                <Bar
                  key={ward}
                  label={ward}
                  value={occ}
                  total={wardRooms.length}
                  color="var(--color-chart-1)"
                />
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
