import { NextResponse } from "next/server";
import { consultaraDb } from "@/lib/server/consultara-db";
import { doctors as seedDoctors } from "@/lib/data";
import { getDoctorPortraitForKey } from "@/lib/doctor-avatars";

export async function GET() {
  const dbDoctors = consultaraDb.getDoctors();
  const combined = new Map<string, typeof seedDoctors[number]>();

  const getDoctorKey = (doctor: typeof seedDoctors[number]) => {
    const firstName = doctor.firstName.trim().toLowerCase();
    const lastName = doctor.lastName.trim().toLowerCase();
    const department = doctor.department.trim().toLowerCase();
    return `${firstName}|${lastName}|${department}`;
  };

  seedDoctors.forEach((doctor) => {
    combined.set(getDoctorKey(doctor), doctor);
  });

  dbDoctors.forEach((doctor) => {
    combined.set(getDoctorKey(doctor), doctor);
  });

  const normalized = Array.from(combined.values()).map((doctor) => ({
    ...doctor,
    avatar: doctor.avatar || getDoctorPortraitForKey(doctor.id),
  }));

  return NextResponse.json({ doctors: normalized });
}
