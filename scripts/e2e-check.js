/*
 * Clean E2E script
 * Flow:
 * 1) Get a doctor from /api/doctors
 * 2) Register a patient (register)
 * 3) Patient creates appointment
 * 4) Doctor signs in and adds a medical record for that appointment
 * 5) Patient fetches state and verifies the medical record exists
 * 6) Patient reschedules the appointment
 * 7) Patient cancels the appointment and we verify the medical record is pruned
 */
(async () => {
  try {
    const base = process.env.BASE_URL || 'http://127.0.0.1:3001';
    const unique = Math.random().toString(36).slice(2, 8);
    const email = `e2e-patient-${unique}@example.com`;
    const password = 'TestPass123!';
    const DEV_PASSWORD = 'Consultara123!';

    console.log('Base URL:', base);

    // 1) Fetch doctors
    const doctorsRes = await fetch(`${base}/api/doctors`);
    const { doctors } = await doctorsRes.json();
    if (!doctors || doctors.length === 0) throw new Error('No doctors available for testing');
    const doctor = doctors[0];
    console.log('Using doctor:', doctor.id, doctor.firstName, doctor.lastName, doctor.email);

    // 2) Register patient
    const registerRes = await fetch(`${base}/api/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', email, password, role: 'patient', profileData: { firstName: 'E2E', lastName: unique, email } }),
    });
    const registerBody = await registerRes.json();
    if (!registerBody || !registerBody.user) {
      console.error('Register failed:', registerBody);
      process.exit(2);
    }

    // derive cookie
    let patientCookie = '';
    const setCookie = registerRes.headers.get('set-cookie');
    if (setCookie) {
      const m = setCookie.match(/consultara_session=([^;]+);?/);
      if (m) patientCookie = `consultara_session=${m[1]}`;
    }
    if (!patientCookie && registerBody.user && registerBody.user.id) {
      patientCookie = `consultara_session=${registerBody.user.id}`;
    }

    const patientProfileId = registerBody.patientProfile?.id || registerBody.user?.id;
    console.log('Registered patient:', registerBody.user?.id, 'profile:', patientProfileId);

    // 3) Create appointment
    const date = new Date(); date.setDate(date.getDate() + 3);
    const appointment = {
      patientId: patientProfileId,
      doctorId: doctor.id,
      date: date.toISOString().slice(0,10),
      timeSlot: { startTime: '09:00', endTime: '09:30' },
      consultationType: 'video',
      status: 'confirmed',
      symptoms: 'E2E booking',
    };

    const createRes = await fetch(`${base}/api/state`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: patientCookie },
      body: JSON.stringify({ resource: 'appointments', action: 'create', appointment }),
    });
    const createBody = await createRes.json();
    if (!createBody.appointment) { console.error('Appointment create failed', createBody); process.exit(3); }
    console.log('Created appointment', createBody.appointment.id);

    // 4) Doctor sign in
    const doctorSigninRes = await fetch(`${base}/api/session`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'signin', email: doctor.email, password: DEV_PASSWORD }),
    });
    const doctorSigninBody = await doctorSigninRes.json();
    if (!doctorSigninBody || !doctorSigninBody.user) { console.error('Doctor signin failed', doctorSigninBody); process.exit(4); }
    let doctorCookie = '';
    const setCookieDoc = doctorSigninRes.headers.get('set-cookie');
    if (setCookieDoc) { const m = setCookieDoc.match(/consultara_session=([^;]+);?/); if (m) doctorCookie = `consultara_session=${m[1]}`; }
    if (!doctorCookie && doctorSigninBody.user && doctorSigninBody.user.id) doctorCookie = `consultara_session=${doctorSigninBody.user.id}`;
    console.log('Doctor signed in:', doctorSigninBody.user.id);

    // 5) Doctor adds medical record for the appointment
    const mr = {
      patientId: patientProfileId,
      consultationId: createBody.appointment.id,
      doctorId: doctor.id,
      doctorName: `${doctor.firstName} ${doctor.lastName}`,
      date: new Date().toISOString().slice(0,10),
      diagnosis: 'E2E diagnosis by doctor',
      symptoms: [],
      treatment: 'E2E treatment',
    };
    const addMrRes = await fetch(`${base}/api/state`, { method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: doctorCookie }, body: JSON.stringify({ resource: 'medicalRecords', action: 'add', record: mr }) });
    const addMrBody = await addMrRes.json();
    if (!addMrBody.record) { console.error('Add medical record failed', addMrBody); process.exit(5); }
    console.log('Doctor added medical record', addMrBody.record.id);

    // 6) Patient fetches state and verifies medical record exists
    const patientStateRes = await fetch(`${base}/api/state`, { headers: { Cookie: patientCookie } });
    const patientState = await patientStateRes.json();
    const found = (patientState.medicalRecords || []).find(r => r.id === addMrBody.record.id || r.consultationId === createBody.appointment.id);
    if (!found) { console.error('Patient cannot find medical record in state'); process.exit(6); }
    console.log('Patient can see medical record');

    // 7) Patient reschedules appointment
    const resDate = new Date(); resDate.setDate(resDate.getDate() + 5);
    const resRes = await fetch(`${base}/api/state`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Cookie: patientCookie }, body: JSON.stringify({ resource: 'appointments', action: 'update', id: createBody.appointment.id, updates: { date: resDate.toISOString().slice(0,10), timeSlot: { startTime: '10:00', endTime: '10:30' }, status: 'confirmed' } }) });
    const resBody = await resRes.json(); console.log('Reschedule result keys:', Object.keys(resBody));

    // 8) Patient cancels appointment
    const cancelRes = await fetch(`${base}/api/state`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Cookie: patientCookie }, body: JSON.stringify({ resource: 'appointments', action: 'update', id: createBody.appointment.id, updates: { status: 'cancelled' } }) });
    const cancelBody = await cancelRes.json(); console.log('Cancel result keys:', Object.keys(cancelBody));

    // 9) After cancel, patient state should not include the medical record (pruned)
    const postCancelStateRes = await fetch(`${base}/api/state`, { headers: { Cookie: patientCookie } });
    const postCancelState = await postCancelStateRes.json();
    const stillFound = (postCancelState.medicalRecords || []).find(r => r.id === addMrBody.record.id);
    if (stillFound) { console.error('Medical record still present after cancellation (unexpected)'); process.exit(7); }
    console.log('Medical record pruned after cancellation as expected');

    console.log('E2E completed successfully'); process.exit(0);
  } catch (err) { console.error('E2E failed:', err); process.exit(1); }
})();
