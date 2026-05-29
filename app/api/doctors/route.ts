import { NextResponse } from "next/server";
import { consultaraDb } from "@/lib/server/consultara-db";
import { doctors as seedDoctors } from "@/lib/data";

export async function GET() {
  const dbDoctors = consultaraDb.getDoctors();
  const combined = new Map<string, typeof seedDoctors[number]>();

  seedDoctors.forEach((doctor) => {
    combined.set(doctor.id, doctor);
  });

  dbDoctors.forEach((doctor) => {
    combined.set(doctor.id, doctor);
  });

  const doctors = Array.from(combined.values());
  const usedNames = new Set<string>();
  const usedAvatars = new Set<string>();

  const normalized = doctors.map((doctor, index) => {
    let firstName = doctor.firstName;
    let lastName = doctor.lastName;
    const baseName = `${firstName} ${lastName}`.trim();

    if (usedNames.has(baseName)) {
      lastName = `${lastName} ${index + 1}`;
    }

    const nameKey = `${firstName} ${lastName}`.trim();
    usedNames.add(nameKey);

    // Prefer local professional avatar for each doctor
    const localAvatar = `/professional-doctors/${doctor.id}.svg`;
    let avatar = localAvatar || doctor.avatar;
    if (!avatar || usedAvatars.has(avatar)) {
      avatar = doctor.avatar || `https://i.pravatar.cc/150?img=${(index % 70) + 1}`;
    }

    usedAvatars.add(avatar);

    return {
      ...doctor,
      firstName,
      lastName,
      avatar,
    };
  });

  return NextResponse.json({ doctors: normalized });
}
