(async () => {
  try {
    const base = process.env.BASE_URL || 'http://127.0.0.1:3001';
    console.log('Base URL:', base);
    const res = await fetch(`${base}/api/doctors`);
    const payload = await res.json();
    const doctors = payload.doctors || [];
    if (!doctors.length) {
      console.log('No doctors found from API');
      process.exit(0);
    }

    const DEFAULT_PASSWORD = 'Consultara123!';

    for (const doc of doctors) {
      // Try sign-in first to check if user exists
      const signin = await fetch(`${base}/api/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'signin', email: doc.email, password: DEFAULT_PASSWORD }),
      });
      const signinBody = await signin.json().catch(() => ({}));
      if (signinBody && signinBody.success) {
        console.log(`User exists for ${doc.email}`);
        continue;
      }

      // Register the doctor (signup + completeRegistration)
      console.log(`Registering doctor: ${doc.email}`);
      const reg = await fetch(`${base}/api/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          email: doc.email,
          password: DEFAULT_PASSWORD,
          role: 'doctor',
          profileData: {
            firstName: doc.firstName,
            lastName: doc.lastName,
            email: doc.email,
            phone: doc.phone || '',
            specialization: doc.specialization || '',
            department: doc.department || 'general-medicine',
            licenseNumber: doc.licenseNumber || '',
            yearsOfExperience: doc.yearsOfExperience || 0,
            education: doc.education || '',
            bio: doc.bio || '',
            consultationFee: doc.consultationFee || 0,
            availability: doc.availability || {},
            languages: doc.languages || [],
            location: doc.location || '',
          }
        }),
      });

      const rb = await reg.json().catch(() => ({}));
      if (rb && rb.success) {
        console.log(`Registered ${doc.email} OK`);
      } else {
        console.warn(`Failed to register ${doc.email}:`, rb);
      }
    }

    console.log('Seed doctor registration complete');
    process.exit(0);
  } catch (err) {
    console.error('Failed to ensure seed doctors:', err);
    process.exit(1);
  }
})();
