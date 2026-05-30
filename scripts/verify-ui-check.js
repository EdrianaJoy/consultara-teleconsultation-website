(async () => {
  try {
    const base = 'http://127.0.0.1:3000';
    const s = await fetch(`${base}/api/state`);
    const st = await s.json();
    const doctorsRes = await fetch(`${base}/api/doctors`);
    const doctorsPayload = await doctorsRes.json();
    const doctors = doctorsPayload.doctors || [];

    if (!st.appointments || st.appointments.length === 0) {
      console.log('No appointments in app state');
      return;
    }

    // Use the first appointment's patientId as the target patient
    const patientId = st.appointments[0].patientId;
    const raw = st.appointments.filter(a => a.patientId === patientId);

    const byKey = new Map();
    for (const apt of raw) {
      if (apt.status === 'cancelled') continue;
      const key = `${apt.doctorId}|${apt.consultationType}|${apt.reason || ''}`;
      const existing = byKey.get(key);
      if (!existing) {
        byKey.set(key, apt);
        continue;
      }
      const existingUpdated = new Date(existing.updatedAt || existing.createdAt).getTime();
      const candidateUpdated = new Date(apt.updatedAt || apt.createdAt).getTime();
      if (candidateUpdated >= existingUpdated) {
        byKey.set(key, apt);
      }
    }

    const deduped = Array.from(byKey.values()).sort((a, b) => (a.date > b.date ? 1 : a.date < b.date ? -1 : 0));

    console.log(`Patient ${patientId} — raw: ${raw.length}, deduped: ${deduped.length}`);
    console.log('Deduped appointments:');
    for (const a of deduped) {
      const doc = doctors.find(d => d.id === a.doctorId);
      console.log(`- ${a.id} | ${doc ? doc.firstName + ' ' + doc.lastName : a.doctorId} | ${a.date} ${a.timeSlot?.startTime || ''} | status:${a.status}`);
    }
  } catch (err) {
    console.error('Verification script failed:', err);
    process.exit(1);
  }
})();
