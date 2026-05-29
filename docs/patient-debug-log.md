# Patient-Side Debug Log

Date: 2026-05-29

## Scope
- Align fixes with technical expectations (web, responsive, TypeScript).
- Preserve required patient and doctor modules.

## Fixes Applied
1) Emergency contact formatting and expanded medical info
- Added separate emergency contact phone field and format placeholder.
- Expanded medical info to include weight, height, allergies, conditions, medications, and basic medical history.

2) Profile photo upload
- Added client-side image upload with preview and save to profile.

3) Notifications
- Added patient and doctor notifications pages.
- Added patient sidebar link for notifications.
- Fixed header unread logic to use isRead flags.

4) Contact page alignment
- Updated patient contact info to match main landing page details.

5) Booking flow and records
- Booking now adds a medical record entry immediately.
- Booking creates a conversation and sends an automatic doctor message.
- Booking success buttons spaced and styled with distinct colors.

6) Availability and scheduling
- Doctors now have varied weekly availability in data.
- Time slots respect doctor availability and block past times.
- Added reschedule action in the patient calendar.

7) Doctor search visibility
- Patient search/services pages load doctors from the API so new doctor accounts appear.
- Doctor profile page also loads from the API to avoid not-found errors.

8) Consulty adjustments
- Prevented duplicate messages (strict mode and rapid submissions).
- Improved recommended doctor specialization visibility.
- Replaced robot image with transparent PNG to remove black background.

9) Consultation fee rules
- Patient-facing fees now compute as max(500, yearsOfExperience * 100).

10) Consulty response formatting
- Rephrased symptom summaries (e.g., "my back hurts" → "back pain").
- Removed markdown asterisks and bolded department name in UI.

11) Doctor uniqueness and hook error
- Ensured unique doctor avatars and names in data and API response.
- Fixed hook count error on doctor profile by removing conditional useMemo.

## Notes
- All fixes retain required patient and doctor module capabilities.
- No backend schema changes required for these updates.
