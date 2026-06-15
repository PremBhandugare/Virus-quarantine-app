import { createContext, useContext, useCallback, useMemo, useState } from 'react'

const FacilityContext = createContext(null)

const TODAY = new Date().toISOString().slice(0, 10)

// ---- Seed data -------------------------------------------------------------

const seedPatients = [
  {
    id: 'P-1024',
    name: 'Aarav Sharma',
    age: 54,
    condition: 'Respiratory infection',
    room: 'A-101',
    admittedDate: '2026-06-09',
    status: 'admitted',
    outcome: null,
    checkedToday: false,
    dischargeApproved: false,
    treatments: [
      { date: '2026-06-10', note: 'Started IV antibiotics. Monitor oxygen saturation.', doctor: 'Dr. Mehta' },
    ],
    temperatures: [
      { date: '2026-06-09', value: 39.4, by: 'Nurse Riya' },
      { date: '2026-06-10', value: 39.1, by: 'Nurse Riya' },
      { date: '2026-06-11', value: 38.6, by: 'Nurse Riya' },
      { date: '2026-06-12', value: 38.2, by: 'Nurse Sam' },
      { date: '2026-06-13', value: 37.8, by: 'Nurse Sam' },
      { date: '2026-06-14', value: 37.5, by: 'Nurse Riya' },
    ],
  },
  {
    id: 'P-1025',
    name: 'Meera Iyer',
    age: 32,
    condition: 'Viral fever',
    room: 'A-102',
    admittedDate: '2026-06-11',
    status: 'admitted',
    outcome: null,
    checkedToday: false,
    dischargeApproved: false,
    treatments: [],
    temperatures: [
      { date: '2026-06-11', value: 38.9, by: 'Nurse Sam' },
      { date: '2026-06-12', value: 38.4, by: 'Nurse Sam' },
      { date: '2026-06-13', value: 38.0, by: 'Nurse Riya' },
      { date: '2026-06-14', value: 37.6, by: 'Nurse Riya' },
    ],
  },
  {
    id: 'P-1026',
    name: 'Daniel Cruz',
    age: 67,
    condition: 'Pneumonia',
    room: 'B-201',
    admittedDate: '2026-06-12',
    status: 'admitted',
    outcome: null,
    checkedToday: false,
    dischargeApproved: false,
    treatments: [
      { date: '2026-06-13', note: 'Oxygen therapy. Re-evaluate in 48h.', doctor: 'Dr. Mehta' },
    ],
    temperatures: [
      { date: '2026-06-12', value: 39.8, by: 'Nurse Sam' },
      { date: '2026-06-13', value: 39.5, by: 'Nurse Riya' },
      { date: '2026-06-14', value: 39.6, by: 'Nurse Sam' },
      { date: '2026-06-15', value: 39.3, by: 'Nurse Riya' },
    ],
  },
  {
    id: 'P-1019',
    name: 'Sofia Rossi',
    age: 41,
    condition: 'Recovered - influenza',
    room: '-',
    admittedDate: '2026-06-01',
    status: 'discharged',
    outcome: 'recovered',
    checkedToday: false,
    dischargeApproved: true,
    treatments: [
      { date: '2026-06-03', note: 'Antiviral course completed.', doctor: 'Dr. Mehta' },
    ],
    temperatures: [
      { date: '2026-06-01', value: 39.0, by: 'Nurse Sam' },
      { date: '2026-06-03', value: 38.0, by: 'Nurse Sam' },
      { date: '2026-06-05', value: 37.0, by: 'Nurse Riya' },
    ],
  },
  {
    id: 'P-1012',
    name: 'James Okoro',
    age: 73,
    condition: 'Severe pneumonia',
    room: '-',
    admittedDate: '2026-05-28',
    status: 'discharged',
    outcome: 'deceased',
    checkedToday: false,
    dischargeApproved: true,
    treatments: [
      { date: '2026-05-30', note: 'Critical care, ventilator support.', doctor: 'Dr. Mehta' },
    ],
    temperatures: [
      { date: '2026-05-28', value: 40.1, by: 'Nurse Sam' },
      { date: '2026-05-30', value: 40.4, by: 'Nurse Riya' },
    ],
  },
  {
    id: 'P-1008',
    name: 'Lena Müller',
    age: 29,
    condition: 'Recovered - dengue',
    room: '-',
    admittedDate: '2026-05-20',
    status: 'discharged',
    outcome: 'recovered',
    checkedToday: false,
    dischargeApproved: true,
    treatments: [],
    temperatures: [
      { date: '2026-05-20', value: 38.7, by: 'Nurse Sam' },
      { date: '2026-05-23', value: 37.2, by: 'Nurse Riya' },
    ],
  },
]

