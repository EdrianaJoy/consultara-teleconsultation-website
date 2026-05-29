import { redirect } from "next/navigation";

type AppointmentPageProps = {
  params: Promise<{ id: string }> | { id: string };
};

export default async function PatientAppointmentRedirectPage({ params }: AppointmentPageProps) {
  const resolvedParams = await params;
  redirect(`/patient/consultation/${resolvedParams.id}`);
}