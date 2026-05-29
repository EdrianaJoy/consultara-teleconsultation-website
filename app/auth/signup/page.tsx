import SignUpForm from '@/components/auth/signup-form';

type SignUpPageProps = {
  searchParams?: Promise<{
    role?: string | string[];
  }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
  const roleParam = Array.isArray(resolvedSearchParams.role)
    ? resolvedSearchParams.role[0]
    : resolvedSearchParams.role;
  const initialRole = roleParam === 'patient' || roleParam === 'doctor' ? roleParam : undefined;

  return <SignUpForm initialRole={initialRole} />;
}