const seedRooms = [
  { id: 'A-101', ward: 'General A' },
  { id: 'A-102', ward: 'General A' },
  { id: 'A-103', ward: 'General A' },
  { id: 'B-201', ward: 'ICU B' },
  { id: 'B-202', ward: 'ICU B' },
  { id: 'B-203', ward: 'ICU B' },
  { id: 'C-301', ward: 'Isolation C' },
  { id: 'C-302', ward: 'Isolation C' },
]

// ---- Helper: derive room occupancy from patients ---------------------------
function deriveRooms(baseRooms, patients) {
  const occupiedRoomIds = new Set(
    patients
      .filter((p) => p.status === 'admitted' && p.room && p.room !== '-')
      .map((p) => p.room)
  )
  return baseRooms.map((r) => ({
    ...r,
    occupied: occupiedRoomIds.has(r.id),
  }))
}

// ---- Patient ID counter ----------------------------------------------------
let nextId = 1027

// ---- Provider --------------------------------------------------------------

export function FacilityProvider({ children }) {
  const [patients, setPatients] = useState(seedPatients)
  const [baseRooms] = useState(seedRooms)

  // Rooms are DERIVED from patient data — always in sync
  const rooms = useMemo(() => deriveRooms(baseRooms, patients), [baseRooms, patients])

  // Nurse actions
  const addTemperature = useCallback((patientId, value) => {
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId
          ? {
              ...p,
              checkedToday: true,
              temperatures: [
                ...p.temperatures.filter((t) => t.date !== TODAY),
                { date: TODAY, value: Number(value), by: 'Nurse Riya' },
              ],
            }
          : p,
      ),
    )
  }, [])

  const markChecked = useCallback((patientId) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, checkedToday: true } : p)),
    )
  }, [])

  // Doctor actions
  const addTreatment = useCallback((patientId, note) => {
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId
          ? { ...p, treatments: [...p.treatments, { date: TODAY, note, doctor: 'Dr. Mehta' }] }
          : p,
      ),
    )
  }, [])

  const approveDischarge = useCallback((patientId) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, dischargeApproved: true } : p)),
    )
  }, [])

  // Admin actions
  const admitPatient = useCallback(({ name, age, condition, room }) => {
    const id = `P-${nextId++}`
    setPatients((prev) => [
      {
        id,
        name,
        age: Number(age),
        condition,
        room,
        admittedDate: TODAY,
        status: 'admitted',
        outcome: null,
        checkedToday: false,
        dischargeApproved: false,
        treatments: [],
        temperatures: [],
      },
      ...prev,
    ])
    // Room occupancy is derived automatically — no need to setRooms
  }, [])

  const dischargePatient = useCallback((patientId, outcome) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p
        // Set status to discharged and clear room — room occupancy auto-updates
        return { ...p, status: 'discharged', outcome, room: '-' }
      }),
    )
  }, [])

  // toggleRoom is no longer needed since rooms derive from patients.
  // Instead, we provide a no-op or remove it. We'll keep it as info-only.
  const toggleRoom = useCallback(() => {
    // Room availability is now fully derived from patient assignments.
    // Toggling manually is disabled to prevent data inconsistency.
  }, [])

  const value = useMemo(
    () => ({
      today: TODAY,
      patients,
      rooms,
      addTemperature,
      markChecked,
      addTreatment,
      approveDischarge,
      admitPatient,
      dischargePatient,
      toggleRoom,
    }),
    [patients, rooms, addTemperature, markChecked, addTreatment, approveDischarge, admitPatient, dischargePatient, toggleRoom],
  )

  return <FacilityContext.Provider value={value}>{children}</FacilityContext.Provider>
}

export function useFacility() {
  const ctx = useContext(FacilityContext)
  if (!ctx) throw new Error('useFacility must be used within FacilityProvider')
  return ctx
}
